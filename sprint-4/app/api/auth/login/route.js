import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get request body
    const body = await request.json();
    const { email, senha } = body;

    // Validation
    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+senha');
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Conta desativada. Entre em contato com o suporte' },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(senha);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    // Determine admin status (check isAdmin field or email)
    const isAdmin = user.isAdmin || user.email === 'admin@gmail.com';

    // Return success response (without password)
    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user._id,
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        nomeCamisa: user.nomeCamisa,
        posicao: user.posicao,
        teamId: user.teamId,
        isTeamCaptain: user.isTeamCaptain,
        isAdmin: isAdmin
      },
      token
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
