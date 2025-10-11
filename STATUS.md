# 📊 Bureau Social - Status do Projeto

**Última atualização**: 11 de Outubro de 2025

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

### 1️⃣ Deploy para Produção e Testes OIDC
**Status**: 🔴 To Do  
**Prioridade**: 🔥 Alta  
**Estimativa**: 2-3 horas  

**Descrição**: Publicar aplicação no Replit para testar fluxo completo de autenticação em ambiente real, já que OIDC não funciona em desenvolvimento.

**Tarefas**:
- [ ] Verificar variáveis de ambiente (DATABASE_URL, SESSION_SECRET)
- [ ] Fazer deploy via botão "Publish"
- [ ] Testar login/logout em produção
- [ ] Verificar criação automática de utilizadores
- [ ] Validar acesso ao portal de membros

---

### 2️⃣ Testes E2E do Portal de Membros
**Status**: 🔴 To Do  
**Prioridade**: 🔥 Alta  
**Estimativa**: 3-4 horas

**Descrição**: Criar suite de testes Playwright para validar fluxos críticos do portal (dashboard, assembleias, votação, documentos).

**Tarefas**:
- [ ] Teste: Login e acesso ao dashboard
- [ ] Teste: Visualização de assembleias
- [ ] Teste: Confirmação de presença
- [ ] Teste: Submissão de votos
- [ ] Teste: Download de documentos
- [ ] Teste: Visualização de perfil

---

### 3️⃣ Geração de Atas em PDF
**Status**: 🔴 To Do  
**Prioridade**: 🔥 Alta  
**Estimativa**: 4-5 horas

**Descrição**: Implementar geração automática de atas de assembleias em formato PDF com informações completas (participantes, votações, decisões).

**Tarefas**:
- [ ] Instalar biblioteca PDF (pdfkit ou jsPDF)
- [ ] Criar template de ata institucional
- [ ] Endpoint: POST /api/assemblies/:id/generate-pdf
- [ ] Incluir: cabeçalho, participantes, votações, assinaturas
- [ ] Armazenar PDF em Object Storage
- [ ] Endpoint de download do PDF

---

### 4️⃣ Sistema de Procurações (Proxies)
**Status**: 🔴 To Do  
**Prioridade**: ⚡ Média  
**Estimativa**: 5-6 horas

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

**Descrição**: Documentar todos os endpoints REST para facilitar manutenção e integrações futuras.

**Tarefas**:
- [ ] Instalar Swagger ou similar
- [ ] Documentar todos os 17+ endpoints
- [ ] Incluir exemplos de request/response
- [ ] Documentar códigos de erro
- [ ] Publicar docs em /api-docs

---

## 📈 Progresso Geral

**Concluído**: 60% (Base completa + CMS + Documentos)  
**Em Progresso**: 0%  
**Pendente**: 40%

### 🎯 Próximo Marco (Milestone)
**MVP em Produção** - Estimativa: 2-3 semanas  
- Deploy funcional ✓
- Testes E2E completos ✓
- PDFs de atas ✓
- Procurações ✓

---

## 📝 Notas

- Este ficheiro será atualizado após conclusão de cada tarefa
- Estimativas podem variar conforme complexidade encontrada
- Prioridades podem ser ajustadas conforme feedback do utilizador
- Tarefas adicionais podem ser inseridas conforme necessário

---

**Última revisão**: Tarefa 0/10 concluída | Próxima: Deploy para Produção
