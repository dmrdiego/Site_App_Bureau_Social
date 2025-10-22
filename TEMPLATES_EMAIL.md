# Bureau Social - Templates de Email

## Visão Geral

O sistema de notificações do Bureau Social utiliza o serviço **Resend** para envio de emails transacionais. Todos os templates estão em **português (Portugal)** com design institucional.

## Configuração

- **Serviço**: Resend
- **API Key**: Armazenada em `RESEND_API_KEY` (variável de ambiente)
- **Remetente**: dmrdiego@gmail.com
- **Modo de Envio**: Assíncrono (fire-and-forget) usando `setImmediate` e `Promise.all`
- **Implementação**: `server/emailService.ts`

## Templates Disponíveis

### 1. 📅 Nova Assembleia Agendada

**Função**: `createNovaAssembleiaEmail(userName, assemblyInfo)`

**Quando é enviado**: Automaticamente quando um admin cria uma nova assembleia.

**Destinatários**: Todos os associados registados no sistema.

**Conteúdo**:
```
Assunto: Nova Assembleia: [Título]

Corpo:
- Saudação personalizada com nome do associado
- Informação sobre convocação da assembleia
- Título da assembleia
- Data e hora
- Localização
- Descrição (ordem do dia)
- Call-to-action: "Ver Detalhes"
- Nota sobre importância da participação
```

**Código de exemplo**:
```typescript
const emailHtml = createNovaAssembleiaEmail(
  "João Silva",
  {
    titulo: "Assembleia Geral Ordinária 2025",
    dataHora: new Date("2025-11-15T14:00:00Z"),
    localizacao: "Sede do Bureau Social - Lisboa",
    descricao: "Discussão do relatório de atividades e aprovação de contas."
  }
);
```

---

### 2. 📄 Ata Disponível

**Função**: `createAtaDisponivelEmail(userName, assemblyInfo)`

**Quando é enviado**: Automaticamente quando um admin ou membro da direção gera a ata (PDF) de uma assembleia.

**Destinatários**: Todos os associados.

**Conteúdo**:
```
Assunto: Ata Disponível - [Título]

Corpo:
- Saudação personalizada
- Notificação de ata disponível
- Título da assembleia
- Data da realização
- Call-to-action: "Download da Ata"
- Nota sobre importância de verificar aprovações
```

**Código de exemplo**:
```typescript
const emailHtml = createAtaDisponivelEmail(
  "Maria Santos",
  {
    titulo: "Assembleia Geral Ordinária 2025",
    dataHora: new Date("2025-11-15T14:00:00Z")
  }
);
```

---

### 3. 🤝 Procuração Recebida

**Função**: `createProcuracaoRecebidaEmail(receiverName, giverName, assemblyInfo)`

**Quando é enviado**: Automaticamente quando um associado delega o seu voto a outro.

**Destinatário**: Apenas o associado que recebe a delegação de voto.

**Conteúdo**:
```
Assunto: Nova Procuração Recebida - [Título]

Corpo:
- Saudação personalizada
- Notificação de nova procuração
- Nome do delegante
- Título da assembleia
- Data da assembleia
- Explicação sobre voto ponderado (contará como 2 votos)
- Call-to-action: "Ver Assembleia"
- Aviso sobre responsabilidade
```

**Código de exemplo**:
```typescript
const emailHtml = createProcuracaoRecebidaEmail(
  "Carlos Ferreira",
  "Ana Rodrigues",
  {
    titulo: "Assembleia Geral Ordinária 2025",
    dataHora: new Date("2025-11-15T14:00:00Z")
  }
);
```

---

### 4. 📁 Novo Documento Publicado

**Função**: `createNovoDocumentoEmail(userName, documentInfo)`

**Quando é enviado**: Quando um admin publica um novo documento (manual - não implementado nos endpoints atuais).

**Destinatários**: Todos os associados ou filtrados por categoria.

**Conteúdo**:
```
Assunto: Novo Documento Publicado: [Título]

Corpo:
- Saudação personalizada
- Notificação de novo documento
- Título do documento
- Categoria
- Descrição (se disponível)
- Call-to-action: "Ver Documento"
```

