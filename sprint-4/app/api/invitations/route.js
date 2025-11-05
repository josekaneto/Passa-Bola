import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Invitation, Team, User } from '@/lib/models';
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

// POST - Send invitation
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
    const { teamId, userId } = body;

    if (!teamId || !userId) {
      return NextResponse.json(
        { error: 'teamId e userId são obrigatórios' },
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

    // Check if user is captain
    if (team.captainId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Apenas a capitã do time pode enviar convites' },
        { status: 403 }
      );
    }

    // Check if user exists
    const invitedUser = await User.findById(userId);
    if (!invitedUser || !invitedUser.isActive) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    if (team.members.some(m => m.userId.toString() === userId)) {
      return NextResponse.json(
        { error: 'Usuário já é membro deste time' },
        { status: 400 }
      );
    }

    // Check if user already has a team
    if (invitedUser.teamId && invitedUser.teamId.toString() !== teamId) {
      return NextResponse.json(
        { error: 'Usuário já está em outro time' },
        { status: 400 }
      );
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      teamId,
      userId,
      status: 'pending'
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Convite já foi enviado para este usuário' },
        { status: 400 }
      );
    }

    // Create invitation
    const invitation = new Invitation({
      teamId,
      userId,
      captainId: decoded.userId,
      status: 'pending'
    });

    await invitation.save();

    // Populate invitation data
    await invitation.populate('teamId', 'nome');
    await invitation.populate('captainId', 'nomeCompleto');

    return NextResponse.json({
      success: true,
      message: 'Convite enviado com sucesso',
      invitation: {
        id: invitation._id.toString(),
        teamId: invitation.teamId._id.toString(),
        teamName: invitation.teamId.nome,
        userId: invitation.userId.toString(),
        captainId: invitation.captainId._id.toString(),
        captainName: invitation.captainId.nomeCompleto,
        status: invitation.status,
        createdAt: invitation.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Send invitation error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Get invitations for current user
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending'; // pending, accepted, declined, or all

    // Build query - get invitations where user is invited (userId) OR join requests where user is captain (captainId)
    let query = {
      $or: [
        { userId: decoded.userId },
        { captainId: decoded.userId }
      ]
    };
    if (status !== 'all') {
      query.status = status;
    }

    // Find invitations and join requests
    const invitations = await Invitation.find(query)
      .populate('teamId', 'nome descricao imagem')
      .populate('captainId', 'nomeCompleto')
      .populate('userId', 'nomeCompleto')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      invitations: invitations.map(inv => ({
        id: inv._id.toString(),
        teamId: inv.teamId._id.toString(),
        teamName: inv.teamId.nome,
        teamDescription: inv.teamId.descricao,
        teamImage: inv.teamId.imagem,
        userId: inv.userId._id?.toString() || inv.userId.toString(),
        userName: inv.userId.nomeCompleto || 'N/A',
        captainId: inv.captainId._id?.toString() || inv.captainId.toString(),
        captainName: inv.captainId.nomeCompleto || 'N/A',
        // Type: 'invitation' if user is invited, 'join_request' if user is captain receiving request
        type: inv.userId._id?.toString() === decoded.userId || inv.userId.toString() === decoded.userId ? 'invitation' : 'join_request',
        status: inv.status,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt
      }))
    }, { status: 200 });

  } catch (error) {
    console.error('Get invitations error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

