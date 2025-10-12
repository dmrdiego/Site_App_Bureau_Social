import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const STATUS_FILE = path.join(__dirname, 'STATUS.md');
const TARGET_DATE = new Date('2026-01-01T23:59:59');

// Formato de data em português
function formatDate(date) {
  const day = date.getDate();
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day} de ${month} de ${year}, ${hours}:${minutes}`;
}

// Calcular dias restantes
function daysUntilTarget() {
  const now = new Date();
  const diff = TARGET_DATE - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
}

// Atualizar STATUS.md
function updateStatus() {
  try {
    const now = new Date();
    const daysLeft = daysUntilTarget();
    
    let content = fs.readFileSync(STATUS_FILE, 'utf8');
    
    // Atualizar timestamp
    content = content.replace(
      /\*\*Última atualização\*\*: .+/,
      `**Última atualização**: ${formatDate(now)}`
    );
    
    // Atualizar contador de dias
    const daysText = daysLeft === 1 ? '1 dia' : `${daysLeft} dias`;
    content = content.replace(
      /⏰ Próximo Prazo\*\*: .+/,
      `⏰ Próximo Prazo**: 1 de Janeiro de 2026, 23:59 (faltam ${daysText})`
    );
    
    fs.writeFileSync(STATUS_FILE, content, 'utf8');
    
    console.log(`✅ STATUS.md atualizado: ${formatDate(now)}`);
    console.log(`📅 Faltam ${daysText} até 01/01/2026`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar STATUS.md:', error.message);
    process.exit(1);
  }
}

// Executar
updateStatus();
