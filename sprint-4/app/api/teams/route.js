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

// GET all teams
export async function GET(request) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const captainId = searchParams.get('captainId');

    // Build query
    const query = { isActive: true };
    if (captainId) {
      query.captainId = captainId;
    }

    // Find teams
    const teams = await Team.find(query)
      .populate('captainId', 'nomeCompleto email')
      .populate('members.userId', 'nomeCompleto posicao pernaDominante numeroCamisa')
      .sort({ createdAt: -1 })
      .lean();

    // Transform teams to match frontend format
    const transformedTeams = teams.map(team => ({
      id: team._id.toString(),
      nome: team.nome,
      descricao: team.descricao,
      cor1: team.cor1,
      cor2: team.cor2,
      imagem: team.imagem || '/time-padrao.png',
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
    }));

    return NextResponse.json({
      success: true,
      teams: transformedTeams
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

    // Get request body
    const body = await request.json();
    const { nome, descricao, cor1, cor2, imagem } = body;

    // Validate required fields
    if (!nome || !descricao || !cor1 || !cor2) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, descricao, cor1, cor2' },
        { status: 400 }
      );
    }

    // Check if user already has a team
    const existingTeam = await Team.findOne({ captainId: decoded.userId, isActive: true });
    if (existingTeam) {
      return NextResponse.json(
        { error: 'Você já possui um time cadastrado' },
        { status: 400 }
      );
    }

    // Check if team name already exists
    const teamWithSameName = await Team.findOne({ nome, isActive: true });
    if (teamWithSameName) {
      return NextResponse.json(
        { error: 'Nome do time já está em uso' },
        { status: 400 }
      );
    }

    // Fetch user data to get position and jersey number
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Create new team
    const team = new Team({
      nome,
      descricao,
      cor1,
      cor2,
      imagem: imagem || '/time-padrao.png',
      captainId: decoded.userId
    });

    // Automatically add the creator as a member of the team
    team.members.push({
      userId: decoded.userId,
      position: user.posicao || 'Jogadora',
      jerseyNumber: user.numeroCamisa || 1
    });

    await team.save();

    // Update user's teamId and isTeamCaptain
    await User.findByIdAndUpdate(decoded.userId, {
      teamId: team._id,
      isTeamCaptain: true
    });

    // Populate team data
    await team.populate('captainId', 'nomeCompleto email');
    await team.populate('members.userId', 'nomeCompleto posicao pernaDominante numeroCamisa');

    return NextResponse.json({
      success: true,
      message: 'Time criado com sucesso',
      team: {
        id: team._id.toString(),
        nome: team.nome,
        descricao: team.descricao,
        cor1: team.cor1,
        cor2: team.cor2,
        imagem: team.imagem,
        captainId: team.captainId._id.toString(),
        captainName: team.captainId.nomeCompleto,
        members: team.members?.map(member => ({
          userId: member.userId?._id?.toString() || member.userId?.toString(),
          nomeCompleto: member.userId?.nomeCompleto || 'N/A',
          posicao: member.position,
          pernaDominante: member.userId?.pernaDominante || '',
          jerseyNumber: member.jerseyNumber
        })) || [],
        memberCount: team.members?.length || 0,
        maxMembers: team.maxMembers || 15
      }
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

