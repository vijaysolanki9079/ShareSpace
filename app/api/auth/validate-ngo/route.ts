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

    // Get NGO from database
    const result = await client.query(
      'SELECT * FROM "NGO" WHERE email = $1',
      [body.email]
    );

    if (result.rows.length === 0) {
      await client.end();
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const ngo = result.rows[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(body.password, ngo.password);

    if (!passwordMatch) {
      await client.end();
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await client.end();

    // Return NGO data without password
    return NextResponse.json(
      {
        id: ngo.id,
        email: ngo.email,
        organizationName: ngo.organizationName,
        name: ngo.organizationName,
        isVerified: ngo.isVerified,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("NGO validation error:", error);
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
