import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const levels = [
  {
    numero: 1,
    objetivo: "Alcanza 3800 puntos",
    movimientosMaximos: 15,
    puntajeMeta: 3800,
    configuracionJson: {
      title: "Bosque Cristalino",
      objectiveType: "score",
      targetScore: 3800,
      moves: 15
    }
  },
  {
    numero: 2,
    objetivo: "Elimina 36 gemas rojas",
    movimientosMaximos: 16,
    puntajeMeta: null,
    configuracionJson: {
      title: "Cueva de Rubíes",
      objectiveType: "collect",
      targetColor: "red",
      targetCount: 36,
      moves: 16
    }
  },
  {
    numero: 3,
    objetivo: "Alcanza 7200 puntos",
    movimientosMaximos: 12,
    puntajeMeta: 7200,
    configuracionJson: {
      title: "Templo Obsidiana",
      objectiveType: "score",
      targetScore: 7200,
      moves: 12
    }
  }
];

/** Inserta o actualiza los 3 niveles iniciales en la base de datos. */
async function main() {
  for (const level of levels) {
    await prisma.nivel.upsert({
      where: { numero: level.numero },
      update: {
        objetivo: level.objetivo,
        movimientosMaximos: level.movimientosMaximos,
        puntajeMeta: level.puntajeMeta,
        configuracionJson: level.configuracionJson
      },
      create: level
    });
  }

  console.log("Niveles sembrados correctamente.");
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
