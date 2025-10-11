/**
 * Seed script to populate documents table with Bureau Social documents
 * This script copies files to object storage and creates database records
 */

import { Client } from '@replit/object-storage';
import { db } from './server/db';
import { documents, objectEntities } from './shared/schema';
import fs from 'fs';
import path from 'path';

// Document categories mapping
const DOCUMENT_CATEGORIES: Record<string, string> = {
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

function getCategory(filename: string): string {
  const baseName = path.parse(filename).name;
  return DOCUMENT_CATEGORIES[baseName] || 'outros';
}

function formatTitle(filename: string): string {
  const baseName = path.parse(filename).name;
  return baseName
    .replace(/_/g, ' ')
    .replace(/Bureau Social/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function seedDocuments() {
  const client = new Client();
  const extractedDir = 'attached_assets/extracted';
  const privateDir = process.env.PRIVATE_OBJECT_DIR;
  
  if (!privateDir) {
    throw new Error('PRIVATE_OBJECT_DIR environment variable not set');
  }

  // Get all files from both directories
  const parceriasDir = path.join(extractedDir, 'documentos_parcerias');
  const wordDir = path.join(extractedDir, 'documentos_word');
  
  const allFiles: Array<{ localPath: string; filename: string }> = [];
  
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
  
  console.log(`\n📦 Seeding ${allFiles.length} documents...\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of allFiles) {
    try {
      const fileContent = fs.readFileSync(file.localPath);
      const category = getCategory(file.filename);
      const timestamp = Date.now();
      const objectPath = `${privateDir}/documents/${timestamp}-${file.filename}`;
      
      // Upload to object storage
      const uploadResult = await client.uploadFromBytes(objectPath, fileContent);
      
      if (!uploadResult.ok) {
        throw new Error(`Upload failed: ${uploadResult.error}`);
      }
      
      const mimeType = file.filename.endsWith('.pdf') 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      // Create object entity record
      await db.insert(objectEntities).values({
        objectPath,
        owner: 'system', // System-created documents
        visibility: 'private',
        metadata: {
          originalName: file.filename,
          mimeType,
          size: fileContent.length,
        },
      });
      
      // Create document record
      await db.insert(documents).values({
        titulo: formatTitle(file.filename),
        tipo: path.extname(file.filename).substring(1),
        categoria: category,
        filePath: objectPath,
        fileSize: fileContent.length,
        visivelPara: 'todos',
        uploadedBy: 'system',
      });
      
      console.log(`✅ ${file.filename} → ${category}`);
      successCount++;
      
    } catch (error: any) {
      console.error(`❌ Error uploading ${file.filename}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n✅ Seed completed!`);
  console.log(`   Success: ${successCount} documents`);
  console.log(`   Errors: ${errorCount} documents`);
  
  // Print summary by category
  const result = await db.select().from(documents);
  const summary = result.reduce((acc: Record<string, number>, doc) => {
    const cat = doc.categoria || 'outros';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📊 Documents in database by category:');
  Object.entries(summary).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} document(s)`);
  });
  
  process.exit(0);
}

seedDocuments().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
