import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        try {
            jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db('PassaBola');

        // Busca todas as partidas (você pode adicionar filtros aqui)
        const matches = await db.collection('matches').find({}).sort({ data: -1 }).toArray();

        return NextResponse.json({ matches });
    } catch (error) {
        console.error('Error fetching matches:', error);
        return NextResponse.json({ error: 'Erro ao buscar partidas' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        try {
            jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }

        const body = await request.json();
        const client = await clientPromise;
        const db = client.db('PassaBola');

        // Salva partida no banco
        const result = await db.collection('matches').insertOne({
            ...body,
            createdAt: new Date()
        });

        return NextResponse.json({ success: true, matchId: result.insertedId });
    } catch (error) {
        console.error('Error creating match:', error);
        return NextResponse.json({ error: 'Erro ao salvar partida' }, { status: 500 });
    }
}