import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AI_BOTS = [
  { name: "VoidRunner", personality: "BERSERKER", elo: 1820 },
  { name: "HexaMind", personality: "AGGRESSIVE", elo: 1740 },
  { name: "ApexBot", personality: "PRESSURER", elo: 1680 },
  { name: "NexoZero", personality: "BALANCED", elo: 1650 },
  { name: "SiliconSoul", personality: "DEFENSIVE", elo: 1580 },
  { name: "LogicLoom", personality: "FORTRESS", elo: 1540 },
  { name: "CodeCaster", personality: "ADAPTIVE", elo: 1720 },
  { name: "KernelKing", personality: "OPENING_BOOK", elo: 1610 },
  { name: "FluxAI", personality: "REACTIONARY", elo: 1420 },
  { name: "CygnusX1", personality: "OPPORTUNIST", elo: 1690 },
  { name: "ByteBard", personality: "PAWN_MASTER", elo: 1510 },
  { name: "QuantumLeap", personality: "CHAOTIC", elo: 1460 },
];

async function main() {
  console.log(`Start seeding ...`);

  for (const aiData of AI_BOTS) {
    const ai = await prisma.chessBot.upsert({
      where: { name: aiData.name },
      update: {
        personality: aiData.personality,
        elo: aiData.elo,
      },
      create: aiData,
    });
    console.log(`Created or updated AI: ${ai.name}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
