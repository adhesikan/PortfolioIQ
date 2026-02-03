import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "demo@portfolioiq.app",
      name: "Demo User",
      portfolios: {
        create: {
          name: "Growth",
          holdings: {
            create: [
              {
                ticker: "AAPL",
                assetClass: "equity",
                quantity: 40,
                avgCost: 140,
                source: "manual"
              },
              {
                ticker: "VTI",
                assetClass: "etf",
                quantity: 25,
                avgCost: 200,
                source: "csv"
              }
            ]
          }
        }
      }
    }
  });

  console.log(`Seeded demo user ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
