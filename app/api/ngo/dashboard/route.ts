import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function clampReliabilityScore(value: number) {
  return Math.max(3.5, Math.min(5, Number(value.toFixed(1))));
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.type !== 'ngo') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ngoId = session.user.id;

    const [ngo, donationCount, fulfilledRequests, supportedPeople, eventCount, docs] = await Promise.all([
      prisma.nGO.findUnique({
        where: { id: ngoId },
        select: {
          id: true,
          email: true,
          organizationName: true,
          image: true,
          missionArea: true,
          verificationStatus: true,
          isVerified: true,
          mfaSetupComplete: true,
          mfaMethod: true,
          isFirstLogin: true,
          lastLoginAt: true,
        },
      }),
      prisma.donation.count({
        where: {
          ngoId,
          status: { not: 'pending' },
        },
      }),
      prisma.request.count({
        where: {
          donation: { ngoId },
          status: { in: ['approved', 'completed'] },
        },
      }),
      prisma.request.findMany({
        where: {
          donation: { ngoId },
          status: { in: ['approved', 'completed'] },
        },
        distinct: ['requesterId'],
        select: { requesterId: true },
      }),
      prisma.eventDrive.count({
        where: { ngoId },
      }),
      prisma.nGOVerificationDocument.findMany({
        where: {
          ngoId,
          status: 'verified',
          documentType: { in: ['80g_certificate', 'fcra_certificate'] },
        },
        select: {
          id: true,
          documentType: true,
        },
      }),
    ]);

    if (!ngo) {
      return NextResponse.json({ error: 'NGO not found' }, { status: 404 });
    }

    const totalHandled = Math.max(donationCount, fulfilledRequests, supportedPeople.length);
    const trustBase =
      4 +
      (ngo.isVerified ? 0.4 : 0) +
      (ngo.mfaSetupComplete ? 0.2 : 0) +
      Math.min(totalHandled / 100, 0.4);

    const reliabilityScore = clampReliabilityScore(trustBase);

    const complianceBadges = (docs as any[]).map((doc: any) =>
      doc.documentType === '80g_certificate' ? '80G' : 'FCRA'
    );

    const recentActivity = await prisma.mFAAuditLog.findMany({
      where: { ngoId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        action: true,
        createdAt: true,
        success: true,
      },
    });

    return NextResponse.json({
      ngo: {
        ...ngo,
        complianceBadges,
      },
      metrics: {
        itemsReceived: donationCount,
        requestsFulfilled: fulfilledRequests,
        peopleSupported: supportedPeople.length,
        reliabilityScore,
        eventsHosted: eventCount,
      },
      recentActivity: recentActivity.map((item: any) => ({
        title: item.action.replace(/_/g, ' '),
        date: item.createdAt.toISOString(),
        success: item.success,
      })),
    });
  } catch (error) {
    console.error('NGO dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load NGO dashboard' },
      { status: 500 }
    );
  }
}
