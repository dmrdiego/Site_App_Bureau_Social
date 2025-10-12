import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface AssemblyData {
  assembly: any;
  attendees: Array<{
    userId: string;
    name: string;
    email: string;
    role: string;
  }>;
  votingResults: Array<{
    item: any;
    results: Record<string, number>;
    totalVotes: number;
  }>;
}

export async function generateAssemblyMinutesPDF(data: AssemblyData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho Institucional
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#2c5aa0')
         .text('INSTITUTO PORTUGUÊS DE NEGÓCIOS SOCIAIS', { align: 'center' });
      
      doc.fontSize(16)
         .fillColor('#2c5aa0')
         .text('Bureau Social', { align: 'center' });
      
      doc.moveDown(2);
      
      // Título da Ata
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(`ATA DA ASSEMBLEIA ${data.assembly.tipo.toUpperCase()}`, { align: 'center' });
      
      doc.fontSize(14)
         .font('Helvetica')
         .text(data.assembly.titulo, { align: 'center' });
      
      doc.moveDown(2);

      // Informações Básicas
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Data: ', { continued: true })
         .font('Helvetica')
         .text(new Date(data.assembly.dataAssembleia).toLocaleDateString('pt-PT', {
           weekday: 'long',
           year: 'numeric',
           month: 'long',
           day: 'numeric'
         }));
      
      doc.font('Helvetica-Bold')
         .text('Local: ', { continued: true })
         .font('Helvetica')
         .text(data.assembly.local || 'Não especificado');
      
      doc.font('Helvetica-Bold')
         .text('Hora: ', { continued: true })
         .font('Helvetica')
         .text(data.assembly.hora || 'Não especificada');
      
      doc.moveDown(1.5);

      // Presenças
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#2c5aa0')
         .text(`PRESENÇAS (${data.attendees.length}):`);
      
      doc.moveDown(0.5);
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#000000');
      
      data.attendees.forEach((attendee, index) => {
        doc.text(`${index + 1}. ${attendee.name}`, { continued: true })
           .fontSize(10)
           .fillColor('#666666')
           .text(` (${attendee.email}) - ${attendee.role}`)
           .fontSize(11)
           .fillColor('#000000');
      });
      
      doc.moveDown(1.5);

      // Ordem de Trabalhos
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#2c5aa0')
         .text('ORDEM DE TRABALHOS:');
      
      doc.moveDown(0.5);
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#000000')
         .text(data.assembly.ordemDia || 'Não especificada');
      
      doc.moveDown(1.5);

      // Votações Realizadas
      if (data.votingResults.length > 0) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#2c5aa0')
           .text('VOTAÇÕES REALIZADAS:');
        
        doc.moveDown(0.5);

        data.votingResults.forEach((vr, index) => {
          doc.fontSize(12)
             .font('Helvetica-Bold')
             .fillColor('#000000')
             .text(`${index + 1}. ${vr.item.titulo}`);
          
          doc.fontSize(11)
             .font('Helvetica')
             .fillColor('#666666')
             .text(`   ${vr.item.descricao}`);
          
          doc.fontSize(11)
             .font('Helvetica')
             .fillColor('#000000')
             .text('   Resultados:');
          
          doc.text(`      • Aprovar: ${vr.results.aprovar || 0}`);
          doc.text(`      • Rejeitar: ${vr.results.rejeitar || 0}`);
          doc.text(`      • Abstenção: ${vr.results.abstencao || 0}`);
          doc.text(`      Total de votos: ${vr.totalVotes}`);
          
          doc.moveDown(1);
        });
      }

      // Rodapé
      doc.moveDown(2);
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text('_______________________________________________', { align: 'center' });
      
      doc.text('Ata gerada automaticamente pelo sistema Bureau Social', { align: 'center' });
      doc.text(new Date().toLocaleString('pt-PT'), { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
