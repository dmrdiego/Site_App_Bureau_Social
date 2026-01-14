# 📊 Bureau Social - Status do Projeto

**Última atualização**: 23 de Outubro de 2025, 15:00

---

## 🚀 Atualização de Estado - 14/01/2026 (CONCLUÍDO)

**Status**: 🟢 Done  
**Data de Conclusão**: 14 de Janeiro de 2026, 12:00 ✓

### 🔧 Funcionalidades Implementadas e Melhorias
1.  **Sistema de Quotas**: Implementada gestão de quotas anuais (Schema, Storage, API, UI e i18n).
2.  **Relatórios e Exportações**: Adicionada exportação CSV para Assembleias e Votos (com proteção de anonimato).
3.  **Correção de Bug de Votação**: Sincronizadas chaves de votação no frontend para evitar falhas de submissão.
4.  **Internacionalização (i18n)**: Tradução completa da Navegação Pública e Repositório de Documentos.
5.  **Otimização de Performance**: Adicionados índices nas tabelas `assemblies`, `votes`, `proxies` e `voting_items`.
6.  **Fix de Tipos**: Resolvidos erros críticos de schema (Omit/Drizzle) e rendering do React.

---

## ✅ Correções Finais de Deploy - 23/10/2025 (CONCLUÍDO)

**Status**: 🟢 Done  
**Data de Conclusão**: 23 de Outubro de 2025, 15:00 ✓

### 🔧 Problemas Identificados e Corrigidos

**1. Bug Crítico: upsertUser duplicate key error**
- **Sintoma**: Servidor crashava ao tentar login OIDC quando email já existia mas ID (sub) era novo
- **Causa Raiz**: Lógica ternária verificava ID primeiro e parava, não verificava email
- **Impacto**: E2E tests falhavam com `duplicate key value violates unique constraint "users_email_unique"`

**Correção Aplicada** (server/storage.ts):
```typescript
// ANTES (BUGGY):
const existing = user.id ? await this.getUser(user.id) :
                 user.email ? await this.getUserByEmail(user.email) : undefined;

// DEPOIS (CORRIGIDO):
let existing = user.id ? await this.getUser(user.id) : undefined;

if (!existing && user.email) {
  existing = await this.getUserByEmail(user.email);
}
```

**Validação**: ✅ Architect aprovou | ✅ E2E test passou | ✅ Servidor estável

---

**2. i18n Missing: Assemblies.tsx textos hardcoded em PT**
- **Sintoma**: Toggle PT/EN não funcionava em página /assembleias (textos fixos em português)
- **Causa Raiz**: Componentes não usavam `t()` calls, faltavam 25+ chaves de tradução

**Correção Aplicada**:
- ✅ 25+ chaves adicionadas em `client/src/i18n.ts` (PT + EN)
- ✅ Assemblies.tsx 100% traduzido (heading, labels, buttons, status badges)
- ✅ ProxyDialog component usando `useTranslation` hook
- ✅ AssemblyCard component usando `useTranslation` hook
- ✅ Toast messages traduzidas

**Chaves i18n adicionadas**:
```typescript
assemblies: {
  pageTitle, subtitle, button, noAssemblies, searchPlaceholder,
  dateTime, location, minQuorum, minutes, participants, votingItems,
  proxy, status, viewAssembly, viewMinutes, generateMinutes, 
  delegateVote, selectReceiver, revoke, toast.*, form.*
}
```

**Validação**: ✅ Architect aprovou | ✅ E2E test passou | ✅ PT↔EN funcional

---

### 📊 Testes E2E Executados (23/10/2025)

**Teste 1: Criação de Assembleia + i18n**
- ✅ Login OIDC → Dashboard → Assembleias
- ✅ Form criação funcional (data ISO → Date object)
- ✅ POST /api/assemblies: 201 Created
- ✅ Redirect e toast de sucesso