**Código de exemplo**:
```typescript
const emailHtml = createNovoDocumentoEmail(
  "Pedro Costa",
  {
    titulo: "Relatório de Atividades 2024",
    categoria: "Relatórios",
    descricao: "Documento com resumo das atividades realizadas em 2024."
  }
);
```

---

## Design dos Templates

### Características Visuais

- **Header**: Azul institucional (#2c5aa0) com logo do Bureau Social
- **Tipografia**: Sans-serif moderna e legível
- **Layout**: Responsivo (desktop e mobile)
- **Botões CTA**: Azul institucional com hover effect
- **Footer**: Informações de contacto e copyright

### Estrutura HTML

Todos os templates seguem a mesma estrutura:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <!-- Container principal -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <!-- Header azul institucional -->
    <!-- Conteúdo do email -->
    <!-- Footer -->
  </table>
</body>
</html>
```

## Endpoints que Enviam Emails

### POST /api/assemblies
**Trigger**: Nova assembleia criada  
**Email**: Nova Assembleia Agendada  
**Destinatários**: Todos os associados

### POST /api/assemblies/:id/generate-minutes
**Trigger**: Ata gerada (PDF)  
**Email**: Ata Disponível  
**Destinatários**: Todos os associados

### POST /api/assemblies/:id/proxies
**Trigger**: Procuração criada  
**Email**: Procuração Recebida  
**Destinatário**: Associado que recebe a delegação

## Teste de Notificações

### Como Testar

1. **Login como Admin** (dmrdiego@gmail.com)
2. **Criar Nova Assembleia**:
   - Ir para "Admin → Nova Assembleia"
   - Preencher formulário
   - Submeter
3. **Verificar Email**: Todos os associados devem receber email
4. **Gerar Ata** (assembleia encerrada):
   - Ir para "Assembleias"
   - Clicar em "Gerar Ata"
5. **Verificar Email**: Todos os associados devem receber email da ata
6. **Criar Procuração**:
   - Ir para "Assembleias"
   - Clicar em "Procuração" (assembleia agendada)
   - Selecionar destinatário
7. **Verificar Email**: Destinatário deve receber email

### Logs de Debug

Os logs são automaticamente escritos no console do servidor:

```bash
✅ Email sent successfully to: user@example.com
❌ Error sending email to user@example.com: [error details]
📊 Emails enviados para X associados sobre nova assembleia
```

## Performance e Escalabilidade

### Estratégia de Envio

- **Assíncrono**: Emails enviados após resposta HTTP (não bloqueia API)
- **Paralelo**: Usa `Promise.all` para enviar vários emails simultaneamente
- **Resiliente**: Erros individuais não impedem outros envios
- **Logging**: Todos os envios são registados no console

### Código de Envio

```typescript
setImmediate(async () => {
  try {
    const users = await storage.getAllUsers();
    await Promise.all(
      users.map(async (user) => {
        if (user.email) {
          try {
            await sendEmail({ to: user.email, subject, html });
          } catch (error) {
            console.error(`Erro ao enviar email para ${user.email}:`, error);
          }
        }
      })
    );
    console.log(`Emails enviados para ${users.length} associados`);
  } catch (error) {
    console.error('Erro geral ao enviar emails:', error);
  }
});
```

## Manutenção

### Editar Templates

1. Abrir `server/emailService.ts`
2. Localizar a função do template desejado
3. Modificar HTML/conteúdo
4. Testar enviando email de teste
5. Verificar renderização em diferentes clientes de email

### Adicionar Novo Template

1. Criar função em `server/emailService.ts`:
```typescript
export function createMeuNovoEmail(params) {
  return `
    <!DOCTYPE html>
    <!-- HTML do template -->
  `;
}
```

2. Importar no `server/routes.ts`:
```typescript
import { createMeuNovoEmail } from './emailService';
```

3. Usar no endpoint apropriado:
```typescript
setImmediate(async () => {
  const html = createMeuNovoEmail(params);
  await sendEmail({ to, subject, html });
});
```

---

**Última atualização**: 22 de Outubro de 2025  
**Versão**: 1.0
