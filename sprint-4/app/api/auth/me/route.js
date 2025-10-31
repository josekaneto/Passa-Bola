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

    // Determine admin status (check isAdmin field or email)
    const isAdmin = user.isAdmin || user.email === 'admin@gmail.com';

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
        isAdmin: isAdmin,
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

export async function PUT(request) {
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

    // Get request body
    const body = await request.json();
    const {
      nomeCompleto,
      dataNascimento,
      email,
      telefone,
      nomeCamisa,
      numeroCamisa,
      altura,
      peso,
      posicao,
      pernaDominante,
      avatar
    } = body;

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

    // Update user fields (excluding password)
    if (nomeCompleto !== undefined) user.nomeCompleto = nomeCompleto;
    if (dataNascimento !== undefined) user.dataNascimento = dataNascimento;
    if (email !== undefined) user.email = email;
    if (telefone !== undefined) user.telefone = telefone;
    if (nomeCamisa !== undefined) user.nomeCamisa = nomeCamisa;
    if (numeroCamisa !== undefined) user.numeroCamisa = numeroCamisa;
    if (altura !== undefined) user.altura = altura;
    if (peso !== undefined) user.peso = peso;
    if (posicao !== undefined) user.posicao = posicao;
    if (pernaDominante !== undefined) user.pernaDominante = pernaDominante;
    if (avatar !== undefined) user.avatar = avatar;

    // Save updated user
    await user.save();

    // Return updated user data (without password)
    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
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
    console.error('Update user error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Dados inválidos', details: errors },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}