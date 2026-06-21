import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRequestRateLimit, rateLimitResponse } from "@/lib/rate-limit";

// GET - Fetch donations with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    // ✅ Use Prisma for standard queries
    const donations = await prisma.donation.findMany({
      where: {
        ...(status && { status }),
        ...(category && { category }),
      },
      include: {
        donor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            image: true,
          },
        },
        ngo: {
          select: {
            id: true,
            organizationName: true,
            image: true,
          },
        },
        requests: {
          select: {
            id: true,
            status: true,
            requester: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    });

    const total = await prisma.donation.count({
      where: {
        ...(status && { status }),
        ...(category && { category }),
      },
    });

    return NextResponse.json({
      donations,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /donations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}

// POST - Create a donation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.type !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = checkRequestRateLimit(req, "donation-create", 20, 60 * 60 * 1000, session.user.id);
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const { title, description, category, image } = await req.json();

    // ✅ Validation
    if (!title || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Use Prisma to create
    const donation = await prisma.donation.create({
      data: {
        title,
        description,
        category,
        image,
        donorId: session.user.id,
        status: "pending",
      },
      include: {
        donor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    console.error("POST /donations error:", error);
    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    );
  }
}
