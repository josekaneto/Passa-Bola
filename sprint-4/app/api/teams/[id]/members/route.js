import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Team, User } from '@/lib/models';
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
  } catch (error) {
    return null;
  }
}

// POST add member to team
export async function POST(request, { params }) {
  try {
    // Verify authentication
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token de acesso não fornecido ou inválido' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id: teamId } = params;

    // Get request body
    const body = await request.json();
    const { nomeCompleto, posicao, pernaDominante, jerseyNumber } = body;

    // Validate required fields
    if (!nomeCompleto || !posicao) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nomeCompleto, posicao' },
        { status: 400 }
      );
    }

    // Validate pernaDominante if provided
    if (pernaDominante && !['Direita', 'Esquerda'].includes(pernaDominante)) {
      return NextResponse.json(
        { error: 'Perna dominante deve ser "Direita" ou "Esquerda"' },
        { status: 400 }
      );
    }

    // Find team
    const team = await Team.findById(teamId);
    if (!team || !team.isActive) {
      return NextResponse.json(
        { error: 'Time não encontrado' },
        { status: 404 }
      );
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return NextResponse.json(
        { error: 'Time está completo' },
        { status: 400 }
      );
    }

    // Check if user is captain (only captain can add members)
    if (team.captainId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Apenas a capitã do time pode adicionar membros' },
        { status: 403 }
      );
    }

    // Try to find existing user by nomeCompleto
    let memberUser = await User.findOne({ nomeCompleto: nomeCompleto });
    
    // If user doesn't exist, create a basic user entry for the player
    // Note: In a production system, you might want to require email/registration
    if (!memberUser) {
      // Generate a unique email for temporary users
      let tempEmail = `${nomeCompleto.toLowerCase().replace(/\s+/g, '.')}@temp.com`;
      let counter = 1;
      while (await User.findOne({ email: tempEmail })) {
        tempEmail = `${nomeCompleto.toLowerCase().replace(/\s+/g, '.')}${counter}@temp.com`;
        counter++;
      }
      
      // Create a temporary user entry (you might want to require email/registration in production)
      memberUser = new User({
        nomeCompleto: nomeCompleto,
        dataNascimento: '2000-01-01', // Default, should be updated
        email: tempEmail,
        telefone: '0000000000', // Default
        nomeCamisa: nomeCompleto.split(' ')[0], // First name
        numeroCamisa: jerseyNumber || team.members.length + 1,
        altura: 160, // Default
        peso: 60, // Default
        posicao: posicao,
        pernaDominante: pernaDominante || 'Direita',
        senha: 'temp123' // Temporary password, should be changed
      });
      await memberUser.save();
    }

    // Check if user is already a member
    const existingMember = team.members.find(
      member => member.userId && member.userId.toString() === memberUser._id.toString()
    );
    if (existingMember) {
      return NextResponse.json(
        { error: 'Jogadora já é membro deste time' },
        { status: 400 }
      );
    }

    // Add member to team
    team.members.push({
      userId: memberUser._id,
      position: posicao,
      jerseyNumber: jerseyNumber || team.members.length + 1
    });

    await team.save();

    // Update user's teamId
    await User.findByIdAndUpdate(memberUser._id, {
      teamId: team._id
    });

    // Populate team data
    await team.populate('captainId', 'nomeCompleto email');
    await team.populate('members.userId', 'nomeCompleto posicao pernaDominante numeroCamisa');

    return NextResponse.json({
      success: true,
      message: 'Membro adicionado com sucesso',
      team: {
        id: team._id.toString(),
        nome: team.nome,
        members: team.members.map(member => ({
          userId: member.userId?._id?.toString() || member.userId?.toString(),
          nomeCompleto: member.userId?.nomeCompleto || 'N/A',
          posicao: member.position,
          pernaDominante: member.userId?.pernaDominante || '',
          jerseyNumber: member.jerseyNumber
        })),
        memberCount: team.members.length
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE remove member from team
export async function DELETE(request, { params }) {
  try {
    // Verify authentication
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token de acesso não fornecido ou inválido' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id: teamId } = params;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId') || decoded.userId; // Default to removing self

    // Find team
    const team = await Team.findById(teamId);
    if (!team || !team.isActive) {
      return NextResponse.json(
        { error: 'Time não encontrado' },
        { status: 404 }
      );
    }

    // Check if user is captain or the member themselves
    const isCaptain = team.captainId.toString() === decoded.userId;
    const isRemovingSelf = memberId === decoded.userId;

    if (!isCaptain && !isRemovingSelf) {
      return NextResponse.json(
        { error: 'Apenas a capitã pode remover outros membros' },
        { status: 403 }
      );
    }

    // Prevent captain from removing themselves
    if (isRemovingSelf && isCaptain) {
      return NextResponse.json(
        { error: 'A capitã não pode remover a si mesma. Transfira a capitania primeiro.' },
        { status: 400 }
      );
    }

    // Remove member
    team.members = team.members.filter(
      member => member.userId && member.userId.toString() !== memberId
    );

    await team.save();

    // Update user's teamId
    await User.findByIdAndUpdate(memberId, {
      $set: { teamId: null, isTeamCaptain: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Membro removido com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

