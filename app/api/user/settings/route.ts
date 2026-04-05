import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fullName, bio, location, image } = await req.json();

    const userId = session.user.id;
    // user.type comes from the session if it's set, else default to 'user'
    const userType = (session.user as any).type || 'user';

    if (userType === 'ngo') {
      await prisma.nGO.update({
        where: { id: userId },
        data: {
          organizationName: fullName,
          bio: bio,
          image: image,
          // location is not natively in NGO model based on standard schema, but we can try ignoring or handling it differently if absent.
          // Wait, NGO has no location in the schema earlier? Let me verify.
          // Schema NGO has: organizationName, bio, image.
        },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          fullName: fullName,
          bio: bio,
          location: location,
          image: image,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
