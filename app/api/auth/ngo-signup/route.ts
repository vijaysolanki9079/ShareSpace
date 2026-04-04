import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { Client } from "pg";
import { createServerPgClient } from "@/lib/server-db";

export async function POST(request: NextRequest) {
  let client: Client | undefined;
  try {
    const formData = await request.formData();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const organizationName = formData.get("organizationName") as string;
    const registrationNumber = formData.get("registrationNumber") as string;
    const website = (formData.get("website") as string) || null;
    const missionArea = formData.get("missionArea") as string;
    const verificationDocument = formData.get("verificationDocument") as File | null;

    // Validation
    if (!email || !password || !organizationName || !registrationNumber || !missionArea) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Create database connection from environment configuration
    client = createServerPgClient();

    await client.connect();

    // Check if NGO with email already exists
    const existingResult = await client.query(
      'SELECT id FROM "NGO" WHERE email = $1',
      [email]
    );

    if (existingResult.rows.length > 0) {
      await client.end();
      return NextResponse.json(
        { error: "NGO with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let verificationDocumentPath = null;

    // TODO: Handle file upload to Supabase Storage
    // For now, we'll just store the filename
    if (verificationDocument) {
      verificationDocumentPath = verificationDocument.name;
    }

    // Create NGO record
    const result = await client.query(
      `INSERT INTO "NGO" (id, email, password, "organizationName", "registrationNumber", website, "missionArea", "verificationDocument", "isVerified", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW())
       RETURNING id`,
      [email, hashedPassword, organizationName, registrationNumber, website, missionArea, verificationDocumentPath]
    );

    const ngoId = result.rows[0].id;

    await client.end();

    return NextResponse.json(
      {
        success: true,
        message: "NGO account created successfully. Awaiting verification.",
        ngoId,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("NGO signup error:", error);
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
