import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { Client } from "pg";
import { SignUpSchema } from "@/lib/validation";
import { createServerPgClient } from "@/lib/server-db";

interface RequestBody {
  email: string;
  password: string;
  fullName: string;
}

export async function POST(request: NextRequest) {
  let client: Client | undefined;
  try {
    const body: RequestBody = await request.json();

    // Validate input
    const validation = SignUpSchema.safeParse(body);
    if (!validation.success) {
      const message =
        validation.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { email, password, fullName } = validation.data;

    // Create database connection from environment configuration
    client = createServerPgClient();

    await client.connect();

    // Check if user already exists
    const checkResult = await client.query(
      'SELECT id FROM "User" WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length > 0) {
      await client.end();
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in database
    const result = await client.query(
      'INSERT INTO "User" (id, email, password, "fullName", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW()) RETURNING id',
      [email, hashedPassword, fullName]
    );

    const newUserId = result.rows[0].id;

    await client.end();

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        userId: newUserId,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Signup error:", error);
    if (client) {
      try {
        await client.end();
      } catch (e) {
        console.error("Error closing connection:", e);
      }
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
