import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product, User } from '@/lib/models';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Helper function to verify admin
async function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Token de acesso não fornecido', status: 401 };
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    } catch (jwtError) {
      return { error: 'Token inválido ou expirado', status: 401 };
    }

    // Connect to MongoDB
    await connectDB();

    // Find user by ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return { error: 'Usuário não encontrado', status: 404 };
    }

    // Check if user is admin (check isAdmin field or email)
    const isAdmin = user.isAdmin || user.email === 'admin@gmail.com';
    if (!isAdmin) {
      return { error: 'Acesso negado. Apenas administradores podem realizar esta ação.', status: 403 };
    }

    return { user, decoded };
  } catch (error) {
    console.error('Verify admin error:', error);
    return { error: 'Erro ao verificar autenticação', status: 500 };
  }
}

// Add a new product (admin only)
export async function POST(request) {
  try {
    // Verify admin
    const adminCheck = await verifyAdmin(request);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Get request body
    const body = await request.json();
    const {
      nome,
      preco,
      imagem,
      categoria,
      tamanhos,
      descricao,
      estoque,
      isFeatured,
      isNew
    } = body;

    // Validation
    if (!nome || !preco || !imagem || !categoria) {
      return NextResponse.json(
        { error: 'Nome, preço, imagem e categoria são obrigatórios' },
        { status: 400 }
      );
    }

    // Create new product
    const product = new Product({
      nome,
      preco: parseFloat(preco),
      imagem,
      categoria,
      tamanhos: tamanhos || [],
      descricao: descricao || '',
      estoque: estoque || 0,
      isFeatured: isFeatured || false,
      isNew: isNew || false,
      isActive: true
    });

    await product.save();

    return NextResponse.json({
      success: true,
      message: 'Produto adicionado com sucesso',
      product: {
        id: product._id.toString(),
        nome: product.nome,
        preco: product.preco,
        imagem: product.imagem,
        categoria: product.categoria,
        tamanhos: product.tamanhos,
        descricao: product.descricao,
        estoque: product.estoque,
        isFeatured: product.isFeatured,
        isNew: product.isNew
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Add product error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Dados inválidos', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao adicionar produto', details: error.message },
      { status: 500 }
    );
  }
}

// Delete a product (admin only)
export async function DELETE(request) {
  try {
    // Verify admin
    const adminCheck = await verifyAdmin(request);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Get product ID from query params
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { error: 'ID do produto é obrigatório' },
        { status: 400 }
      );
    }

    // Convert productId to ObjectId for proper MongoDB query
    let productObjectId;
    try {
      productObjectId = new mongoose.Types.ObjectId(productId);
    } catch (error) {
      return NextResponse.json(
        { error: 'ID do produto inválido' },
        { status: 400 }
      );
    }

    // Find and delete product from MongoDB
    const product = await Product.findByIdAndDelete(productObjectId);

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    console.log('Product deleted from MongoDB:', product.nome, 'ID:', product._id);

    return NextResponse.json({
      success: true,
      message: 'Produto removido com sucesso',
      deletedProduct: {
        id: product._id.toString(),
        nome: product.nome
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Delete product error:', error);
    
    return NextResponse.json(
      { error: 'Erro ao remover produto', details: error.message },
      { status: 500 }
    );
  }
}

