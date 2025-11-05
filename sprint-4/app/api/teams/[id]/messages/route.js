import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/lib/models/Message';
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

// GET messages for a team
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    // Verify user is a team member
    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json({ error: 'Time não encontrado' }, { status: 404 });
    }

    const isMember = team.members.some(m => m.userId.toString() === decoded.userId) ||
                     team.captainId.toString() === decoded.userId;

    if (!isMember) {
      return NextResponse.json({ error: 'Você não é membro deste time' }, { status: 403 });
    }

    // Get query params for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const before = searchParams.get('before'); // timestamp for pagination

    let query = { teamId: id };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('senderId', 'nomeCompleto avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Reverse to show oldest first
    const formattedMessages = messages.reverse().map(msg => ({
      id: msg._id.toString(),
      teamId: msg.teamId.toString(),
      senderId: msg.senderId._id.toString(),
      senderName: msg.senderId.nomeCompleto || msg.senderName,
      senderAvatar: msg.senderId.avatar || '/fotoDePerfil.png',
      content: msg.content,
      createdAt: msg.createdAt,
      isOwnMessage: msg.senderId._id.toString() === decoded.userId
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar mensagens' },
      { status: 500 }
    );
  }
}

// POST new message
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Mensagem não pode estar vazia' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Mensagem muito longa' }, { status: 400 });
    }

    await connectDB();

    // Verify user is a team member
    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json({ error: 'Time não encontrado' }, { status: 404 });
    }

    const isMember = team.members.some(m => m.userId.toString() === decoded.userId) ||
                     team.captainId.toString() === decoded.userId;

    if (!isMember) {
      return NextResponse.json({ error: 'Você não é membro deste time' }, { status: 403 });
    }

    // Get sender name
    const sender = await User.findById(decoded.userId).select('nomeCompleto avatar');
    if (!sender) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Create message
    const message = new Message({
      teamId: id,
      senderId: decoded.userId,
      senderName: sender.nomeCompleto,
      content: content.trim()
    });

    await message.save();
    await message.populate('senderId', 'nomeCompleto avatar');

    const formattedMessage = {
      id: message._id.toString(),
      teamId: message.teamId.toString(),
      senderId: message.senderId._id.toString(),
      senderName: message.senderId.nomeCompleto,
      senderAvatar: message.senderId.avatar || '/fotoDePerfil.png',
      content: message.content,
      createdAt: message.createdAt,
      isOwnMessage: true
    };

    return NextResponse.json({
      success: true,
      message: formattedMessage
    }, { status: 201 });

  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem' },
      { status: 500 }
    );
  }
}

