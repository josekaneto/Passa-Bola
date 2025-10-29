import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de acesso não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Find user by ID
    const user = await User.findById(decoded.userId);
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
        { status: 401 }
      );
    }

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
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
    console.error('Get user error:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
