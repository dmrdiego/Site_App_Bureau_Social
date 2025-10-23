# 🛠️ Comandos - Bureau Social

Comandos necessários para executar as tarefas prioritárias do projeto.

---

## 🌍 Sistema Bilíngue (i18n)

### Como Funciona

O sistema usa **react-i18next** para suportar **Português (PT)** e **Inglês (EN)**:

1. **Idioma padrão**: Português (pt)
2. **Persistência**: localStorage (chave 'language')
3. **Toggle**: Componente LanguageToggle no header (sem emojis)
4. **Traduções**: Ficheiro `client/src/i18n.ts`

### Chaves de Tradução Disponíveis

```typescript
// Dashboard
t('dashboard.welcome', { name: 'João' })        // "Bem-vindo, João!" / "Welcome, João!"
t('dashboard.summary')                          // Resumo da atividade
t('dashboard.upcomingAssemblies')              // "Próximas Assembleias" / "Upcoming Assemblies"
t('dashboard.pendingVotes')                    // "Votações Pendentes" / "Pending Votes"
t('dashboard.recentDocuments')                 // "Documentos Recentes" / "Recent Documents"
t('dashboard.notifications')                   // "Notificações" / "Notifications"
t('dashboard.viewAll')                         // "Ver todas" / "View all"
t('dashboard.voteNow')                         // "Votar Agora" / "Vote Now"

// Status badges traduzidos
t('dashboard.status.agendada')                 // "Agendada" / "Scheduled"
t('dashboard.status.em_curso')                 // "Em Curso" / "In Progress"
t('dashboard.status.encerrada')                // "Encerrada" / "Closed"
t('dashboard.status.aberta')                   // "Aberta" / "Open"
t('dashboard.status.fechada')                  // "Fechada" / "Closed"

// Mensagens vazias
t('dashboard.noAssemblies')                    // "Nenhuma assembleia agendada no momento"
t('dashboard.noVotes')                         // "Nenhuma votação pendente no momento"
t('dashboard.noDocuments')                     // "Nenhum documento recente"

// Assembleias (✅ 100% traduzido)
t('assemblies.pageTitle')                      // "Assembleias Gerais" / "General Assemblies"
t('assemblies.subtitle')                       // "Ver assembleias agendadas e passadas" / "View scheduled and past assemblies"
t('assemblies.button')                         // "Nova Assembleia" / "New Assembly"
t('assemblies.noAssemblies')                   // "Nenhuma assembleia agendada no momento" / "No scheduled assemblies at the moment"
t('assemblies.searchPlaceholder')              // "Pesquisar assembleias..." / "Search assemblies..."
t('assemblies.dateTime')                       // "Data e Hora" / "Date and Time"
t('assemblies.location')                       // "Local" / "Location"
t('assemblies.minQuorum')                      // "Quórum Mínimo" / "Minimum Quorum"
t('assemblies.minutes')                        // "Ata" / "Minutes"
t('assemblies.participants')                   // "participantes" / "participants"
t('assemblies.votingItems')                    // "itens de votação" / "voting items"
t('assemblies.proxy')                          // "Procuração" / "Proxy"
t('assemblies.status.agendada')                // "Agendada" / "Scheduled"
t('assemblies.status.em_curso')                // "Em Curso" / "In Progress"
t('assemblies.status.encerrada')               // "Encerrada" / "Closed"
t('assemblies.viewAssembly')                   // "Ver Assembleia" / "View Assembly"
t('assemblies.viewMinutes')                    // "Ver Ata" / "View Minutes"
t('assemblies.generateMinutes')                // "Gerar Ata" / "Generate Minutes"
t('assemblies.delegateVote')                   // "Delegar Voto" / "Delegate Vote"
t('assemblies.selectReceiver')                 // "Selecionar destinatário" / "Select receiver"
t('assemblies.revoke')                         // "Revogar" / "Revoke"
t('assemblies.toast.proxyCreated')             // "Procuração criada com sucesso" / "Proxy created successfully"
t('assemblies.toast.proxyRevoked')             // "Procuração revogada" / "Proxy revoked"
t('assemblies.toast.minutesGenerated')         // "Ata gerada com sucesso" / "Minutes generated successfully"
t('assemblies.form.title')                     // "Título" / "Title"
t('assemblies.form.titlePlaceholder')          // "Assembleia Geral de..." / "General Assembly of..."
```

