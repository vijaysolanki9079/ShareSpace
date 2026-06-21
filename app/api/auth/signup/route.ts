import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignUpSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { checkRequestRateLimitShared, rateLimitResponse } from "@/lib/rate-limit";

interface RequestBody {
  email: string;
  password: string;
  fullName: string;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await checkRequestRateLimitShared(request, "signup", 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const body: RequestBody = await request.json();

    // Validate input
    const validation = SignUpSchema.safeParse(body);
    if (!validation.success) {
      const message =
        validation.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { email, password, fullName } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        userId: newUser.id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