**Teste 2: i18n PT↔EN Toggle em /Assembleias**
- ✅ Textos padrão em PT: "Nova Assembleia", "Data e Hora", "Quórum Mínimo"
- ✅ Toggle para EN funcional
- ✅ Textos em EN: "New Assembly", "Date and Time", "Minimum Quorum"
- ✅ localStorage persiste idioma

**Teste 3: UI/UX Completo (Desktop + Mobile)**
- ✅ Landing page pública (Hero, Missão, Serviços, Projetos)
- ✅ Dashboard portal (cards de estatísticas, sidebar)
- ✅ Assembleias page (lista, criação, proxy system)
- ✅ Documentos page (58 documentos, categorias)
- ✅ Responsividade mobile (375x667 - iPhone SE)
- ✅ Screenshots capturados (8 full-page screenshots)

📄 **Relatório Completo**: Ver `RELATORIO_UI_UX.md`

---

### 🎯 Status Final

- ✅ **0 LSP Errors** (TypeScript 100% válido)
- ✅ **Servidor Estável** (0 crashes após fix upsertUser)
- ✅ **3/3 E2E Tests** passing (Assembleia Creation, i18n PT/EN, UI/UX Full)
- ✅ **i18n 100%** em /assembleias (25+ chaves PT/EN)
- ✅ **Responsividade** validada (desktop + mobile)
- ✅ **Architect Review** aprovado (23/10/2025)

---

## ✅ Correções Críticas de Schemas - 22/10/2025 (CONCLUÍDO)

**Status**: 🟢 Done  
**Data de Conclusão**: 22 de Outubro de 2025, 23:45 ✓

### 🔧 Problema Identificado
- Regression crítica: `.omit({ id: true })` removido de TODOS os 10 insert schemas em shared/schema.ts
- POST endpoints rejeitavam requests sem ID (erro 400)
- Assembleia creation quebrada (data não transformada)
- CMS editors testados mas com falsos positivos em tipos

### ✅ Correções Aplicadas

**1. Restauração dos Insert Schemas** (10 schemas):
```typescript
// ANTES (quebrado):
export const insertAssemblySchema = createInsertSchema(assemblies);

// DEPOIS (corrigido):
export const insertAssemblySchema = createInsertSchema(assemblies).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  dataAssembleia: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
});
```

**Schemas corrigidos**:
- ✅ insertAssemblySchema (+ transformação de data string → Date)
- ✅ insertVotingItemSchema
- ✅ insertVoteSchema
- ✅ insertDocumentSchema
- ✅ insertPresenceSchema
- ✅ insertNotificationSchema
- ✅ insertCmsContentSchema
- ✅ insertProxySchema
- ✅ insertUserSchema
- ✅ insertObjectEntitySchema

**2. Transformação de Data em Assembleias**:
- Frontend envia dataAssembleia como string ISO ("2026-04-01T15:00")
- Schema agora aceita `z.union([z.string(), z.date()])` com `.transform()`
- Conversão automática de string → Date object antes de salvar na BD

**3. Validação E2E**:
- ✅ POST /api/assemblies: 201 Created (era 400 antes)
- ✅ Data armazenada corretamente: 2026-04-01T15:00:00.000Z
- ✅ Redirect para /assembleias funciona
- ✅ Toast de sucesso exibido
- ✅ CMS editors (Services, Projects, Impact) salvam e persistem dados

### ✅ Bugs Conhecidos (RESOLVIDOS)
- ✅ **8 LSP type errors em server/routes.ts**: RESOLVIDOS (recompilação TypeScript automática)
- ✅ **upsertUser duplicate key**: CORRIGIDO (23/10/2025)
- ✅ **i18n missing em Assemblies**: CORRIGIDO (23/10/2025)

### 📊 Resultados dos Testes E2E
- **Teste 1**: Criação de assembleia com string ISO date → ✅ PASSOU
- **Teste 2**: CMS Services editor save/load → ✅ PASSOU (histórico)
- **Teste 3**: CMS Projects editor save/load → ✅ PASSOU (histórico)
- **Teste 4**: CMS Impact Stats editor save/load → ✅ PASSOU (histórico)

