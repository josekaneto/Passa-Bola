import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(
            'https://newsapi.org/v2/everything?q=Women-Super-League&apiKey=30939f006bd6433e930278b2aaa79a09',
            {
                next: { revalidate: 3600 } // Cache por 1 hora
            }
        );

        if (!response.ok) {
            throw new Error('Erro ao buscar notícias');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro na API de notícias:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar notícias' },
            { status: 500 }
        );
    }
}