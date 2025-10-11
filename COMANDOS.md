# 🛠️ Comandos - Bureau Social

Comandos necessários para executar as 10 tarefas prioritárias do projeto.

---

## 1️⃣ Deploy para Produção e Testes OIDC

### Verificar Variáveis de Ambiente
```bash
# Verificar se as variáveis estão configuradas (sem exibir valores sensíveis)
test -n "$DATABASE_URL" && echo "✓ DATABASE_URL configurado" || echo "✗ DATABASE_URL ausente"
test -n "$SESSION_SECRET" && echo "✓ SESSION_SECRET configurado" || echo "✗ SESSION_SECRET ausente"
test -n "$REPL_ID" && echo "✓ REPL_ID configurado" || echo "✗ REPL_ID ausente"
test -n "$REPL_SLUG" && echo "✓ REPL_SLUG configurado" || echo "✗ REPL_SLUG ausente"
test -n "$REPL_OWNER" && echo "✓ REPL_OWNER configurado" || echo "✗ REPL_OWNER ausente"
```

### Deploy/Publish
**Não há comando - usar interface do Replit:**
1. Clicar em **"Publish"** no topo da interface
2. Selecionar **"Autoscale Deployment"** (ideal para web apps)
3. Configurar recursos conforme necessário
4. Confirmar deploy

### Testar em Produção
```bash
# A aplicação estará disponível em:
# https://<seu-projeto>.replit.app

# Testar endpoints críticos
curl https://<seu-projeto>.replit.app/api/auth/user
curl https://<seu-projeto>.replit.app/api/public/cms/hero
```

---

## 2️⃣ Testes E2E do Portal de Membros

### Instalar Dependências de Teste (já instaladas)
```bash
# Playwright já está configurado via run_test tool
# Não é necessário instalar manualmente
```

### Executar Testes
```bash
# Os testes são executados via run_test tool do Replit Agent
# Exemplo de comando para testes manuais (se necessário):
npx playwright test
```

---

## 3️⃣ Geração de Atas em PDF

### Instalar Biblioteca PDF
```bash
# Opção 1: pdfkit (recomendado para Node.js)
npm install pdfkit @types/pdfkit

# Opção 2: jsPDF (alternativa)
npm install jspdf
```

### Testar Geração de PDF
```bash
# Após implementação, testar endpoint
curl -X POST http://localhost:5000/api/assemblies/1/generate-pdf \
  -H "Content-Type: application/json" \
  -b "session_cookie_here"
```

---

## 4️⃣ Sistema de Procurações

### Criar Tabela de Procurações
```bash
# Adicionar schema em shared/schema.ts primeiro, depois:
npm run db:push
```

### Schema Drizzle (adicionar em shared/schema.ts)
```typescript
// ATENÇÃO: users.id é VARCHAR (UUID), não INTEGER!
export const proxies = pgTable("proxies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  giverId: varchar("giver_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  assemblyId: integer("assembly_id").notNull().references(() => assemblies.id),
  createdAt: timestamp("created_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
});
// Adicionar unique constraint via Drizzle ou manualmente depois
```

### Testar Procurações
```bash
# NOTA: receiverId deve ser um UUID válido de outro utilizador
# Obter IDs de utilizadores primeiro:
curl http://localhost:5000/api/users -b "session_cookie_here"

# Criar procuração (substituir UUID_DO_OUTRO_UTILIZADOR)
curl -X POST http://localhost:5000/api/assemblies/1/proxies \
  -H "Content-Type: application/json" \
  -d '{"receiverId": "UUID_DO_OUTRO_UTILIZADOR"}' \
  -b "session_cookie_here"

# Listar procurações
curl http://localhost:5000/api/assemblies/1/my-proxies \
  -b "session_cookie_here"
```

---

## 5️⃣ Votação Secreta

### Instalar Biblioteca de Criptografia (se necessário)
```bash
# Crypto já vem com Node.js, mas para melhor encriptação:
npm install bcrypt @types/bcrypt
```

### Atualizar Schema
```bash
# Adicionar campo isSecret em voting_items
npm run db:push
```

### Testar Votação Secreta
```bash
# Criar item de votação secreta
curl -X POST http://localhost:5000/api/voting-items \
  -H "Content-Type: application/json" \
  -d '{
    "assemblyId": 1,
    "titulo": "Votação Secreta Teste",
    "tipo": "deliberacao",
    "isSecret": true
  }' \
  -b "session_cookie_here"
```

---

## 6️⃣ Sistema de Quotas

### Criar Tabela de Quotas
```bash
# Adicionar schema em shared/schema.ts, depois:
npm run db:push
```

### Schema Drizzle (adicionar em shared/schema.ts)
```typescript
// ATENÇÃO: users.id é VARCHAR (UUID), não INTEGER!
export const quotas = pgTable("quotas", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  year: integer("year").notNull(),
  amount: varchar("amount", { length: 20 }).notNull(), // ou numeric se suportado
  status: varchar("status", { length: 20 }).default('pendente'),
  paidAt: timestamp("paid_at"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});
// Adicionar unique constraint via Drizzle ou manualmente depois
```

