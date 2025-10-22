import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'onboarding@resend.dev';

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailTemplate) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }

    console.log(`Email enviado com sucesso: ${data?.id}`);
    return data;
  } catch (err) {
    console.error('Falha ao enviar email:', err);
    throw err;
  }
}

export function createNovaAssembleiaEmail(userName: string, assembleia: {
  titulo: string;
  dataHora: Date;
  localizacao: string;
  descricao?: string;
}): string {
  const dataFormatada = new Date(assembleia.dataHora).toLocaleString('pt-PT', {
    dateStyle: 'long',
    timeStyle: 'short'
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .highlight { background: white; padding: 15px; border-left: 4px solid #2c5aa0; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nova Assembleia Geral</h1>
          </div>
          <div class="content">
            <p>Caro(a) ${userName},</p>
            <p>Foi agendada uma nova Assembleia Geral do Instituto Português de Negócios Sociais - Bureau Social.</p>
            
            <div class="highlight">
              <h2>${assembleia.titulo}</h2>
              <p><strong>📅 Data e Hora:</strong> ${dataFormatada}</p>
              <p><strong>📍 Local:</strong> ${assembleia.localizacao}</p>
              ${assembleia.descricao ? `<p><strong>Descrição:</strong> ${assembleia.descricao}</p>` : ''}
            </div>

            <p>Por favor, confirme a sua presença através do Portal de Associados.</p>
            <p>A sua participação é importante para nós.</p>
          </div>
          <div class="footer">
            <p>Instituto Português de Negócios Sociais - Bureau Social</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function createAtaDisponivelEmail(userName: string, assembleia: {
  titulo: string;
  dataHora: Date;
}): string {
  const dataFormatada = new Date(assembleia.dataHora).toLocaleString('pt-PT', {
    dateStyle: 'long'
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .highlight { background: white; padding: 15px; border-left: 4px solid #2c5aa0; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ata da Assembleia Disponível</h1>
          </div>
          <div class="content">
            <p>Caro(a) ${userName},</p>
            <p>Informamos que a ata da assembleia já se encontra disponível para consulta.</p>
            
            <div class="highlight">
              <h2>${assembleia.titulo}</h2>
              <p><strong>📅 Data:</strong> ${dataFormatada}</p>
            </div>

            <p>Pode consultar e fazer o download da ata através do Portal de Associados, na secção de Assembleias.</p>
          </div>
          <div class="footer">
            <p>Instituto Português de Negócios Sociais - Bureau Social</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function createProcuracaoRecebidaEmail(userName: string, giverName: string, assembleia: {
  titulo: string;
  dataHora: Date;
}): string {
  const dataFormatada = new Date(assembleia.dataHora).toLocaleString('pt-PT', {
    dateStyle: 'long',
    timeStyle: 'short'
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .highlight { background: white; padding: 15px; border-left: 4px solid #2c5aa0; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nova Procuração Recebida</h1>
          </div>
          <div class="content">
            <p>Caro(a) ${userName},</p>
            <p>Recebeu uma procuração para votar em nome de outro associado.</p>
            
            <div class="highlight">
              <p><strong>👤 Associado:</strong> ${giverName}</p>
              <p><strong>📋 Assembleia:</strong> ${assembleia.titulo}</p>
              <p><strong>📅 Data e Hora:</strong> ${dataFormatada}</p>
            </div>

            <p>O seu voto nesta assembleia terá peso duplo, representando também o voto de ${giverName}.</p>
            <p>Pode consultar todas as procurações recebidas no Portal de Associados.</p>
          </div>
          <div class="footer">
            <p>Instituto Português de Negócios Sociais - Bureau Social</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function createNovoDocumentoEmail(userName: string, documento: {
  titulo: string;
  categoria: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .highlight { background: white; padding: 15px; border-left: 4px solid #2c5aa0; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Novo Documento Disponível</h1>
          </div>
          <div class="content">
            <p>Caro(a) ${userName},</p>
            <p>Foi publicado um novo documento no repositório do Bureau Social.</p>
            
            <div class="highlight">
              <h2>${documento.titulo}</h2>
              <p><strong>📁 Categoria:</strong> ${documento.categoria}</p>
            </div>

            <p>Pode consultar o documento através do Portal de Associados, na secção de Documentos.</p>
          </div>
          <div class="footer">
            <p>Instituto Português de Negócios Sociais - Bureau Social</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