### Como Adicionar Novas Traduções

Editar `client/src/i18n.ts`:

```typescript
// Português
pt: {
  translation: {
    minhaChave: "Meu texto em português",
    outraChave: "Outro texto com {{variavel}}"
  }
}

// Inglês
en: {
  translation: {
    minhaChave: "My text in English",
    outraChave: "Another text with {{variavel}}"
  }
}
```

### Formatação de Datas com i18n

```typescript
import { useTranslation } from 'react-i18next';

function MeuComponente() {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en-US' : 'pt-PT';
  
  return (
    <div>
      {new Date().toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}
    </div>
  );
}
```

### Testar Traduções

```bash
# 1. Iniciar aplicação
npm run dev

# 2. Abrir navegador: http://localhost:5000
# 3. Clicar no toggle de idioma no header (PT/EN)
# 4. Verificar que textos mudam imediatamente
# 5. Recarregar página (F5) - idioma deve persistir
# 6. Verificar localStorage no DevTools: key 'language'
```

---

## 🔐 Autenticação e Gestão de Utilizadores

### Como Funciona o Login

O sistema usa **Replit Auth (OIDC)** - o login é **automático** através da conta Replit:

1. **Aceder à aplicação**: https://pt-bureausocial.replit.app (ou localhost:5000)
2. **Clicar em "Entrar"**: Redireciona para autenticação Replit
3. **Login automático**: Se já estiver logado no Replit, entra automaticamente
4. **Primeiro acesso**: Utilizador é criado automaticamente na BD como `contribuinte` normal

### Login como Administrador

Para ter permissões de **administrador**, o utilizador precisa ter `is_admin = true` na base de dados:

```bash
# 1. Fazer login normal primeiro (para criar o utilizador na BD)
# 2. Descobrir o ID do utilizador (ver seu email no perfil)
# 3. Atualizar permissões na BD:

# Ver utilizadores existentes
psql $DATABASE_URL -c "SELECT id, email, first_name, is_admin, is_direcao FROM users;"

# Tornar um utilizador ADMIN (substituir SEU_USER_ID pelo ID real)
psql $DATABASE_URL -c "UPDATE users SET is_admin = true WHERE email = 'seu_email@example.com';"

# Tornar um utilizador DIREÇÃO (pode gerar atas, mas não é admin total)
psql $DATABASE_URL -c "UPDATE users SET is_direcao = true WHERE email = 'seu_email@example.com';"

# Tornar ADMIN + DIREÇÃO (permissões completas)
psql $DATABASE_URL -c "UPDATE users SET is_admin = true, is_direcao = true WHERE email = 'seu_email@example.com';"
```

### Login como Utilizador Normal

**Utilizadores normais** são criados automaticamente ao fazer login:

1. Aceder à aplicação e clicar em "Entrar"
2. Fazer login com conta Replit
3. **Automaticamente criado** com:
   - `is_admin = false`
   - `is_direcao = false`
   - `categoria = 'contribuinte'`
   - `ativo = true`

### Tipos de Utilizadores

| Tipo | is_admin | is_direcao | Permissões |
|------|----------|------------|------------|
| **Admin** | ✅ `true` | ✅ `true` | Tudo (CMS, criar assembleias, gerar atas, gerir users) |
| **Direção** | ❌ `false` | ✅ `true` | Gerar atas, criar assembleias, ver tudo |
| **Contribuinte** | ❌ `false` | ❌ `false` | Ver assembleias, votar, download docs, perfil |

### Comandos Úteis de Gestão de Utilizadores

