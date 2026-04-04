import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { Client } from "pg";
import { createServerPgClient } from "@/lib/server-db";

interface RequestBody {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  let client: Client | undefined;
  try {
    const body: RequestBody = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Create database connection from environment configuration
    client = createServerPgClient();

    await client.connect();

    // Get user from database
    const result = await client.query(
      'SELECT * FROM "User" WHERE email = $1',
      [body.email]
    );

    if (result.rows.length === 0) {
      await client.end();
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(body.password, user.password);

    if (!passwordMatch) {
      await client.end();
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await client.end();

    // Return user data without password
    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        name: user.fullName,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Validation error:", error);
    if (client) {
      try {
        await client.end();
      } catch (e) {
        console.error("Error closing connection:", e);
      }
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
