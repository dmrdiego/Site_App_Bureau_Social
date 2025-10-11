const fs = require('fs');
const path = require('path');
const { Client } = require('@replit/object-storage');

// Document categories mapping
const DOCUMENT_CATEGORIES = {
  // Parcerias
  'Carta_Apresentacao_Institucional': 'parcerias',
  'Proposta_Parceria_Estrategica': 'parcerias',
  'Termo_Cooperacao_Padrao': 'parcerias',
  'Ficha_Adesao_Parceiro': 'parcerias',
  
  // Atas
  'Ata_Constituicao_Bureau_Social': 'atas',
  
  // Regulamentos
  'Regulamento_Interno_Bureau_Social': 'regulamentos',
  'Regulamento_Eleitoral_Bureau_Social': 'regulamentos',
  'Regulamento_Quotas_Contribuicoes_Bureau_Social': 'regulamentos',
  'Regulamento_Utilizacao_Instalacoes_Bureau_Social': 'regulamentos',
  
  // Políticas
  'Codigo_Conduta_Etica_Bureau_Social': 'politicas',
  'Politica_Protecao_Dados_RGPD_Bureau_Social': 'politicas',
  'Politica_Recursos_Humanos_Bureau_Social': 'politicas',
  'Politica_Conflito_Interesses_Bureau_Social': 'politicas',
  'Politica_Compras_Contratacoes_Bureau_Social': 'politicas',
  
  // Planos
  'Plano_Estrategico_Trienal_2026_2028_Bureau_Social': 'planos',
  'Plano_Atividades_2026_Bureau_Social': 'planos',
  'Plano_Captacao_Recursos_2026_Bureau_Social': 'planos',
  'Plano_Comunicacao_Marketing_Bureau_Social': 'planos',
  'Plano_Voluntariado_Bureau_Social': 'planos',
  
  // Orçamentos
  'Orcamento_2026_Bureau_Social': 'orcamentos',
  
  // Relatórios
  'Relatorio_Atividades_Contas_Modelo_Bureau_Social': 'relatorios',
  
  // Manuais
  'Manual_Associado_Bureau_Social': 'manuais',
  'Manual_Procedimentos_Administrativos_Financeiros_Bureau_Social': 'manuais',
  
  // Fichas
  'Ficha_Candidatura_Associado_Bureau_Social': 'fichas',
  'Termo_Adesao_Associado_Bureau_Social': 'fichas',
  
  // Apresentações
  'Apresentacao_Institucional_Bureau_Social': 'apresentacoes',
};

function getCategory(filename) {
  const baseName = path.parse(filename).name;
  return DOCUMENT_CATEGORIES[baseName] || 'outros';
}

function formatTitle(filename) {
  const baseName = path.parse(filename).name;
  return baseName
    .replace(/_/g, ' ')
    .replace(/Bureau Social/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function uploadDocuments() {
  const client = new Client();
  const extractedDir = 'attached_assets/extracted';
  const uploadedDocs = [];
  const privateDir = process.env.PRIVATE_OBJECT_DIR || '/.private';
  
  // Get all files from both directories
  const parceriasDir = path.join(extractedDir, 'documentos_parcerias');
  const wordDir = path.join(extractedDir, 'documentos_word');
  
  const allFiles = [];
  
  // Collect files from parcerias (only .docx and .pdf)
  if (fs.existsSync(parceriasDir)) {
    const parceriasFiles = fs.readdirSync(parceriasDir)
      .filter(f => f.endsWith('.docx') || f.endsWith('.pdf'))
      .map(f => ({
        localPath: path.join(parceriasDir, f),
        filename: f
      }));
    allFiles.push(...parceriasFiles);
  }
  
  // Collect files from word directory
  if (fs.existsSync(wordDir)) {
    const wordFiles = fs.readdirSync(wordDir)
      .filter(f => f.endsWith('.docx'))
      .map(f => ({
        localPath: path.join(wordDir, f),
        filename: f
      }));
    allFiles.push(...wordFiles);
  }
  
  console.log(`\n📦 Uploading ${allFiles.length} documents to Object Storage...\n`);
  console.log(`Using private directory: ${privateDir}\n`);
  
  for (const file of allFiles) {
    try {
      const fileContent = fs.readFileSync(file.localPath);
      const category = getCategory(file.filename);
      const storagePath = `${privateDir}/documents/${category}/${file.filename}`;
      
      // Upload to object storage
      const uploadResult = await client.uploadFromBytes(storagePath, fileContent);
      
      if (!uploadResult.ok) {
        throw new Error(`Upload failed: ${uploadResult.error}`);
      }
      
      const uploadedDoc = {
        titulo: formatTitle(file.filename),
        categoria: category,
        filepath: storagePath,
        filename: file.filename,
        tamanho: fileContent.length,
        tipo: path.extname(file.filename).substring(1),
        mimeType: file.filename.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
      
      uploadedDocs.push(uploadedDoc);
      console.log(`✅ ${file.filename} → ${category}`);
      
    } catch (error) {
      console.error(`❌ Error uploading ${file.filename}:`, error.message);
    }
  }
  
  // Save metadata to JSON file for the seed script
  fs.writeFileSync(
    'uploaded_documents.json',
    JSON.stringify(uploadedDocs, null, 2)
  );
  
  console.log(`\n✅ All documents uploaded successfully!`);
  console.log(`📄 Metadata saved to uploaded_documents.json`);
  
  // Print summary by category
  const summary = uploadedDocs.reduce((acc, doc) => {
    acc[doc.categoria] = (acc[doc.categoria] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📊 Summary by category:');
  Object.entries(summary).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} document(s)`);
  });
}

uploadDocuments().catch(console.error);
