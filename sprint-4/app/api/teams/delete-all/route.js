import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Team, User } from '@/lib/models';

// DELETE all teams (for development/reset purposes)
export async function DELETE(request) {
  try {
    await connectDB();

    // Delete all teams (hard delete)
    const result = await Team.deleteMany({});
    
    // Reset teamId and isTeamCaptain for all users
    await User.updateMany(
      {},
      { $set: { teamId: null, isTeamCaptain: false } }
    );

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} times foram removidos do banco de dados`,
      deletedCount: result.deletedCount
    }, { status: 200 });

  } catch (error) {
    console.error('Delete all teams error:', error);
    
    return NextResponse.json(
      { error: 'Erro ao remover times' },
      { status: 500 }
    );
  }
}