### Seed de Quotas Iniciais
```bash
# Criar quotas para todos os utilizadores para 2025
# ATENÇÃO: Executar APENAS após criar a tabela quotas com Drizzle
psql $DATABASE_URL -c "
INSERT INTO quotas (user_id, year, amount, status)
SELECT id, 2025, '50.00', 'pendente'
FROM users
WHERE ativo = true
ON CONFLICT DO NOTHING;
"
```

---

## 7️⃣ Notificações por Email

### Instalar SendGrid ou Nodemailer
```bash
# Opção 1: SendGrid
npm install @sendgrid/mail

# Opção 2: Nodemailer (mais flexível)
npm install nodemailer @types/nodemailer
```

### Configurar Variável de Ambiente
```bash
# Adicionar no Replit Secrets:
# SENDGRID_API_KEY=seu_api_key_aqui
# ou
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=seu_email@gmail.com
# SMTP_PASS=sua_senha_app
```

### Testar Envio de Email
```bash
# Criar script de teste
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
transporter.sendMail({
  from: process.env.SMTP_USER,
  to: 'teste@example.com',
  subject: 'Teste Bureau Social',
  text: 'Email de teste'
}).then(console.log).catch(console.error);
"
```

---

## 8️⃣ Relatórios e Exportações

### Instalar Bibliotecas CSV/Excel
```bash
# Para exportação CSV
npm install csv-writer @types/csv-writer

# Para exportação Excel (opcional)
npm install exceljs
```

### Gerar Relatório CSV (exemplo)
```bash
# Testar endpoint de exportação
curl http://localhost:5000/api/reports/participacao.csv \
  -b "session_cookie_here" \
  -o participacao.csv
```

---

## 9️⃣ Otimizações de Performance

### Análise de Bundle
```bash
# Analisar tamanho do bundle frontend
npm run build -- --analyze

# Ver estatísticas de build
npm run build
```

### Criar Índices na Database
```sql
-- Índices recomendados para performance
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_votes_item ON votes(voting_item_id);
CREATE INDEX idx_presences_assembly ON presences(assembly_id);
CREATE INDEX idx_presences_user ON presences(user_id);
CREATE INDEX idx_documents_tipo ON documents(tipo);
CREATE INDEX idx_assemblies_data ON assemblies(data_assembleia);
```

```bash
# Executar via psql
psql $DATABASE_URL -c "CREATE INDEX idx_votes_user ON votes(user_id);"
# ... repetir para outros índices
```

---

## 🔟 Documentação de API

### Instalar Swagger
```bash
# Swagger UI Express para documentação automática
npm install swagger-ui-express swagger-jsdoc
npm install @types/swagger-ui-express @types/swagger-jsdoc --save-dev
```

### Gerar Documentação
```bash
# A documentação estará disponível em:
# http://localhost:5000/api-docs

# Após deploy:
# https://<seu-projeto>.replit.app/api-docs
```

---

## 🔧 Comandos Úteis Gerais

### Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Verificar erros TypeScript
npx tsc --noEmit

# Formatar código
npx prettier --write .
```

### Database
```bash
# Push schema changes para database
npm run db:push

# ⚠️ ATENÇÃO: Force push pode causar perda de dados!
# Só usar se db:push falhar E após fazer backup
# npm run db:push --force  # USE COM CUIDADO!

# Conectar ao database via psql
psql $DATABASE_URL

# Backup da database
pg_dump $DATABASE_URL > backup.sql

# Restaurar backup
psql $DATABASE_URL < backup.sql
```

### Verificar Logs
```bash
# Logs do servidor (via Replit console)
# Logs ficam visíveis no painel de console do Replit

# Logs da database
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
```

### Testes Manuais de Endpoints
```bash
# Health check
curl http://localhost:5000/api/auth/user

# Listar assembleias
curl http://localhost:5000/api/assemblies

# CMS público
curl http://localhost:5000/api/public/cms/hero
```

---

## 📝 Checklist de Deploy

Antes de fazer deploy para produção:

- [ ] ✅ Todas as variáveis de ambiente configuradas
- [ ] ✅ Database migrada (npm run db:push)
- [ ] ✅ Seeds executados (documentos + CMS)
- [ ] ✅ Frontend buildado sem erros
- [ ] ✅ Testes E2E passando
- [ ] ✅ SESSION_SECRET configurado (aleatório e seguro)
- [ ] ✅ Verificar .gitignore (não commitar secrets)

### Comando Final de Verificação
```bash
# Verificar se tudo está OK antes do deploy
npm run build && echo "✅ Build OK" || echo "❌ Build FAIL"
```

---

**Última atualização**: 11 de Outubro de 2025
