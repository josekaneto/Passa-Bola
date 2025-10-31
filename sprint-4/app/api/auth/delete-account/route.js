import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Cart } from '@/lib/models';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function DELETE(request) {
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

    // Convert userId to ObjectId
    const userId = new mongoose.Types.ObjectId(decoded.userId);

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Prevent deletion of admin account (optional safety measure)
    if (user.email === 'admin@gmail.com') {
      return NextResponse.json(
        { error: 'Não é possível excluir a conta de administrador' },
        { status: 403 }
      );
    }

    // Delete user's cart
    try {
      await Cart.findOneAndDelete({ userId });
      console.log('Cart deleted for user:', userId);
    } catch (cartError) {
      console.error('Error deleting cart:', cartError);
      // Continue with user deletion even if cart deletion fails
    }

    // Delete user from MongoDB
    await User.findByIdAndDelete(userId);

    console.log('User account deleted from MongoDB:', user.email, 'ID:', userId);

    return NextResponse.json({
      success: true,
      message: 'Conta excluída com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete account error:', error);
    
    return NextResponse.json(
      { error: 'Erro ao excluir conta', details: error.message },
      { status: 500 }
    );
  }
}

