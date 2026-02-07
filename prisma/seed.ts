const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const AI_PERSONALITIES = {
  "ByteBard": "PAWN_MASTER", "HexaMind": "AGGRESSIVE", "CodeCaster": "ADAPTIVE", 
  "NexoZero": "BALANCED", "QuantumLeap": "CHAOTIC", "SiliconSoul": "DEFENSIVE", 
  "LogicLoom": "FORTRESS", "KernelKing": "OPENING_BOOK", "VoidRunner": "BERSERKER", 
  "FluxAI": "REACTIONARY", "CygnusX1": "OPPORTUNIST", "ApexBot": "PRESSURER"
};

async function main() {
  console.log(`Start seeding ...`);

  const aisToCreate = Object.entries(AI_PERSONALITIES).map(([name, personality]) => ({
    email: `${name.toLowerCase()}@system.io`,
    name,
    isAI: true,
    personality,
  }));

  for (const aiData of aisToCreate) {
    const ai = await prisma.chessPlayer.upsert({
      where: { email: aiData.email },
      update: { personality: aiData.personality },
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
