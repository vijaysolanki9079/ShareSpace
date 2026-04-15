'use server';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Initialize if empty
    const count = await prisma.itemCategory.count();

    if (count === 0) {
      const defaultCategories = [
        {
          name: 'furniture',
          description: 'Beds, tables, chairs, sofas, wardrobes',
        },
        {
          name: 'clothes',
          description: 'Used clothing, shoes, and accessories',
        },
        {
          name: 'electronics',
          description: 'Old gadgets, phones, laptops, appliances',
        },
        { name: 'toys', description: 'Children toys and games' },
        {
          name: 'books',
          description: 'Used books and educational materials',
        },
        { name: 'tools', description: 'Hand tools and equipment' },
        {
          name: 'kitchen',
          description: 'Kitchen utensils, cookware, and dishes',
        },
        { name: 'sports', description: 'Sports equipment and gear' },
        { name: 'other', description: 'Other items' },
      ];

      await Promise.all(
        defaultCategories.map((cat) =>
          prisma.itemCategory.create({ data: cat })
        )
      );

      console.log('[categories] Initialized default categories');
    }

    const categories = await prisma.itemCategory.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error('[categories] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
