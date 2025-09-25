import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const activityBranchesData = [
  {
    name: 'Mecânico de Veículos',
    description: 'Manutenção e reparo de automóveis, motocicletas e veículos comerciais',
    services: [
      { name: 'Troca de óleo', description: 'Troca de óleo do motor e filtro' },
      { name: 'Revisão geral', description: 'Inspeção completa do veículo' },
      { name: 'Troca de pastilhas de freio', description: 'Substituição das pastilhas de freio' },
      { name: 'Alinhamento e balanceamento', description: 'Alinhamento das rodas e balanceamento' },
      { name: 'Diagnóstico eletrônico', description: 'Diagnóstico por scanner automotivo' },
      { name: 'Troca de bateria', description: 'Substituição da bateria do veículo' },
      { name: 'Reparo de motor', description: 'Manutenção e reparo do motor' },
      { name: 'Troca de pneus', description: 'Substituição de pneus' },
      { name: 'Reparo de ar condicionado', description: 'Manutenção do sistema de ar condicionado' },
      { name: 'Troca de correia dentada', description: 'Substituição da correia dentada' },
    ],
  },
  {
    name: 'Eletricista',
    description: 'Instalação e manutenção de sistemas elétricos residenciais, comerciais e industriais',
    services: [
      { name: 'Instalação elétrica residencial', description: 'Instalação completa de fiação residencial' },
      { name: 'Manutenção de quadro elétrico', description: 'Reparo e manutenção de quadros de distribuição' },
      { name: 'Instalação de tomadas', description: 'Instalação de tomadas e interruptores' },
      { name: 'Troca de disjuntores', description: 'Substituição de disjuntores' },
      { name: 'Instalação de ventilador de teto', description: 'Instalação de ventiladores' },
      { name: 'Reparo de chuveiro elétrico', description: 'Manutenção de chuveiros elétricos' },
      { name: 'Instalação de lâmpadas LED', description: 'Troca para iluminação LED' },
      { name: 'Cabeamento de rede', description: 'Instalação de cabos de internet' },
      { name: 'Instalação de interfone', description: 'Instalação de sistemas de interfone' },
      { name: 'Manutenção preventiva', description: 'Inspeção e manutenção preventiva' },
    ],
  },
  {
    name: 'Obras e Construção',
    description: 'Serviços de construção civil, reformas e acabamentos',
    services: [
      { name: 'Construção de parede', description: 'Construção de paredes em alvenaria' },
      { name: 'Pintura residencial', description: 'Pintura interna e externa' },
      { name: 'Instalação de piso', description: 'Colocação de pisos cerâmicos e laminados' },
      { name: 'Reforma de banheiro', description: 'Reforma completa de banheiros' },
      { name: 'Instalação de portas', description: 'Instalação de portas e janelas' },
      { name: 'Reboco e massa corrida', description: 'Acabamento de paredes' },
      { name: 'Instalação de gesso', description: 'Forro de gesso e sancas' },
      { name: 'Impermeabilização', description: 'Serviços de impermeabilização' },
      { name: 'Demolição', description: 'Serviços de demolição controlada' },
      { name: 'Construção de laje', description: 'Construção de lajes de concreto' },
    ],
  },
  {
    name: 'Manutenção de Celulares',
    description: 'Reparo e manutenção de smartphones e tablets',
    services: [
      { name: 'Troca de tela', description: 'Substituição de tela quebrada ou danificada' },
      { name: 'Troca de bateria', description: 'Substituição da bateria do celular' },
      { name: 'Reparo de placa mãe', description: 'Manutenção da placa principal' },
      { name: 'Desbloqueio de aparelho', description: 'Desbloqueio e formatação' },
      { name: 'Troca de alto-falante', description: 'Substituição de alto-falantes' },
      { name: 'Reparo de câmera', description: 'Manutenção da câmera frontal e traseira' },
      { name: 'Troca de conector de carga', description: 'Substituição do conector USB' },
      { name: 'Instalação de película', description: 'Aplicação de película protetora' },
      { name: 'Limpeza interna', description: 'Limpeza de componentes internos' },
      { name: 'Recuperação de dados', description: 'Recuperação de fotos e arquivos' },
    ],
  },
  {
    name: 'Vidraçaria',
    description: 'Serviços de vidros temperados, espelhos e esquadrias de alumínio',
    services: [
      { name: 'Instalação de vidro temperado', description: 'Instalação de vidros temperados' },
      { name: 'Troca de vidro quebrado', description: 'Substituição de vidros danificados' },
      { name: 'Instalação de espelhos', description: 'Colocação de espelhos decorativos' },
      { name: 'Box para banheiro', description: 'Instalação de box de vidro' },
      { name: 'Porta de vidro', description: 'Instalação de portas de vidro' },
      { name: 'Janela de alumínio', description: 'Instalação de esquadrias de alumínio' },
      { name: 'Guarda-corpo de vidro', description: 'Instalação de guarda-corpos' },
      { name: 'Fachada de vidro', description: 'Instalação de fachadas comerciais' },
      { name: 'Manutenção de esquadrias', description: 'Reparo de janelas e portas' },
      { name: 'Vidro automotivo', description: 'Troca de para-brisas e vidros laterais' },
    ],
  },
  {
    name: 'Encanamento e Hidráulica',
    description: 'Serviços de instalação e manutenção de sistemas hidráulicos',
    services: [
      { name: 'Desentupimento de pia', description: 'Desobstrução de pias e ralos' },
      { name: 'Reparo de vazamento', description: 'Correção de vazamentos em geral' },
      { name: 'Instalação de torneira', description: 'Instalação e troca de torneiras' },
      { name: 'Troca de registro', description: 'Substituição de registros' },
      { name: 'Instalação de chuveiro', description: 'Instalação de chuveiros e duchas' },
      { name: 'Reparo de vaso sanitário', description: 'Manutenção de vasos sanitários' },
      { name: 'Instalação hidráulica', description: 'Instalação completa de tubulações' },
      { name: 'Limpeza de caixa d\'água', description: 'Higienização de reservatórios' },
      { name: 'Desentupimento de esgoto', description: 'Desobstrução de tubulações de esgoto' },
      { name: 'Instalação de filtro', description: 'Instalação de filtros de água' },
    ],
  },
  {
    name: 'Estética e Beleza',
    description: 'Serviços de beleza, estética corporal e cuidados pessoais',
    services: [
      { name: 'Corte de cabelo feminino', description: 'Corte e modelagem feminina' },
      { name: 'Corte de cabelo masculino', description: 'Corte e acabamento masculino' },
      { name: 'Coloração e mechas', description: 'Tintura e mechas' },
      { name: 'Escova progressiva', description: 'Alisamento capilar' },
      { name: 'Manicure e pedicure', description: 'Cuidados com unhas' },
      { name: 'Depilação a cera', description: 'Depilação corporal' },
      { name: 'Limpeza de pele', description: 'Tratamento facial' },
      { name: 'Massagem relaxante', description: 'Massagem terapêutica' },
      { name: 'Design de sobrancelhas', description: 'Modelagem de sobrancelhas' },
      { name: 'Aplicação de gel', description: 'Unha em gel' },
    ],
  },
  {
    name: 'Informática e Tecnologia',
    description: 'Manutenção de computadores, notebooks e serviços de TI',
    services: [
      { name: 'Formatação de computador', description: 'Reinstalação do sistema operacional' },
      { name: 'Remoção de vírus', description: 'Limpeza de malwares e vírus' },
      { name: 'Instalação de programas', description: 'Instalação de softwares' },
      { name: 'Troca de HD/SSD', description: 'Substituição de disco rígido' },
      { name: 'Upgrade de memória RAM', description: 'Ampliação de memória' },
      { name: 'Configuração de rede', description: 'Configuração de internet e WiFi' },
      { name: 'Backup de dados', description: 'Cópia de segurança' },
      { name: 'Reparo de tela de notebook', description: 'Troca de display' },
      { name: 'Limpeza interna', description: 'Limpeza de componentes' },
      { name: 'Recuperação de dados', description: 'Recuperação de arquivos perdidos' },
    ],
  },
  {
    name: 'Veterinária',
    description: 'Cuidados médicos veterinários para animais domésticos',
    services: [
      { name: 'Consulta veterinária', description: 'Consulta clínica geral' },
      { name: 'Vacinação', description: 'Aplicação de vacinas' },
      { name: 'Castração', description: 'Cirurgia de castração' },
      { name: 'Exames laboratoriais', description: 'Exames de sangue e urina' },
      { name: 'Tosa higiênica', description: 'Corte de pelos higiênico' },
      { name: 'Banho medicinal', description: 'Banho terapêutico' },
      { name: 'Tratamento dentário', description: 'Limpeza e tratamento dental' },
      { name: 'Cirurgias gerais', description: 'Procedimentos cirúrgicos' },
      { name: 'Atendimento de emergência', description: 'Pronto-socorro veterinário' },
      { name: 'Vermifugação', description: 'Tratamento contra vermes' },
    ],
  },
  {
    name: 'Limpeza e Conservação',
    description: 'Serviços de limpeza residencial, comercial e conservação predial',
    services: [
      { name: 'Limpeza residencial', description: 'Limpeza completa da casa' },
      { name: 'Limpeza pós-obra', description: 'Limpeza após construção/reforma' },
      { name: 'Lavagem de estofados', description: 'Higienização de sofás e poltronas' },
      { name: 'Enceramento de piso', description: 'Tratamento e enceramento' },
      { name: 'Limpeza de vidros', description: 'Lavagem de janelas e fachadas' },
      { name: 'Dedetização', description: 'Controle de pragas' },
      { name: 'Limpeza de caixa d\'água', description: 'Higienização de reservatórios' },
      { name: 'Jardinagem', description: 'Cuidados com jardins e plantas' },
      { name: 'Limpeza de ar condicionado', description: 'Higienização de aparelhos' },
      { name: 'Organização residencial', description: 'Organização de ambientes' },
    ],
  },
];

