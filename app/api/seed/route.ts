import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting database seed...');

    // Create demo user (account manager)
    const user = await prisma.user.upsert({
      where: { email: 'demo@kommerce.ai' },
      update: {},
      create: {
        email: 'demo@kommerce.ai',
        name: 'Demo Account Manager',
        passwordHash: await hash('demo123', 10),
        role: 'ACCOUNT_MANAGER',
      },
    });
    console.log('✅ Created demo user:', user.email);

    // Create demo clients
    const clients = [
      {
        name: 'Luxe Fashion Co.',
        email: 'client@luxefashion.com',
        industry: 'Fashion & Apparel',
        avgRevenue: 50000,
        avgOrders: 500,
        avgAdSpend: 10000,
        cogsPercentage: 35,
        targetMargin: 25,
      },
      {
        name: 'TechGadgets Pro',
        email: 'sales@techgadgets.com',
        industry: 'Electronics',
        avgRevenue: 75000,
        avgOrders: 300,
        avgAdSpend: 15000,
        cogsPercentage: 45,
        targetMargin: 20,
      },
      {
        name: 'Wellness Essentials',
        email: 'hello@wellnessessentials.com',
        industry: 'Health & Wellness',
        avgRevenue: 35000,
        avgOrders: 400,
        avgAdSpend: 7000,
        cogsPercentage: 30,
        targetMargin: 30,
      },
    ];

    const createdClients = [];

    for (const clientData of clients) {
      // Check if client exists
      let client = await prisma.client.findFirst({
        where: { email: clientData.email },
      });

      if (!client) {
        client = await prisma.client.create({
          data: {
            name: clientData.name,
            email: clientData.email,
            accountManagerId: user.id,
          },
        });
        console.log(`✅ Created client: ${client.name}`);
      } else {
        console.log(`✅ Client already exists: ${client.name}`);
      }

      createdClients.push({ client, clientData });

      // Create financial profile
      await prisma.financialProfile.upsert({
        where: { clientId: client.id },
        update: {},
        create: {
          clientId: client.id,
          cogsPercentage: clientData.cogsPercentage,
          paymentProcessingFee: 2.9,
          merchantAccountFee: 0.30,
          shippingCostPerOrder: 8.50,
          fulfillmentCostPerOrder: 3.50,
          targetMarginPercentage: clientData.targetMargin,
        },
      });

      // Generate 30 days of demo data
      for (let i = 0; i < 30; i++) {
        const date = subDays(new Date(), i);
        const randomFactor = 0.8 + Math.random() * 0.4;
        const dayOfWeek = date.getDay();
        const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1;

        const platforms: Array<'SHOPIFY' | 'META' | 'TIKTOK_SHOP' | 'TIKTOK_ADS'> =
          ['SHOPIFY', 'META', 'TIKTOK_SHOP', 'TIKTOK_ADS'];

        for (const platform of platforms) {
          const baseRevenue = clientData.avgRevenue * randomFactor * weekendFactor / platforms.length;
          const baseOrders = Math.floor(clientData.avgOrders * randomFactor * weekendFactor / platforms.length);
          const baseAdSpend = clientData.avgAdSpend * randomFactor * weekendFactor / platforms.length;

          const revenue = parseFloat(baseRevenue.toFixed(2));
          const orders = baseOrders;
          const adSpend = parseFloat(baseAdSpend.toFixed(2));
          const aov = parseFloat((revenue / orders).toFixed(2));
          const roas = parseFloat((revenue / adSpend).toFixed(2));
          const cpa = parseFloat((adSpend / orders).toFixed(2));

          await prisma.dailyMetrics.upsert({
            where: {
              clientId_date_platform: {
                clientId: client.id,
                date: date,
                platform: platform,
              },
            },
            update: {},
            create: {
              clientId: client.id,
              date: date,
              platform: platform,
              revenue: revenue,
              orders: orders,
              adSpend: adSpend,
              impressions: Math.floor(orders * 50),
              clicks: Math.floor(orders * 3),
              aov: aov,
              roas: roas,
              cpa: cpa,
            },
          });
        }

        // Calculate daily financials
        const totalRevenue = clientData.avgRevenue * randomFactor * weekendFactor;
        const totalOrders = Math.floor(clientData.avgOrders * randomFactor * weekendFactor);
        const totalAdSpend = clientData.avgAdSpend * randomFactor * weekendFactor;

        const aov = totalRevenue / totalOrders;
        const actualCpa = totalAdSpend / totalOrders;
        const actualRoas = totalRevenue / totalAdSpend;

        const cogs = aov * (clientData.cogsPercentage / 100);
        const totalCostPerOrder = cogs + (aov * 0.029) + 0.30 + 8.50 + 3.50;
        const profitPerOrder = aov - totalCostPerOrder - actualCpa;
        const actualMarginPercentage = (profitPerOrder / aov) * 100;

        const targetProfit = aov * (clientData.targetMargin / 100);
        const cpaTarget = aov - totalCostPerOrder - targetProfit;
        const roasTarget = aov / cpaTarget;

        let status: 'GREEN' | 'YELLOW' | 'RED';
        if (actualMarginPercentage >= clientData.targetMargin) {
          status = 'GREEN';
        } else if (actualMarginPercentage >= clientData.targetMargin * 0.9) {
          status = 'YELLOW';
        } else {
          status = 'RED';
        }

        await prisma.dailyFinancials.upsert({
          where: {
            clientId_date: {
              clientId: client.id,
              date: date,
            },
          },
          update: {},
          create: {
            clientId: client.id,
            date: date,
            aov: parseFloat(aov.toFixed(2)),
            totalCostPerOrder: parseFloat(totalCostPerOrder.toFixed(2)),
            profitPerOrder: parseFloat(profitPerOrder.toFixed(2)),
            actualMarginPercentage: parseFloat(actualMarginPercentage.toFixed(2)),
            cpaTarget: parseFloat(cpaTarget.toFixed(2)),
            roasTarget: parseFloat(roasTarget.toFixed(2)),
            actualCpa: parseFloat(actualCpa.toFixed(2)),
            actualRoas: parseFloat(actualRoas.toFixed(2)),
            status: status,
          },
        });
      }

      // Create alert rules
      const alertRules = [
        { type: 'ROAS_DROP' as const, threshold: 15, comparisonPeriod: 7, channels: ['EMAIL' as const, 'IN_APP' as const] },
        { type: 'MARGIN_ALERT' as const, threshold: clientData.targetMargin, comparisonPeriod: 1, channels: ['EMAIL' as const, 'SLACK' as const, 'IN_APP' as const] },
        { type: 'CPA_SPIKE' as const, threshold: 20, comparisonPeriod: 7, channels: ['EMAIL' as const, 'IN_APP' as const] },
      ];

      for (const ruleData of alertRules) {
        const existing = await prisma.alertRule.findFirst({
          where: {
            clientId: client.id,
            type: ruleData.type,
          },
        });

        if (!existing) {
          await prisma.alertRule.create({
            data: {
              clientId: client.id,
              type: ruleData.type,
              threshold: ruleData.threshold,
              comparisonPeriod: ruleData.comparisonPeriod,
              channels: ruleData.channels,
              isActive: true,
            },
          });
        }
      }
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: '🎉 Database seeded successfully!',
      summary: {
        users: 1,
        clients: createdClients.length,
        dailyMetrics: createdClients.length * 30 * 4,
        dailyFinancials: createdClients.length * 30,
        alertRules: createdClients.length * 3,
      },
      clients: createdClients.map(({ client }) => ({
        id: client.id,
        name: client.name,
        email: client.email,
      })),
    });
  } catch (error: any) {
    console.error('❌ Error seeding database:', error);
    await prisma.$disconnect();

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