### 🔍 Lições Aprendidas
1. **NUNCA remover `.omit({ id: true })` de insert schemas** - IDs são auto-gerados, não devem ser enviados em POSTs
2. **Sempre adicionar transformações para campos Date** - Frontends enviam strings ISO, backend precisa de Date objects
3. **LSP errors vs Runtime errors são diferentes** - TypeScript pode reclamar mas código pode estar correto
4. **Testar sempre após alterações em schemas** - E2E tests são essenciais para validar POST endpoints

---

## ✅ Upgrade Package - Outubro 2025 (CONCLUÍDO)

**Status**: 🟢 Done  
**Data de Conclusão**: 22 de Outubro de 2025, 22:35 ✓

### 🌍 Sistema Bilíngue (PT/EN)
✅ **react-i18next v13+** instalado e configurado  
✅ **LanguageToggle** sem emojis (apenas texto "PT"/"EN")  
✅ **Dashboard completamente traduzido**:
  - Welcome / Bem-vindo
  - Upcoming Assemblies / Próximas Assembleias
  - Pending Votes / Votações Pendentes
  - Recent Documents / Documentos Recentes
  - View all / Ver todas
  - Vote Now / Votar Agora
✅ **Formatação de datas dinâmica** (pt-PT / en-US)  
✅ **Status badges traduzidos** (Scheduled/Agendada, In Progress/Em Curso, Closed/Encerrada)  
✅ **Persistência localStorage** (chave 'language')  
✅ **Teste E2E** passou com sucesso

### 🎨 Nova Paleta de Cores Bureau Social
✅ **Azul Petróleo Primary**: #044050 (HSL 193, 90%, 16%)  
✅ **Cinza Azulado Secondary**: #788b92 (HSL 196, 10%, 52%)  
✅ **Terracotta Accent** mantido  
✅ **index.css** atualizado (light + dark modes)  
✅ **Aplicado em todo o sistema**

### 📚 27 Novos Documentos Institucionais
✅ **Estatutos Sociais**: 7 documentos (Regulamentos, Código de Conduta, Políticas)  
✅ **Relatórios**: 11 documentos (Planos Estratégicos, Atividades, Orçamentos, Captação)  
✅ **Atas**: 3 documentos históricos  
✅ **Documentos de Parceria**: 6 documentos (Apresentações, Fichas, Propostas, Termos)  
✅ **Total de 58 documentos** no sistema (31 anteriores + 27 novos)  
✅ **Armazenados em Replit Object Storage**  
✅ **Downloads funcionando** (200 OK testado)

### 🔧 Melhorias Técnicas
✅ **0 LSP errors** em todo o projeto  
✅ **TypeScript limpo**: Interface `DashboardSummary`, tipos corretos  
✅ **Optional chaining** implementado corretamente  
✅ **Badge variants** com tipos union strict  
✅ **Locale-aware date formatting** (i18n.language → pt-PT/en-US)  
✅ **Testes E2E** validaram todas as funcionalidades

### 📝 Documentação Atualizada
✅ **replit.md** com overview do upgrade  
✅ **STATUS.md** (este ficheiro)  
✅ **COMANDOS.md** com chaves de tradução i18n

---

## ✅ Fase 1: Base Completa (CONCLUÍDO)

- ✅ Frontend completo (Landing page + Portal + Admin)
- ✅ Backend com 19 endpoints REST (atualizado de 17)
- ✅ Database schema (11 tabelas - adicionada tabela `proxies`)
- ✅ Autenticação Replit Auth (OIDC)
- ✅ 58 documentos institucionais (31 + 27 novos)
- ✅ CMS integrado e funcional
- ✅ Sistema de votação com proxies
- ✅ Gestão de assembleias + PDF minutes
- ✅ Email notifications (Resend)
- ✅ Sistema bilíngue PT/EN

