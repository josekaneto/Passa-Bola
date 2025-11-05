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

// POST - Request to join a team
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

    // Find team
    const team = await Team.findById(teamId);
    if (!team || !team.isActive) {
      return NextResponse.json(
        { error: 'Time não encontrado' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const isMember = team.members.some(m => m.userId.toString() === decoded.userId);
    if (isMember) {
      return NextResponse.json(
        { error: 'Você já é membro deste time' },
        { status: 400 }
      );
    }

    // Check if user is the captain
    if (team.captainId.toString() === decoded.userId) {
      return NextResponse.json(
        { error: 'Você é a capitã deste time' },
        { status: 400 }
      );
    }

    // Check if user already has a team
    const user = await User.findById(decoded.userId);
    if (user.teamId && user.teamId.toString() !== teamId) {
      return NextResponse.json(
        { error: 'Você já está em outro time. Saia do seu time atual primeiro.' },
        { status: 400 }
      );
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return NextResponse.json(
        { error: 'Time está completo' },
        { status: 400 }
      );
    }

    // Check if join request already exists
    const existingRequest = await Invitation.findOne({
      teamId,
      userId: decoded.userId,
      captainId: team.captainId,
      status: 'pending'
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Você já solicitou entrar neste time' },
        { status: 400 }
      );
    }

    // Create join request (using Invitation model, but reversed)
    const joinRequest = new Invitation({
      teamId,
      userId: decoded.userId,
      captainId: team.captainId,
      status: 'pending'
    });

    await joinRequest.save();

    // Populate join request data
    await joinRequest.populate('teamId', 'nome');
    await joinRequest.populate('userId', 'nomeCompleto');

    return NextResponse.json({
      success: true,
      message: 'Solicitação enviada com sucesso',
      joinRequest: {
        id: joinRequest._id.toString(),
        teamId: joinRequest.teamId._id.toString(),
        teamName: joinRequest.teamId.nome,
        userId: joinRequest.userId._id.toString(),
        userName: joinRequest.userId.nomeCompleto,
        captainId: joinRequest.captainId.toString(),
        status: joinRequest.status,
        createdAt: joinRequest.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Join request error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

