import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
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

    // Check if NGO with email already exists
    const existingNgo = await prisma.nGO.findUnique({
      where: { email },
    });

    if (existingNgo) {
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
    const newNgo = await prisma.nGO.create({
      data: {
        email,
        password: hashedPassword,
        organizationName,
        registrationNumber,
        website,
        missionArea,
        verificationDocument: verificationDocumentPath,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "NGO account created successfully. Awaiting verification.",
        ngoId: newNgo.id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("NGO signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
