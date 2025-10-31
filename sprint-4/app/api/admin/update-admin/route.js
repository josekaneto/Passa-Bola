import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Find admin user by email
    const adminUser = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin account not found' },
        { status: 404 }
      );
    }

    // Update admin status
    adminUser.isAdmin = true;
    await adminUser.save();

    return NextResponse.json({
      success: true,
      message: 'Admin account updated successfully',
      user: {
        id: adminUser._id,
        email: adminUser.email,
        isAdmin: adminUser.isAdmin
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Update admin error:', error);
    
    return NextResponse.json(
      { error: 'Erro ao atualizar conta de administrador', details: error.message },
      { status: 500 }
    );
  }
}

