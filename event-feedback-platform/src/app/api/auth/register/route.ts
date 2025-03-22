import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createUser, getUserByEmail } from '@/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 } // Conflict
      );
    }

    // Validate role
    if (role !== 'organizer' && role !== 'attendee') {
      return NextResponse.json(
        { error: 'Role must be either organizer or attendee' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = createUser({ name, email, password, role });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
