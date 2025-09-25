import { PrismaClient } from '@prisma/client';
import activityBranchesSeed from './seeds/activity-branches.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando processo de seed...\n');

  try {
    console.log('Executando seed dos ramos de atividade...');
    await activityBranchesSeed();

    console.log('\nTodos os seeds foram executados com sucesso!');
  } catch (error) {
    console.error('Erro durante a execução dos seeds:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();