```bash
# Listar todos os utilizadores
psql $DATABASE_URL -c "SELECT id, email, first_name, last_name, is_admin, is_direcao, categoria, ativo FROM users ORDER BY created_at DESC;"

# Criar utilizador manualmente (não recomendado - deixar o OIDC criar)
# O sistema cria automaticamente ao fazer login

# Desativar utilizador
psql $DATABASE_URL -c "UPDATE users SET ativo = false WHERE email = 'user@example.com';"

# Reativar utilizador
psql $DATABASE_URL -c "UPDATE users SET ativo = true WHERE email = 'user@example.com';"

# Mudar categoria do utilizador
psql $DATABASE_URL -c "UPDATE users SET categoria = 'fundador' WHERE email = 'user@example.com';"
# Categorias: 'contribuinte', 'efetivo', 'fundador', 'honorario'

# Remover permissões de admin
psql $DATABASE_URL -c "UPDATE users SET is_admin = false, is_direcao = false WHERE email = 'user@example.com';"
```

### Testar Permissões

```bash
# 1. Login como admin (atualizar BD primeiro com comandos acima)
# 2. Verificar acesso ao CMS Editor (sidebar esquerda)
# 3. Verificar botão "Gerar Ata" em assembleias encerradas
# 4. Verificar acesso a "Gerir Associados"

# Login como utilizador normal
# 1. Login normal (automaticamente contribuinte)
# 2. NÃO deve ver CMS Editor na sidebar
# 3. NÃO deve ver "Gerar Ata" 
# 4. Deve poder votar e ver documentos
```

### Utilizadores de Teste Existentes

```bash
# Ver utilizadores admin existentes
psql $DATABASE_URL -c "SELECT email, first_name, is_admin, is_direcao FROM users WHERE is_admin = true;"

# Exemplos na BD atual:
# - dmrdiego@gmail.com (Admin + Direção)
# - admin2@bureausocial.pt (Admin + Direção)
# - admin3@bureausocial.pt (Admin + Direção)
# - user1@bureausocial.pt (Utilizador normal)
```

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
test -n "$RESEND_API_KEY" && echo "✓ RESEND_API_KEY configurado" || echo "✗ RESEND_API_KEY ausente"
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
  status: varchar("status", { length: 20 }).default('active'),
  createdAt: timestamp("created_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
});
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

## 5️⃣ Notificações por Email (Resend)

### Configurar API Key
```bash
# Já configurado: RESEND_API_KEY no Replit Secrets
# Verificar:
test -n "$RESEND_API_KEY" && echo "✓ RESEND_API_KEY configurado" || echo "✗ RESEND_API_KEY ausente"
```

### Templates de Email Disponíveis

O sistema envia emails automaticamente para:
- **Nova assembleia criada** (todos os membros ativos)
- **Ata disponível** (participantes da assembleia)
- **Procuração recebida** (destinatário da procuração)
- **Novo documento adicionado** (todos os membros ativos)

```bash
# Ver emails enviados (logs do servidor)
# Os emails são enviados de forma assíncrona (não bloqueiam requests)
```

---

## 6️⃣ Votação Secreta

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

## 7️⃣ Sistema de Quotas

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
  amount: varchar("amount", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).default('pendente'),
  paidAt: timestamp("paid_at"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});
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

# Dashboard summary
curl http://localhost:5000/api/dashboard/summary \
  -b "session_cookie_here"
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
- [ ] ✅ RESEND_API_KEY configurado
- [ ] ✅ Verificar .gitignore (não commitar secrets)

### Comando Final de Verificação
```bash
# Verificar se tudo está OK antes do deploy
npm run build && echo "✅ Build OK" || echo "❌ Build FAIL"
```

---

**Última atualização**: 23 de Outubro de 2025, 15:00  
**Notas da última atualização**:
- ✅ Adicionadas 25+ chaves de tradução para página Assembleias (/assembleias)
- ✅ Sistema i18n agora 100% funcional em Dashboard e Assembleias
- ✅ Próximas páginas a traduzir: Documentos, Perfil, Votos, Admin Users
