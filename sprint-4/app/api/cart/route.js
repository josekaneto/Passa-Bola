import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Cart } from '@/lib/models';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Get user's cart
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

    const token = authHeader.substring(7);

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

    // Find or create cart for user
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = await Cart.create({
        userId,
        items: []
      });
    }

    return NextResponse.json({
      success: true,
      cart: cart.items || []
    }, { status: 200 });

  } catch (error) {
    console.error('Get cart error:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Add item to cart
export async function POST(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de acesso não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

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

    // Get request body
    const body = await request.json();
    const { productId, nome, preco, imagem, tamanho, quantidade = 1 } = body;

    // Validation
    if (!productId || !nome || !preco || !imagem) {
      return NextResponse.json(
        { error: 'Dados do produto incompletos' },
        { status: 400 }
      );
    }

    // Create cart item ID
    const cartItemId = tamanho ? `${productId}-${tamanho}` : productId.toString();

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: []
      });
    }

    // Convert productId to ObjectId for cart item
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.cartItemId === cartItemId
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantidade += quantidade;
    } else {
      // Add new item
      cart.items.push({
        productId: productObjectId,
        nome,
        preco,
        imagem,
        tamanho: tamanho || null,
        quantidade,
        cartItemId
      });
    }

    await cart.save();

    return NextResponse.json({
      success: true,
      message: 'Item adicionado ao carrinho',
      cart: cart.items
    }, { status: 200 });

  } catch (error) {
    console.error('Add to cart error:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Update cart item quantity
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

    const token = authHeader.substring(7);

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

    // Get request body
    const body = await request.json();
    const { cartItemId, quantidade } = body;

    // Validation
    if (!cartItemId || quantidade === undefined) {
      return NextResponse.json(
        { error: 'cartItemId e quantidade são obrigatórios' },
        { status: 400 }
      );
    }

    // Find cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return NextResponse.json(
        { error: 'Carrinho não encontrado' },
        { status: 404 }
      );
    }

    // Find item
    const itemIndex = cart.items.findIndex(
      item => item.cartItemId === cartItemId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item não encontrado no carrinho' },
        { status: 404 }
      );
    }

    // Update or remove item
    if (quantidade <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantidade = quantidade;
    }

    await cart.save();

    return NextResponse.json({
      success: true,
      message: 'Carrinho atualizado',
      cart: cart.items
    }, { status: 200 });

  } catch (error) {
    console.error('Update cart error:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Remove item from cart or clear cart
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

    const token = authHeader.substring(7);

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

    // Get request body (optional - if cartItemId provided, remove item; otherwise clear cart)
    const body = await request.json().catch(() => ({}));
    const { cartItemId } = body;

    // Find cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return NextResponse.json(
        { error: 'Carrinho não encontrado' },
        { status: 404 }
      );
    }

    if (cartItemId) {
      // Remove specific item
      cart.items = cart.items.filter(item => item.cartItemId !== cartItemId);
    } else {
      // Clear entire cart
      cart.items = [];
    }

    await cart.save();

    return NextResponse.json({
      success: true,
      message: cartItemId ? 'Item removido do carrinho' : 'Carrinho limpo',
      cart: cart.items
    }, { status: 200 });

  } catch (error) {
    console.error('Delete cart error:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

