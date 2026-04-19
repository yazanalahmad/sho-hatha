import { Prisma } from '@prisma/client';
import { db } from '../../config/db';

export async function findRandomActiveCategories(count: number) {
  return db.$queryRaw<Array<{ id: string; slug: string; name_en: string; name_ar: string; icon: string | null }>>(
    Prisma.sql`
      SELECT id, slug, name_en, name_ar, icon
      FROM categories
      WHERE is_active = true
      ORDER BY random()
      LIMIT ${count}
    `,
  );
}

export async function findAllActiveCategories() {
  return db.category.findMany({
    where: { is_active: true },
    select: {
      id: true,
      slug: true,
      name_en: true,
      name_ar: true,
      icon: true,
    },
    orderBy: [{ name_en: 'asc' }],
  });
}

export async function countActiveCategories(): Promise<number> {
  return db.category.count({ where: { is_active: true } });
}
