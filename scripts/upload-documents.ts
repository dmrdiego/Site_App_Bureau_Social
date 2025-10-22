import { Client } from '@replit/object-storage';
import { readFileSync } from 'fs';
import { join } from 'path';

const client = new Client();

// Mapeamento de documentos com metadata
const documents = [
  // Estatutos e Regulamentos
  { filename: 'EstatutodoInstitutoPortuguêsdeNegóciosSociais–BureauSocial.pdf', title: 'Estatutos do Bureau Social', tipo: 'regulamento', visibilidade: 'todos' },
  { filename: 'Regulamento_Interno_Bureau_Social.pdf', title: 'Regulamento Interno', tipo: 'regulamento', visibilidade: 'socios' },
  { filename: 'Regulamento_Eleitoral_Bureau_Social.pdf', title: 'Regulamento Eleitoral', tipo: 'regulamento', visibilidade: 'socios' },
  { filename: 'Regulamento_Quotas_Contribuicoes_Bureau_Social.pdf', title: 'Regulamento de Quotas e Contribuições', tipo: 'regulamento', visibilidade: 'socios' },
  { filename: 'Termo_Adesao_Associado_Bureau_Social.pdf', title: 'Termo de Adesão de Associado', tipo: 'pdf', visibilidade: 'todos' },
  
  // Governança e Ética
  { filename: 'Codigo_Conduta_Etica_Bureau_Social.pdf', title: 'Código de Conduta e Ética', tipo: 'regulamento', visibilidade: 'socios' },
  { filename: 'Politica_Conflito_Interesses_Bureau_Social.pdf', title: 'Política de Conflito de Interesses', tipo: 'regulamento', visibilidade: 'socios' },
  { filename: 'Politica_Protecao_Dados_RGPD_Bureau_Social.pdf', title: 'Política de Proteção de Dados (RGPD)', tipo: 'regulamento', visibilidade: 'todos' },
  
  // Planeamento e Estratégia
  { filename: 'Plano_Estrategico_Trienal_2025_2027_Bureau_Social.pdf', title: 'Plano Estratégico Trienal 2025-2027', tipo: 'relatorio', visibilidade: 'socios' },
  { filename: 'Plano_Estrategico_Trienal_2026_2028_Bureau_Social.pdf', title: 'Plano Estratégico Trienal 2026-2028', tipo: 'relatorio', visibilidade: 'socios' },
  { filename: 'Plano_Atividades_2025_Bureau_Social.pdf', title: 'Plano de Atividades 2025', tipo: 'relatorio', visibilidade: 'socios' },
  { filename: 'Plano_Atividades_2026_Bureau_Social.pdf', title: 'Plano de Atividades 2026', tipo: 'relatorio', visibilidade: 'socios' },
  
  // Comunicação e Marketing
  { filename: 'Plano_Comunicacao_Marketing_Bureau_Social.pdf', title: 'Plano de Comunicação e Marketing', tipo: 'relatorio', visibilidade: 'direcao' },
  
  // Documentos Operacionais
  { filename: 'Manual_Associado_Bureau_Social.pdf', title: 'Manual do Associado', tipo: 'pdf', visibilidade: 'socios' },
  { filename: 'Manual_Procedimentos_Administrativos_Financeiros_Bureau_Social.pdf', title: 'Manual de Procedimentos Administrativos e Financeiros', tipo: 'pdf', visibilidade: 'direcao' },
  { filename: 'Orcamento_2025_Bureau_Social.pdf', title: 'Orçamento 2025', tipo: 'relatorio', visibilidade: 'socios' },
  { filename: 'Orcamento_2026_Bureau_Social.pdf', title: 'Orçamento 2026', tipo: 'relatorio', visibilidade: 'socios' },
  { filename: 'Plano_Captacao_Recursos_2025_Bureau_Social.pdf', title: 'Plano de Captação de Recursos 2025', tipo: 'relatorio', visibilidade: 'direcao' },
  { filename: 'Plano_Captacao_Recursos_2026_Bureau_Social.pdf', title: 'Plano de Captação de Recursos 2026', tipo: 'relatorio', visibilidade: 'direcao' },
  { filename: 'Plano_Voluntariado_Bureau_Social.pdf', title: 'Plano de Voluntariado', tipo: 'pdf', visibilidade: 'socios' },
  { filename: 'Relatorio_Atividades_Contas_Modelo_Bureau_Social.pdf', title: 'Relatório de Atividades e Contas (Modelo)', tipo: 'relatorio', visibilidade: 'socios' },
  { filename: 'InstitutoPortuguêsdeNegóciosSociais–BureauSocial_EscopoInstitucional.pdf', title: 'Escopo Institucional', tipo: 'pdf', visibilidade: 'todos' },
  
  // Prestação de Contas
  { filename: 'Ata_Constituicao_Bureau_Social.pdf', title: 'Ata de Constituição', tipo: 'ata', visibilidade: 'socios' },
  
  // Documentos de Parceria
  { filename: 'Apresentacao_Institucional_Bureau_Social.pdf', title: 'Apresentação Institucional', tipo: 'pdf', visibilidade: 'todos' },
  { filename: 'Carta_Apresentacao_Institucional.pdf', title: 'Carta de Apresentação Institucional', tipo: 'docx', visibilidade: 'todos' },
  { filename: 'Ficha_Adesao_Parceiro.pdf', title: 'Ficha de Adesão de Parceiro', tipo: 'pdf', visibilidade: 'todos' },
  { filename: 'Proposta_Parceria_Estrategica.pdf', title: 'Proposta de Parceria Estratégica', tipo: 'pdf', visibilidade: 'todos' },
  { filename: 'Termo_Cooperacao_Padrao.pdf', title: 'Termo de Cooperação Padrão', tipo: 'pdf', visibilidade: 'todos' },
  
  // Para Associados
  { filename: 'Ficha_Candidatura_Associado_Bureau_Social.pdf', title: 'Ficha de Candidatura de Associado', tipo: 'pdf', visibilidade: 'todos' },
];

