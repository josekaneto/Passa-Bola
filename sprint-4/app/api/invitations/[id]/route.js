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

// PUT - Accept or decline invitation
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

    // Get request body
    const body = await request.json();
    const { action } = body; // 'accept' or 'decline'

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação deve ser "accept" ou "decline"' },
        { status: 400 }
      );
    }

    // Find invitation
    const invitation = await Invitation.findById(id);
    if (!invitation) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      );
    }

    // Check if invitation belongs to current user OR if it's a join request where user is captain
    const isInvitationForUser = invitation.userId.toString() === decoded.userId;
    const isJoinRequestForCaptain = invitation.captainId.toString() === decoded.userId;
    
    if (!isInvitationForUser && !isJoinRequestForCaptain) {
      return NextResponse.json(
        { error: 'Você não tem permissão para responder este convite' },
        { status: 403 }
      );
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Este convite já foi respondido' },
        { status: 400 }
      );
    }

    // Update invitation status
    invitation.status = action === 'accept' ? 'accepted' : 'declined';
    await invitation.save();

    // If accepted, add user to team
    if (action === 'accept') {
      const team = await Team.findById(invitation.teamId);
      if (!team || !team.isActive) {
        return NextResponse.json(
          { error: 'Time não encontrado ou inativo' },
          { status: 404 }
        );
      }

      // Check if team is full
      if (team.members.length >= team.maxMembers) {
        invitation.status = 'declined';
        await invitation.save();
        return NextResponse.json(
          { error: 'Time está completo' },
          { status: 400 }
        );
      }

      // Get the user being added (either from invitation or join request)
      const userToAdd = await User.findById(invitation.userId);
      if (!userToAdd) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }

      // Check if user already has a team
      if (userToAdd.teamId && userToAdd.teamId.toString() !== team._id.toString()) {
        invitation.status = 'declined';
        await invitation.save();
        return NextResponse.json(
          { error: 'Usuário já está em outro time' },
          { status: 400 }
        );
      }

      // Check if user is already a member
      const isAlreadyMember = team.members.some(m => m.userId.toString() === invitation.userId.toString());
      if (isAlreadyMember) {
        invitation.status = 'declined';
        await invitation.save();
        return NextResponse.json(
          { error: 'Usuário já é membro deste time' },
          { status: 400 }
        );
      }

      // Add user to team
      team.members.push({
        userId: invitation.userId,
        position: userToAdd.posicao || 'Jogadora',
        jerseyNumber: userToAdd.numeroCamisa || team.members.length + 1
      });

      await team.save();

      // Update user's teamId
      await User.findByIdAndUpdate(invitation.userId, {
        teamId: team._id,
        isTeamCaptain: false
      });

      // Decline all other pending invitations/requests for this user
      await Invitation.updateMany(
        { userId: invitation.userId, status: 'pending', _id: { $ne: invitation._id } },
        { status: 'declined' }
      );
    }

    // Populate invitation data
    await invitation.populate('teamId', 'nome');
    await invitation.populate('captainId', 'nomeCompleto');
    await invitation.populate('userId', 'nomeCompleto');

    const isJoinRequest = invitation.captainId.toString() === decoded.userId;
    const message = isJoinRequest 
      ? (action === 'accept' ? 'Solicitação aceita com sucesso' : 'Solicitação recusada')
      : (action === 'accept' ? 'Convite aceito com sucesso' : 'Convite recusado');

    return NextResponse.json({
      success: true,
      message: message,
      invitation: {
        id: invitation._id.toString(),
        teamId: invitation.teamId._id.toString(),
        teamName: invitation.teamId.nome,
        userId: invitation.userId._id?.toString() || invitation.userId.toString(),
        userName: invitation.userId.nomeCompleto || 'N/A',
        captainId: invitation.captainId._id?.toString() || invitation.captainId.toString(),
        captainName: invitation.captainId.nomeCompleto || 'N/A',
        status: invitation.status,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Update invitation error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

