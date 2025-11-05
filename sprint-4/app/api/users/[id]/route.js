import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
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

// GET user by ID (for viewing other users' profiles)
export async function GET(request, { params }) {
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

    // Find user by ID
    const user = await User.findById(id)
      .select('-senha -__v')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Conta desativada' },
        { status: 404 }
      );
    }

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        telefone: user.telefone,
        dataNascimento: user.dataNascimento,
        nomeCamisa: user.nomeCamisa,
        numeroCamisa: user.numeroCamisa,
        altura: user.altura,
        peso: user.peso,
        posicao: user.posicao,
        pernaDominante: user.pernaDominante,
        avatar: user.avatar,
        teamId: user.teamId,
        isTeamCaptain: user.isTeamCaptain,
        createdAt: user.createdAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get user by ID error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