async function uploadDocuments() {
  const sourceDir = '/tmp/bureau_upgrade/replit-upgrade/public/documentos';
  let uploaded = 0;
  let failed = 0;

  console.log(`🚀 Iniciando upload de ${documents.length} documentos...\n`);

  for (const doc of documents) {
    try {
      const sourcePath = join(sourceDir, doc.filename);
      const objectPath = `/replit-objstore-3a9c0eb3-4dbd-4a81-bd77-5caa0241c210/.private/${doc.filename}`;
      
      // Ler arquivo
      const fileBuffer = readFileSync(sourcePath);
      
      // Upload para Object Storage
      await client.uploadFromBytes(objectPath, fileBuffer);
      
      uploaded++;
      console.log(`✅ [${uploaded}/${documents.length}] ${doc.title}`);
    } catch (error) {
      failed++;
      console.error(`❌ Erro ao fazer upload de ${doc.filename}:`, error);
    }
  }

  console.log(`\n✨ Upload concluído!`);
  console.log(`   ✅ Sucesso: ${uploaded}`);
  if (failed > 0) {
    console.log(`   ❌ Falhas: ${failed}`);
  }
  
  // Gerar SQL para inserir na base de dados
  console.log(`\n📝 SQL para inserir documentos na base de dados:\n`);
  console.log(`-- Adicionar novos documentos do upgrade (usar colunas corretas: titulo, file_path, visivel_para)`);
  console.log(`-- NOTA: uploaded_by deve ser um user ID válido (string), ex: 'admin-test-001'\n`);
  
  documents.forEach((doc, index) => {
    console.log(`('${doc.title}', '${doc.tipo}', 'Categoria', '${doc.filename}', '${doc.visibilidade}', 'admin-test-001'),`);
  });
}

uploadDocuments().catch(console.error);
