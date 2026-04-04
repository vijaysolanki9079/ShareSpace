import { query, transaction } from "@/lib/server-db";
import { NextRequest, NextResponse } from "next/server";

// GET - Dashboard analytics
export async function GET(req: NextRequest) {
  try {
    // ✅ Complex query: Donation statistics by category
    const stats = await query<{
      category: string;
      total_donations: string;
      total_requests: string;
      delivered_count: string;
      avg_request_time_hours: string;
    }>(
      `SELECT 
        d.category,
        COUNT(d.id)::text as total_donations,
        COUNT(r.id)::text as total_requests,
        COUNT(CASE WHEN d.status = 'delivered' THEN 1 END)::text as delivered_count,
        ROUND(AVG(EXTRACT(EPOCH FROM (r."createdAt" - d."createdAt"))/3600))::text as avg_request_time_hours
      FROM "Donation" d
      LEFT JOIN "Request" r ON d.id = r."donationId"
      GROUP BY d.category
      ORDER BY total_donations DESC`
    );

    // ✅ Top donors query
    const topDonors = await query<{
      id: string;
      fullName: string;
      email: string;
      donation_count: string;
    }>(
      `SELECT 
        u.id,
        u."fullName",
        u.email,
        COUNT(d.id)::text as donation_count
      FROM "User" u
      LEFT JOIN "Donation" d ON u.id = d."donorId"
      GROUP BY u.id
      HAVING COUNT(d.id) > 0
      ORDER BY COUNT(d.id) DESC
      LIMIT 10`
    );

    // ✅ NGO performance
    const ngoPerformance = await query<{
      id: string;
      organizationName: string;
      donations_accepted: string;
      event_count: string;
      is_verified: boolean;
    }>(
      `SELECT 
        n.id,
        n."organizationName",
        COUNT(DISTINCT d.id)::text as donations_accepted,
        COUNT(DISTINCT e.id)::text as event_count,
        n."isVerified"
      FROM "NGO" n
      LEFT JOIN "Donation" d ON n.id = d."ngoId" AND d.status != 'pending'
      LEFT JOIN "EventDrive" e ON n.id = e."ngoId"
      GROUP BY n.id
      ORDER BY donations_accepted DESC`
    );

    // ✅ Recent activity
    const recentActivity = await query<{
      type: string;
      count: string;
      date: string;
    }>(
      `SELECT 
        'donation'::text as type,
        COUNT(*)::text as count,
        DATE("createdAt")::text as date
      FROM "Donation"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      UNION ALL
      SELECT 
        'request'::text as type,
        COUNT(*)::text as count,
        DATE("createdAt")::text as date
      FROM "Request"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date DESC`
    );

    return NextResponse.json({
      stats: stats.rows,
      topDonors: topDonors.rows,
      ngoPerformance: ngoPerformance.rows,
      recentActivity: recentActivity.rows,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

// POST - Bulk operations with transaction
export async function POST(req: NextRequest) {
  try {
    const { donationIds, newStatus, ngoId } = await req.json();

    // ✅ Use transaction for multiple related operations
    const results = await transaction([
      {
        sql: `UPDATE "Donation" 
              SET status = $1, "ngoId" = $2, "updatedAt" = NOW() 
              WHERE id = ANY($3)`,
        params: [newStatus, ngoId, donationIds],
      },
      {
        sql: `INSERT INTO "Message" ("senderId", "receiverId", content, "createdAt")
              SELECT $1, "donorId", $2, NOW()
              FROM "Donation"
              WHERE id = ANY($3)`,
        params: [
          ngoId,
          `Your donation has been ${newStatus} by an NGO`,
          donationIds,
        ],
      },
    ]);

    return NextResponse.json({
      success: true,
      updated: donationIds.length,
      message: "Donations updated and notifications sent",
    });
  } catch (error) {
    console.error("Bulk operation error:", error);
    return NextResponse.json(
      { error: "Operation failed" },
      { status: 500 }
    );
  }
}