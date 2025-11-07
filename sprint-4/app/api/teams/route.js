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

// GET all teams
export async function GET(request) {
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

    const teams = await Team.find({ isActive: true })
      .populate('captainId', 'nomeCompleto email')
      .populate('members.userId', 'nomeCompleto posicao pernaDominante numeroCamisa')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      teams: teams.map(team => transformTeam(team))
    }, { status: 200 });

  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST create new team
export async function POST(request) {
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

    const body = await request.json();
    const { nome, descricao, cor1, cor2, imagem } = body;

    // Validate required fields
    if (!nome || !descricao) {
      return NextResponse.json(
        { error: 'Nome e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    // Check if user already has a team
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (user.teamId) {
      return NextResponse.json(
        { error: 'Você já está em um time' },
        { status: 400 }
      );
    }

    // Check if team name already exists
    const existingTeam = await Team.findOne({ nome, isActive: true });
    if (existingTeam) {
      return NextResponse.json(
        { error: 'Nome do time já está em uso' },
        { status: 400 }
      );
    }

    // Determina a imagem a ser salva
    let teamImage = '/time_padrao.png'; // Padrão
    
    if (imagem) {
      // Se a imagem for base64, salva como está
      if (imagem.startsWith('data:image')) {
        teamImage = imagem;
      }
      // Se for uma string vazia ou inválida, usa o padrão
      else if (imagem.trim() === '' || imagem === '/time-feminino.png') {
        teamImage = '/time_padrao.png';
      }
      // Caso contrário, usa o que foi enviado
      else {
        teamImage = imagem;
      }
    }

    // Create team
    const team = await Team.create({
      nome,
      descricao,
      cor1: cor1 || '#8B5CF6',
      cor2: cor2 || '#EC4899',
      imagem: teamImage, // Salva a imagem tratada
      captainId: user._id,
      members: [{
        userId: user._id,
        position: user.posicao || 'Não definida',
        jerseyNumber: user.numeroCamisa || null
      }],
      isActive: true
    });

    // Update user
    user.teamId = team._id;
    user.isTeamCaptain = true;
    await user.save();

    // Populate team data
    await team.populate('captainId', 'nomeCompleto email');
    await team.populate('members.userId', 'nomeCompleto posicao pernaDominante numeroCamisa');

    return NextResponse.json({
      success: true,
      message: 'Time criado com sucesso',
      team: transformTeam(team)
    }, { status: 201 });

  } catch (error) {
    console.error('Create team error:', error);
    
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

