import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    console.log('Registration API called');
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB connected');

    // Get request body
    const body = await request.json();
    console.log('Received data:', body);
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
      senha,
      confirmacaoSenha
    } = body;

    // Validation
    if (!nomeCompleto || !dataNascimento || !email || !telefone || 
        !nomeCamisa || !numeroCamisa || !altura || !peso || 
        !posicao || !pernaDominante || !senha || !confirmacaoSenha) {
      console.log('Validation failed - missing fields');
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (senha !== confirmacaoSenha) {
      return NextResponse.json(
        { error: 'As senhas não coincidem' },
        { status: 400 }
      );
    }

    // Normalize pernaDominante (case-insensitive)
    const pernaDominanteLower = pernaDominante?.trim().toLowerCase();
    let normalizedPernaDominante = null;
    
    if (pernaDominanteLower === 'direita') {
      normalizedPernaDominante = 'Direita';
    } else if (pernaDominanteLower === 'esquerda') {
      normalizedPernaDominante = 'Esquerda';
    } else {
      return NextResponse.json(
        { error: 'Perna dominante deve ser "Direita" ou "Esquerda"' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      nomeCompleto,
      dataNascimento,
      email,
      telefone,
      nomeCamisa,
      numeroCamisa,
      altura,
      peso,
      posicao,
      pernaDominante: normalizedPernaDominante,
      senha
    });

    // Save user to database
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    // Return success response (without password)
    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: user._id,
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        nomeCamisa: user.nomeCamisa,
        posicao: user.posicao
      },
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
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
