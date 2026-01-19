import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
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

  for (const clientData of clients) {
    const client = await prisma.client.upsert({
      where: { email: clientData.email },
      update: {},
      create: {
        name: clientData.name,
        email: clientData.email,
        accountManagerId: user.id,
      },
    });
    console.log(`✅ Created client: ${client.name}`);

    // Create financial profile
    const financialProfile = await prisma.financialProfile.upsert({
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
    console.log(`  ✅ Created financial profile for ${client.name}`);

    // Generate 30 days of demo data
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), i);

      // Add some randomness to make data realistic
      const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120%
      const dayOfWeek = date.getDay();
      const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1; // Lower on weekends

      const platforms: Array<'SHOPIFY' | 'META' | 'TIKTOK_SHOP' | 'TIKTOK_ADS'> = ['SHOPIFY', 'META', 'TIKTOK_SHOP', 'TIKTOK_ADS'];

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
        const impressions = Math.floor(orders * 50);
        const clicks = Math.floor(orders * 3);

        // Create daily metrics
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
            impressions: impressions,
            clicks: clicks,
            aov: aov,
            roas: roas,
            cpa: cpa,
          },
        });
      }

      // Calculate daily financials (aggregated across all platforms)
      const totalRevenue = clientData.avgRevenue * randomFactor * weekendFactor;
      const totalOrders = Math.floor(clientData.avgOrders * randomFactor * weekendFactor);
      const totalAdSpend = clientData.avgAdSpend * randomFactor * weekendFactor;

      const aov = totalRevenue / totalOrders;
      const actualCpa = totalAdSpend / totalOrders;
      const actualRoas = totalRevenue / totalAdSpend;

      // Calculate costs
      const cogs = aov * (clientData.cogsPercentage / 100);
      const paymentFee = aov * 0.029;
      const merchantFee = 0.30;
      const shippingCost = 8.50;
      const fulfillmentCost = 3.50;
      const totalCostPerOrder = cogs + paymentFee + merchantFee + shippingCost + fulfillmentCost;

      const profitPerOrder = aov - totalCostPerOrder - actualCpa;
      const actualMarginPercentage = (profitPerOrder / aov) * 100;

      // Calculate target CPA and ROAS
      const targetProfit = aov * (clientData.targetMargin / 100);
      const cpaTarget = aov - totalCostPerOrder - targetProfit;
      const roasTarget = aov / cpaTarget;

      // Determine status
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
    console.log(`  ✅ Generated 30 days of metrics for ${client.name}`);

    // Create alert rules
    const alertRules = [
      {
        type: 'ROAS_DROP' as const,
        threshold: 15,
        comparisonPeriod: 7,
        channels: ['EMAIL' as const, 'IN_APP' as const],
      },
      {
        type: 'MARGIN_ALERT' as const,
        threshold: clientData.targetMargin,
        comparisonPeriod: 1,
        channels: ['EMAIL' as const, 'SLACK' as const, 'IN_APP' as const],
      },
      {
        type: 'CPA_SPIKE' as const,
        threshold: 20,
        comparisonPeriod: 7,
        channels: ['EMAIL' as const, 'IN_APP' as const],
      },
    ];

    for (const ruleData of alertRules) {
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
    console.log(`  ✅ Created alert rules for ${client.name}`);
  }

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📊 Demo Data Summary:');
  console.log(`   - Users: ${clients.length + 1}`);
  console.log(`   - Clients: ${clients.length}`);
  console.log(`   - Daily Metrics: ${clients.length * 30 * 4} records`);
  console.log(`   - Daily Financials: ${clients.length * 30} records`);
  console.log(`   - Alert Rules: ${clients.length * 3} rules`);
  console.log('');
  console.log('🔐 Login Credentials:');
  console.log('   Email: demo@kommerce.ai');
  console.log('   Password: demo123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