---

## 🎯 Próximas 10 Tarefas Prioritárias

### 📋 Legenda de Status
- 🔴 **To Do** - Não iniciado
- 🟡 **In Progress** - Em desenvolvimento
- 🟢 **Done** - Concluído e testado

### 📋 Legenda de Prioridade
- 🔥 **Alta** - Essencial para MVP
- ⚡ **Média** - Importante mas não bloqueante
- 💡 **Baixa** - Nice to have

---

### 1️⃣ Deploy para Produção
**Status**: 🟢 Done  
**Prioridade**: 🔥 Alta  
**Estimativa**: 30 minutos  
**Concluído em**: 12 de Outubro de 2025, 17:00 ✓

**Descrição**: Aplicação publicada com sucesso no Replit Autoscale.

**💰 Custo Estimado (Autoscale Deployment)**:
- **Taxa base**: €0,92/mês
- **Compute**: €2,94 por milhão de unidades
- **Requests**: €1,10 por milhão de requests
- **Uso típico estimado**: ~€2,75/mês total (75,000 requests/mês)
- **Com Replit Core (€18,40/mês)**: Inclui €23,50/mês em créditos → **sem custo adicional**
- 📖 [Documentação Oficial de Preços](https://docs.replit.com/deployments/pricing)

**✅ PRODUÇÃO ATIVA**:
- 🌐 **URL**: https://pt-bureausocial.replit.app
- 💾 **Database**: Production database conectada
- 🔐 **Auth**: Replit Auth configurado
- ✅ **Testes E2E**: 5/5 passados

**Tarefas**:
- [x] Verificar variáveis de ambiente (DATABASE_URL, SESSION_SECRET) ✓
- [x] Build frontend sem erros ✓
- [x] Testes E2E completos (5/5 passados) ✓
- [x] Correção de bugs críticos ✓
- [x] Deploy via Replit Autoscale ✓
- [x] Production database ativa ✓
- [ ] Configurar domínio personalizado (opcional)

---

### 2️⃣ Testes E2E do Portal de Membros
**Status**: 🟢 Done  
**Prioridade**: 🔥 Alta  
**Estimativa**: 3-4 horas  
**Prazo Previsto**: 12 de Outubro de 2025, 16:45 ✓

**Descrição**: Suite completa de testes Playwright para validar fluxos críticos do portal.

**Tarefas**:
- [x] Teste: Login e acesso ao dashboard ✓
- [x] Teste: Visualização de assembleias ✓
- [x] Teste: Criação de assembleias ✓
- [x] Teste: Sistema de votação ✓
- [x] Teste: Download de documentos ✓
- [x] Teste: Visualização de perfil ✓

**Bug Corrigido**: Conversão de data em NovaAssembleia.tsx (.toISOString() → new Date())

---

### 3️⃣ Geração de Atas em PDF
**Status**: 🟢 Done  
**Prioridade**: 🔥 Alta  
**Estimativa**: 4-5 horas  
**Concluído em**: 12 de Outubro de 2025, 17:30 ✓

**Descrição**: Implementação completa de geração automática de atas de assembleias em formato PDF com template institucional Bureau Social.

**✅ Funcionalidades Implementadas**:
- ✅ Biblioteca PDFKit instalada e configurada
- ✅ Template institucional com cabeçalho azul Bureau Social (#044050)
- ✅ Endpoint POST /api/assemblies/:id/generate-minutes (requireAdminOrDirecao)
- ✅ Endpoint GET /api/assemblies/:id/download-minutes (requireAuth)
- ✅ Conteúdo: data, local, participantes (com roles), votações (com resultados)
- ✅ Armazenamento em Replit Object Storage (PRIVATE_OBJECT_DIR)
- ✅ UI: Botão "Gerar Ata" (admin/direção) + "Download Ata" + Badge "Ata Disponível"
- ✅ Storage: Método getDocumentsByAssembly() adicionado
- ✅ Testes E2E validados (PDF 2556 bytes, headers corretos, status 200)

**Tarefas**:
- [x] Instalar biblioteca PDF (PDFKit) ✓
- [x] Criar template de ata institucional ✓
- [x] Endpoint: POST /api/assemblies/:id/generate-minutes ✓
- [x] Incluir: cabeçalho, participantes, votações ✓
- [x] Armazenar PDF em Object Storage ✓
- [x] Endpoint de download do PDF ✓
- [x] UI com botões e badges ✓
- [x] Testes E2E completos ✓

---

### 4️⃣ Sistema de Procurações (Proxies)
**Status**: 🟢 Done  
**Prioridade**: ⚡ Média  
**Estimativa**: 5-6 horas  
**Concluído em**: 15 de Outubro de 2025, 14:00 ✓

**Descrição**: Sistema completo de delegação de votos implementado e testado.

**Tarefas**:
- [x] Tabela: `proxies` (giverId, receiverId, assemblyId, createdAt, revokedAt) ✓
- [x] Endpoint: POST /api/assemblies/:id/proxies ✓
- [x] Endpoint: GET /api/assemblies/:id/my-proxies ✓
- [x] Validação: anti-loop de procurações ✓
- [x] UI: Modal para criar/revogar procuração ✓
- [x] Contagem de votos com procurações (peso) ✓
- [x] Badges visuais (Proxy, Delegator) ✓
- [x] Admin audit de proxies ✓

---

### 5️⃣ Notificações por Email
**Status**: 🟢 Done  
**Prioridade**: 💡 Baixa  
**Estimativa**: 3-4 horas  
**Concluído em**: 18 de Outubro de 2025, 10:00 ✓

**Descrição**: Sistema de notificações por email implementado com Resend.

**Tarefas**:
- [x] Configurar serviço de email (Resend) ✓
- [x] Template: Nova assembleia convocada ✓
- [x] Template: Lembrete de votação ✓
- [x] Template: Procuração recebida ✓
- [x] Template: Ata disponível ✓
- [x] Template: Novo documento ✓
- [x] Envio assíncrono (não bloqueia requests) ✓

---

### 6️⃣ Admin User Management
**Status**: 🟢 Done  
**Prioridade**: ⚡ Média  
**Estimativa**: 2-3 horas  
**Concluído em**: 20 de Outubro de 2025, 12:00 ✓

**Descrição**: Interface administrativa para gestão de utilizadores.

**Tarefas**:
- [x] Página: "Gerir Associados" (admin only) ✓
- [x] Listagem de todos os utilizadores ✓
- [x] Edição de categorias e permissões ✓
- [x] Filtros e pesquisa ✓
- [x] Badges visuais para roles ✓

---

### 7️⃣ Votação Secreta
**Status**: 🔴 To Do  
**Prioridade**: ⚡ Média  
**Estimativa**: 3-4 horas  
**Prazo Previsto**: 25 de Outubro de 2025, 10:00

**Descrição**: Implementar mecanismo de votação anónima onde só o resultado agregado é visível.

**Tarefas**:
- [ ] Campo `voting_items.isSecret: boolean`
- [ ] Encriptar votos na base de dados
- [ ] Modificar endpoint de resultados para ocultar detalhes
- [ ] UI: Indicador visual de "Votação Secreta"
- [ ] Garantir que nem admins vejam votos individuais

---

### 8️⃣ Sistema de Quotas
**Status**: � Done  
**Prioridade**: ⚡ Média  
**Concluído em**: 14 de Janeiro de 2026, 10:00 ✓

**Descrição**: Gestão de quotas anuais dos associados com controlo de pagamentos e estados.

**Tarefas**:
- [ ] Tabela: `quotas` (userId, year, amount, status, paidAt, method)
- [ ] Endpoint: GET /api/users/:id/quotas
- [ ] Endpoint: POST /api/quotas (registar pagamento)
- [ ] Página: "Minhas Quotas" no perfil
- [ ] Dashboard admin: visão geral de quotas pagas/pendentes
- [ ] Notificação automática para quotas pendentes

---

### 9️⃣ Relatórios e Exportações
**Status**: 🔴 To Do  
**Prioridade**: 💡 Baixa  
**Estimativa**: 4-5 horas  
**Prazo Previsto**: 30 de Outubro de 2025, 12:00

**Descrição**: Gerar relatórios administrativos (participação, votações, quotas) e permitir exportação em CSV/Excel.

**Tarefas**:
- [ ] Página: "Relatórios" no painel admin
- [ ] Relatório: Participação em assembleias
- [ ] Relatório: Histórico de votações
- [ ] Relatório: Estado de quotas
- [ ] Exportação CSV para todos os relatórios
- [ ] Gráficos visuais (recharts)

---

### 🔟 Otimizações de Performance
**Status**: 🔴 To Do  
**Prioridade**: 💡 Baixa  
**Estimativa**: 2-3 horas  
**Prazo Previsto**: 1 de Novembro de 2025, 10:00

**Descrição**: Melhorar tempo de carregamento e responsividade da aplicação.

**Tarefas**:
- [ ] Implementar paginação em listas longas
- [ ] Cache de queries frequentes (TanStack Query)
- [ ] Lazy loading de componentes pesados
- [ ] Otimizar queries SQL (índices)
- [ ] Compressão de imagens
- [ ] Análise de bundle size

---

## 📈 Progresso Geral

**Concluído**: 96% (Base + Upgrade Package + Proxies + Emails + Admin + Schemas + Deploy Fixes)  
**Em Progresso**: 0%  
**Pendente**: 4%

### 🎯 Próximo Marco (Milestone)
**MVP Completo** - Estimativa: 1-2 semanas  
- Deploy funcional ✓
- Testes E2E completos ✓
- PDFs de atas ✓
- Procurações ✓
- Emails ✓
- Sistema bilíngue ✓
- Admin user management ✓
- Votação secreta (pendente)
- Quotas (pendente)

---

## 📝 Notas

- Este ficheiro será atualizado após conclusão de cada tarefa
- Estimativas podem variar conforme complexidade encontrada
- Prioridades podem ser ajustadas conforme feedback do utilizador
- Tarefas adicionais podem ser inseridas conforme necessário
- **Prazos Previstos**: Atualizados automaticamente quando há mudança de status ou reavaliação de complexidade

---

**Última revisão**: 6/10 tarefas concluídas + Schema Fixes + Deploy Fixes (Deploy ✓ | E2E ✓ | PDFs ✓ | Proxies ✓ | Emails ✓ | Admin ✓ | Schemas ✓ | upsertUser ✓ | i18n ✓)  
**⏰ Próximo Prazo**: 1 de Janeiro de 2026, 23:59 (faltam 70 dias)  
**🎯 Data de Publicação**: 1 de Janeiro de 2026  
**🌐 Produção**: https://pt-bureausocial.replit.app

---

## 🔧 Notas Técnicas

### ✅ Qualidade do Código (23/10/2025)
- **0 LSP Errors** - TypeScript 100% limpo
- **0 Crashes** - Servidor estável após fix upsertUser
- **3/3 E2E Tests** - Todos passando (Assembleia, i18n, UI/UX)
- **Architect Reviewed** - Aprovado para deploy produção

### 📄 Documentação Gerada
- ✅ **RELATORIO_UI_UX.md** - Análise completa UI/UX com screenshots (23/10/2025)
- ✅ **STATUS.md** - Este ficheiro (atualizado continuamente)
- ✅ **COMANDOS.md** - Guia de comandos e i18n keys (atualizado 23/10/2025)
- ✅ **replit.md** - Overview do projeto (atualizado 23/10/2025)
