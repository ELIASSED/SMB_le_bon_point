import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type SortOrder = "asc" | "desc";

interface QueryParams {
  date?: SortOrder;
  price?: SortOrder;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  prioritySort?: 'price' | 'date'; // Nouveau paramètre pour définir la priorité de tri
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // Récupération et validation des paramètres
  const params: QueryParams = {
    date: url.searchParams.get("date") as SortOrder,
    price: url.searchParams.get("price") as SortOrder,
    prioritySort: url.searchParams.get("prioritySort") as 'price' | 'date',
    minPrice: url.searchParams.get("minPrice") ? Number(url.searchParams.get("minPrice")) : undefined,
    maxPrice: url.searchParams.get("maxPrice") ? Number(url.searchParams.get("maxPrice")) : undefined,
    startDate: url.searchParams.get("startDate") || undefined,
    endDate: url.searchParams.get("endDate") || undefined,
  };

  try {
    // Construction des filtres de base
    const baseWhere: Prisma.SessionWhereInput = {
      AND: [
        { capacity: { gt: 0 } },
        { isArchived: false },
        { endDate: { gt: new Date() } }
      ]
    };

    // Ajout des filtres de date si spécifiés
    if (params.startDate) {
      baseWhere.AND.push({ startDate: { gte: new Date(params.startDate) } });
    }
    if (params.endDate) {
      baseWhere.AND.push({ endDate: { lte: new Date(params.endDate) } });
    }

    // Ajout des filtres de prix si spécifiés
    if (params.minPrice !== undefined) {
      baseWhere.AND.push({ price: { gte: params.minPrice } });
    }
    if (params.maxPrice !== undefined) {
      baseWhere.AND.push({ price: { lte: params.maxPrice } });
    }

    // Construction du tri en fonction de la priorité
    let orderBy: Prisma.SessionOrderByWithRelationInput[] = [];
    
    if (params.prioritySort === 'price') {
      // Prix en premier, puis date
      orderBy = [
        { price: params.price || 'asc' },
        { startDate: params.date || 'asc' }
      ];
    } else if (params.prioritySort === 'date') {
      // Date en premier, puis prix
      orderBy = [
        { startDate: params.date || 'asc' },
        { price: params.price || 'asc' }
      ];
    } else {
      // Tri par défaut : date puis prix
      orderBy = [
        { startDate: 'asc' },
        { price: 'asc' }
      ];
    }

    // Exécution de la requête
    const sessions = await prisma.session.findMany({
      where: baseWhere,
      select: {
        id: true,
        numeroStageAnts: true,
        price: true,
        startDate: true,
        endDate: true,
        location: true,
        capacity: true,
        description: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        psychologue: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy
    });

    // Stats supplémentaires
    const stats = {
      minPrice: Math.min(...sessions.map(s => s.price)),
      maxPrice: Math.max(...sessions.map(s => s.price)),
      totalSessions: sessions.length,
      priceRanges: generatePriceRanges(sessions)
    };

    return NextResponse.json({
      success: true,
      data: sessions,
      stats,
      appliedFilters: {
        date: params.date,
        price: params.price,
        prioritySort: params.prioritySort,
        priceRange: params.minPrice || params.maxPrice ? 
          `${params.minPrice || 'min'}-${params.maxPrice || 'max'}` : undefined,
        dateRange: params.startDate || params.endDate ? 
          `${params.startDate || 'start'}-${params.endDate || 'end'}` : undefined
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des sessions:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erreur lors de la récupération des sessions" 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction utilitaire pour générer des fourchettes de prix (style Airbnb)
function generatePriceRanges(sessions: any[]) {
  const prices = sessions.map(s => s.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min;
  const step = range / 4; // Divise en 4 fourchettes

  const ranges = [];
  for (let i = 0; i < 4; i++) {
    const rangeMin = min + (step * i);
    const rangeMax = min + (step * (i + 1));
    const count = sessions.filter(s => s.price >= rangeMin && s.price <= rangeMax).length;
    ranges.push({
      min: Math.round(rangeMin),
      max: Math.round(rangeMax),
      count
    });
  }

  return ranges;
}

// Exemples d'utilisation dans les commentaires :
/*
1. Tri par date croissante (défaut):
   GET /api/stage?prioritySort=price&price=asc&date=desc

2. Tri par date décroissante:
   GET /api/stage?prioritySort=date&date=desc&price=asc

3. Tri par prix croissant:
   GET /api/stage?price=asc

4. Tri par prix décroissant:
   GET /api/stage?price=desc

5. Tri combiné (date décroissante puis prix croissant):
   GET /api/stage?date=desc&price=asc

6. Tri combiné (prix décroissant puis date croissante):
   GET /api/stage?price=desc&date=asc
*/