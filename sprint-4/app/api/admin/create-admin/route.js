import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin account already exists', exists: true },
        { status: 200 }
      );
    }

    // Create admin user
    const adminUser = new User({
      nomeCompleto: 'Administrador',
      dataNascimento: '01/01/1990',
      email: 'admin@gmail.com',
      telefone: '00000000000',
      nomeCamisa: 'Admin',
      numeroCamisa: 1,
      altura: 170,
      peso: 70,
      posicao: 'Administrador',
      pernaDominante: 'Direita',
      senha: '123456',
      isAdmin: true,
      isActive: true
    });

    await adminUser.save();

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        id: adminUser._id,
        email: adminUser.email,
        isAdmin: adminUser.isAdmin
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create admin error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Admin account already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar conta de administrador', details: error.message },
      { status: 500 }
    );
  }
}

