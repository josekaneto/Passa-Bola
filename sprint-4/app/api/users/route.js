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

// GET all users (excluding current user and optionally team members)
export async function GET(request) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const excludeTeamId = searchParams.get('excludeTeamId');
    const search = searchParams.get('search') || '';

    // Build query - exclude current user, inactive users, and administrators
    let query = { 
      _id: { $ne: decoded.userId },
      isActive: true,
      $and: [
        { 
          $or: [
            { isAdmin: { $ne: true } },
            { isAdmin: { $exists: false } }
          ]
        },
        { email: { $ne: 'admin@gmail.com' } }
      ]
    };

    // If excludeTeamId is provided, exclude users already in that team
    if (excludeTeamId) {
      query.teamId = { $ne: excludeTeamId };
    }

    // If search term is provided, search by nomeCompleto
    if (search) {
      query.nomeCompleto = { $regex: search, $options: 'i' };
    }

    // Find users
    const users = await User.find(query)
      .select('-senha -__v')
      .limit(50) // Limit to 50 users for performance
      .lean();

    // Return user data
    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user._id.toString(),
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        posicao: user.posicao,
        pernaDominante: user.pernaDominante,
        avatar: user.avatar,
        teamId: user.teamId
      }))
    }, { status: 200 });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

