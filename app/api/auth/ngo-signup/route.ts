import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const organizationName = formData.get("organizationName") as string;
    const registrationNumber = formData.get("registrationNumber") as string;
    const website = (formData.get("website") as string) || null;
    const missionArea = formData.get("missionArea") as string;
    const categoriesRaw = formData.get("categories") as string | null;
    const categories = categoriesRaw
      ? categoriesRaw
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : missionArea
        ? [missionArea]
        : [];
    const verificationDocument = formData.get("verificationDocument") as File | null;

    // Validation
    if (!email || !password || !organizationName || !registrationNumber || categories.length === 0) {
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

    let verificationDocumentPath: string | null = null;

    // Validate and upload document
    if (verificationDocument) {
      // Validate file type (PDF, JPEG, PNG)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(verificationDocument.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only PDF, JPEG, and PNG are allowed." },
          { status: 400 }
        );
      }

      // Validate file size (<= 5MB)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (verificationDocument.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "File size exceeds 5MB limit." },
          { status: 400 }
        );
      }

      try {
        const fileExt = verificationDocument.name.split('.').pop();
        const uniqueName = `ngo-cert-${Date.now()}-${Math.round(Math.random() * 1000)}.${fileExt}`;
        
        // Convert File to ArrayBuffer then Buffer for upload
        const arrayBuffer = await verificationDocument.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabase.storage
          .from('documents')
          .upload(uniqueName, buffer, {
            contentType: verificationDocument.type,
            upsert: false
          });

        if (error) {
          console.error("Supabase upload error:", error);
          return NextResponse.json(
            { error: "Failed to upload document" },
            { status: 500 }
          );
        }
        
        // Save the public URL
        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(data.path);
          
        verificationDocumentPath = publicUrlData.publicUrl;

      } catch (uploadError) {
        console.error("Upload process error:", uploadError);
        return NextResponse.json(
          { error: "Error during file upload" },
          { status: 500 }
        );
      }
    }

    // Create NGO record
    const newNgo = await prisma.nGO.create({
      data: {
        email,
        password: hashedPassword,
        organizationName,
        registrationNumber,
        website,
        missionArea: categories[0],
        categories,
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
