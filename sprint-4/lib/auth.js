// Authentication utility functions
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

/**
 * Get token from request headers
 */
export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
  } catch (error) {
    return null;
  }
}

/**
 * Generate JWT token
 */
export function generateToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: '7d' }
  );
}

/**
 * Middleware to verify authentication
 */
export function requireAuth(handler) {
  return async (request) => {
    try {
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json(
          { error: 'Token de acesso não fornecido' },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { error: 'Token inválido ou expirado' },
          { status: 401 }
        );
      }

      // Add user info to request
      request.user = decoded;
      return handler(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Erro de autenticação' },
        { status: 401 }
      );
    }
  };
}