async function seed() {
  console.log('Iniciando seed dos ramos de atividade...');

  try {

    for (const branchData of activityBranchesData) {
      console.log(`Criando ramo: ${branchData.name}`);

      const existingBranch = await prisma.activityBranch.findFirst({
        where: { name: branchData.name }
      });

      let branch;
      if (existingBranch) {
        console.log(`Ramo já existe, atualizando...`);
        branch = await prisma.activityBranch.update({
          where: { id: existingBranch.id },
          data: {
            name: branchData.name,
            description: branchData.description,
          },
        });
      } else {
        branch = await prisma.activityBranch.create({
          data: {
            name: branchData.name,
            description: branchData.description,
          },
        });
      }

      for (const serviceData of branchData.services) {
        const existingService = await prisma.defaultActivityService.findFirst({
          where: {
            name: serviceData.name,
            activityBranchId: branch.id,
          }
        });

        if (!existingService) {
          await prisma.defaultActivityService.create({
            data: {
              name: serviceData.name,
              description: serviceData.description,
              activityBranchId: branch.id,
            },
          });
        }
      }

      console.log(`${branchData.services.length} serviços adicionados`);
    }

    console.log('Seed concluído com sucesso!');
    console.log(`Total de ramos criados: ${activityBranchesData.length}`);

    const totalBranches = await prisma.activityBranch.count();
    const totalServices = await prisma.defaultActivityService.count();

    console.log(`Estatísticas finais:`);
    console.log(`   • Ramos de atividade: ${totalBranches}`);
    console.log(`   • Serviços padrão: ${totalServices}`);

  } catch (error) {
    console.error('Erro durante o seed:', error);
    throw error;
  }
}

if (require.main === module) {
  seed()
    .catch((e) => {
      console.error('Falha no seed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seed;