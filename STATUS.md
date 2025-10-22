# 📊 Bureau Social - Status do Projeto

**Última atualização**: 22 de Outubro de 2025, 22:35

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
**Status**: 🔴 To Do  
**Prioridade**: ⚡ Média  
**Estimativa**: 4-5 horas  
**Prazo Previsto**: 28 de Outubro de 2025, 12:00

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

**Concluído**: 92% (Base + Upgrade Package + Proxies + Emails + Admin User Mgmt)  
**Em Progresso**: 0%  
**Pendente**: 8%

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

**Última revisão**: 6/10 tarefas concluídas (Deploy ✓ | E2E Tests ✓ | PDFs ✓ | Proxies ✓ | Emails ✓ | Admin Users ✓)  
**⏰ Próximo Prazo**: 1 de Janeiro de 2026, 23:59 (faltam 71 dias)  
**🎯 Data de Publicação**: 1 de Janeiro de 2026  
**🌐 Produção**: https://pt-bureausocial.replit.app
