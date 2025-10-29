import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Since we're using JWT tokens, logout is handled client-side
    // by simply removing the token from storage
    // This endpoint exists for consistency and future enhancements
    
    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
