import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Team, User, Invitation, Message } from '@/lib/models';
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

// Helper function to transform team data
function transformTeam(team) {
  return {
    id: team._id.toString(),
    nome: team.nome,
    descricao: team.descricao,
    cor1: team.cor1,
    cor2: team.cor2,
    imagem: team.imagem || '/time_padrao.png', // Retorna a imagem padrão se não houver
    captainId: team.captainId?._id?.toString() || team.captainId?.toString(),
    captainName: team.captainId?.nomeCompleto || 'N/A',
    members: team.members?.map(member => ({
      userId: member.userId?._id?.toString() || member.userId?.toString(),
      nomeCompleto: member.userId?.nomeCompleto || 'N/A',
      posicao: member.position,
      pernaDominante: member.userId?.pernaDominante || '',
      jerseyNumber: member.jerseyNumber
    })) || [],
    memberCount: team.members?.length || 0,
    maxMembers: team.maxMembers || 15,
    isRegistered: team.isRegistered || false,
    createdAt: team.createdAt
  };
}

// GET team by ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const team = await Team.findById(id)
      .populate('captainId', 'nomeCompleto email')
      .populate('members.userId', 'nomeCompleto posicao pernaDominante numeroCamisa')
      .lean();

    if (!team || !team.isActive) {
      return NextResponse.json(
        { error: 'Time não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      team: transformTeam(team)
    }, { status: 200 });

  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT update team
export async function PUT(request, { params }) {
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

    const { id } = params;

    // Find team
    const team = await Team.findById(id);
    if (!team || !team.isActive) {
      return NextResponse.json(
        { error: 'Time não encontrado' },
        { status: 404 }
      );
    }

    // Check if user is the captain
    if (team.captainId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Apenas a capitã do time pode atualizar' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { nome, descricao, cor1, cor2, imagem } = body;

    // Update fields
    if (nome !== undefined) {
      // Check if name is already taken by another ACTIVE team
      const teamWithSameName = await Team.findOne({ 
        nome, 
        _id: { $ne: id },
        isActive: true 
      });
      if (teamWithSameName) {
        return NextResponse.json(
          { error: 'Nome do time já está em uso' },
          { status: 400 }
        );
      }
      team.nome = nome;
    }
    if (descricao !== undefined) team.descricao = descricao;
    if (cor1 !== undefined) team.cor1 = cor1;
    if (cor2 !== undefined) team.cor2 = cor2;
    
    // Trata a imagem
    if (imagem !== undefined) {
      if (imagem === null || imagem === '' || imagem === '/time-feminino.png') {
        team.imagem = '/time_padrao.png';
      } else if (imagem.startsWith('data:image')) {
        team.imagem = imagem; // Base64
      } else {
        team.imagem = imagem; // Outra URL válida
      }
    }

    await team.save();

    // Populate team data
    await team.populate('captainId', 'nomeCompleto email');
    await team.populate('members.userId', 'nomeCompleto posicao pernaDominante numeroCamisa');

    return NextResponse.json({
      success: true,
      message: 'Time atualizado com sucesso',
      team: transformTeam(team)
    }, { status: 200 });

  } catch (error) {
    console.error('Update team error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Dados inválidos', details: errors },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Nome do time já está em uso' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE team (soft delete)
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

    const { id } = params;

    // Find team
    const team = await Team.findById(id);
    if (!team || !team.isActive) {
      return NextResponse.json(
        { error: 'Time não encontrado' },
        { status: 404 }
      );
    }

    // Check if user is the captain
    if (team.captainId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Apenas a capitã do time pode excluir' },
        { status: 403 }
      );
    }

    console.log(`Deletando time: ${team.nome} (ID: ${id})`);

    // Remove teamId from all members
    const updateResult = await User.updateMany(
      { teamId: team._id },
      { $set: { teamId: null, isTeamCaptain: false } }
    );

    console.log(`${updateResult.modifiedCount} membros removidos do time`);

    // Remove related invitations and messages
    const [invitationResult, messageResult] = await Promise.all([
      Invitation.deleteMany({ teamId: team._id }),
      Message.deleteMany({ teamId: team._id })
    ]);

    console.log(`${invitationResult.deletedCount} convites removidos`);
    console.log(`${messageResult.deletedCount} mensagens removidas`);

    // Delete the team document
    await Team.deleteOne({ _id: team._id });

    console.log(`Time ${team.nome} removido do banco de dados`);

    return NextResponse.json({
      success: true,
      message: 'Time excluído com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete team error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

