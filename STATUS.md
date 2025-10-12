# 📊 Bureau Social - Status do Projeto

**Última atualização**: 12 de Outubro de 2025, 02:03

---

## ✅ Fase 1: Base Completa (CONCLUÍDO)

- ✅ Frontend completo (Landing page + Portal + Admin)
- ✅ Backend com 17 endpoints REST
- ✅ Database schema (10 tabelas)
- ✅ Autenticação Replit Auth (OIDC)
- ✅ 30 documentos institucionais seeded
- ✅ CMS integrado e funcional
- ✅ Sistema de votação básico
- ✅ Gestão de assembleias

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
- ✅ Template institucional com cabeçalho azul Bureau Social (#2c5aa0)
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
**Status**: 🔴 To Do  
**Prioridade**: ⚡ Média  
**Estimativa**: 5-6 horas  
**Prazo Previsto**: 15 de Outubro de 2025, 14:00

**Descrição**: Permitir que associados deleguem o seu voto a outro membro para assembleias específicas.

**Tarefas**:
- [ ] Tabela: `proxies` (giverId, receiverId, assemblyId, createdAt)
- [ ] Endpoint: POST /api/assemblies/:id/proxies
- [ ] Endpoint: GET /api/assemblies/:id/my-proxies
- [ ] Validação: não permitir loops de procurações
- [ ] UI: Modal para criar/revogar procuração
- [ ] Contagem de votos com procurações

---

### 5️⃣ Votação Secreta
**Status**: 🔴 To Do  
**Prioridade**: ⚡ Média  
**Estimativa**: 3-4 horas  
**Prazo Previsto**: 16 de Outubro de 2025, 10:00

**Descrição**: Implementar mecanismo de votação anónima onde só o resultado agregado é visível.

**Tarefas**:
- [ ] Campo `voting_items.isSecret: boolean`
- [ ] Encriptar votos na base de dados
- [ ] Modificar endpoint de resultados para ocultar detalhes
- [ ] UI: Indicador visual de "Votação Secreta"
- [ ] Garantir que nem admins vejam votos individuais

---

### 6️⃣ Sistema de Quotas
**Status**: 🔴 To Do  
**Prioridade**: ⚡ Média  
**Estimativa**: 4-5 horas  
**Prazo Previsto**: 17 de Outubro de 2025, 12:00

**Descrição**: Gestão de quotas anuais dos associados com controlo de pagamentos e estados.

**Tarefas**:
- [ ] Tabela: `quotas` (userId, year, amount, status, paidAt, method)
- [ ] Endpoint: GET /api/users/:id/quotas
- [ ] Endpoint: POST /api/quotas (registar pagamento)
- [ ] Página: "Minhas Quotas" no perfil
- [ ] Dashboard admin: visão geral de quotas pagas/pendentes
- [ ] Notificação automática para quotas pendentes

---

### 7️⃣ Notificações por Email
**Status**: 🔴 To Do  
**Prioridade**: 💡 Baixa  
**Estimativa**: 3-4 horas  
**Prazo Previsto**: 18 de Outubro de 2025, 10:00

**Descrição**: Enviar emails automáticos para eventos importantes (novas assembleias, votações, lembretes).

**Tarefas**:
- [ ] Configurar serviço de email (SendGrid ou similar)
- [ ] Template: Nova assembleia convocada
- [ ] Template: Lembrete de votação
- [ ] Template: Quota pendente
- [ ] Preferências de notificação no perfil
- [ ] Queue de emails (evitar spam)

---

### 8️⃣ Relatórios e Exportações
**Status**: 🔴 To Do  
**Prioridade**: 💡 Baixa  
**Estimativa**: 4-5 horas  
**Prazo Previsto**: 19 de Outubro de 2025, 12:00

**Descrição**: Gerar relatórios administrativos (participação, votações, quotas) e permitir exportação em CSV/Excel.

**Tarefas**:
- [ ] Página: "Relatórios" no painel admin
- [ ] Relatório: Participação em assembleias
- [ ] Relatório: Histórico de votações
- [ ] Relatório: Estado de quotas
- [ ] Exportação CSV para todos os relatórios
- [ ] Gráficos visuais (recharts)

---

### 9️⃣ Otimizações de Performance
**Status**: 🔴 To Do  
**Prioridade**: 💡 Baixa  
**Estimativa**: 2-3 horas  
**Prazo Previsto**: 20 de Outubro de 2025, 10:00

**Descrição**: Melhorar tempo de carregamento e responsividade da aplicação.

**Tarefas**:
- [ ] Implementar paginação em listas longas
- [ ] Cache de queries frequentes (TanStack Query)
- [ ] Lazy loading de componentes pesados
- [ ] Otimizar queries SQL (índices)
- [ ] Compressão de imagens
- [ ] Análise de bundle size

---

### 🔟 Documentação de API
**Status**: 🔴 To Do  
**Prioridade**: 💡 Baixa  
**Estimativa**: 2-3 horas  
**Prazo Previsto**: 21 de Outubro de 2025, 10:00

**Descrição**: Documentar todos os endpoints REST para facilitar manutenção e integrações futuras.

**Tarefas**:
- [ ] Instalar Swagger ou similar
- [ ] Documentar todos os 17+ endpoints
- [ ] Incluir exemplos de request/response
- [ ] Documentar códigos de erro
- [ ] Publicar docs em /api-docs

---

## 📈 Progresso Geral

**Concluído**: 85% (Base + CMS + Documentos + Testes E2E + Deploy + PDFs de Atas)  
**Em Progresso**: 0%  
**Pendente**: 15%

### 🎯 Próximo Marco (Milestone)
**MVP em Produção** - Estimativa: 2-3 semanas  
- Deploy funcional ✓
- Testes E2E completos ✓
- PDFs de atas ✓
- Procurações (pendente)
- Votação secreta (pendente)

---

## 📝 Notas

- Este ficheiro será atualizado após conclusão de cada tarefa
- Estimativas podem variar conforme complexidade encontrada
- Prioridades podem ser ajustadas conforme feedback do utilizador
- Tarefas adicionais podem ser inseridas conforme necessário
- **Prazos Previstos**: Atualizados automaticamente quando há mudança de status ou reavaliação de complexidade

---

**Última revisão**: Tarefas 1-3/10 concluídas (Testes E2E ✓ | Deploy ✓ | PDFs de Atas ✓)  
**⏰ Próximo Prazo**: 1 de Janeiro de 2026, 23:59 (faltam 82 dias)
**🎯 Data de Publicação**: 1 de Janeiro de 2026  
**🌐 Produção**: https://pt-bureausocial.replit.app
