
# 📋 Checklist Completo de Testes - Bureau Social

## ✅ Testes de Tradução (PT/EN)

### Landing Page
- [ ] Toggle idioma funciona (PT ↔ EN)
- [ ] Hero section traduzida
- [ ] Missão e valores traduzidos
- [ ] Serviços traduzidos
- [ ] Projetos traduzidos
- [ ] Estatísticas traduzidas
- [ ] Footer traduzido
- [ ] Navegação traduzida

### Portal de Associados
- [ ] Dashboard traduzido (Welcome, estatísticas, badges)
- [ ] Assembleias traduzidas
- [ ] Votações traduzidas
- [ ] Documentos traduzidos
- [ ] Perfil traduzido
- [ ] Admin CMS traduzido
- [ ] Comunicações traduzidas

## ✅ Testes de Funcionalidade

### Autenticação
- [ ] Login via Replit Auth funciona
- [ ] Logout funciona
- [ ] Redirect para login quando não autenticado
- [ ] Sessão persiste após refresh

### Dashboard
- [ ] Estatísticas carregam corretamente
- [ ] Próximas assembleias aparecem
- [ ] Votações pendentes aparecem
- [ ] Documentos recentes aparecem
- [ ] Links "Ver todas" funcionam

### Assembleias
- [ ] Lista de assembleias carrega
- [ ] Badges de status corretos (agendada, em_curso, encerrada)
- [ ] Sistema de procuração funciona
- [ ] Download de ata funciona
- [ ] Geração de ata (admin/direção)
- [ ] Nova assembleia (admin/direção)

### Votações
- [ ] Lista de votações carrega
- [ ] Votar funciona (A Favor, Contra, Abstenção)
- [ ] Resultados aparecem após votação
- [ ] Não permite votar duas vezes
- [ ] Proxy impede voto direto

### Documentos
- [ ] Lista de documentos carrega
- [ ] Filtros funcionam (tipo, categoria, busca)
- [ ] Download funciona
- [ ] Upload funciona (admin)
- [ ] Editar metadata funciona (admin)
- [ ] Deletar funciona (admin)

### Perfil
- [ ] Dados do usuário aparecem
- [ ] Editar telefone funciona
- [ ] Avatar aparece corretamente

### Admin
- [ ] CMS: Editar conteúdo funciona
- [ ] Associados: Lista carrega
- [ ] Associados: Editar categoria/permissões
- [ ] Comunicações: Enviar email funciona
- [ ] Comunicações: Email de teste funciona

## 🐛 Bugs Conhecidos a Verificar

1. [ ] FROM_EMAIL usando variável de ambiente
2. [ ] Chaves duplicadas i18n resolvidas
3. [ ] Todos os textos traduzidos
4. [ ] Datas formatadas com locale correto
5. [ ] Badges de status traduzidos
6. [ ] Botões traduzidos

## 🔍 Testes de Performance

- [ ] Tempo de carregamento < 3s
- [ ] Imagens otimizadas
- [ ] Queries eficientes
- [ ] Sem memory leaks

## 🎨 Testes Visuais

- [ ] Paleta de cores Bureau Social aplicada (#044050)
- [ ] Dark mode funciona
- [ ] Responsivo em mobile
- [ ] Hover effects funcionam
- [ ] Loading states aparecem

## 📧 Testes de Email

- [ ] Email de nova assembleia
- [ ] Email de ata disponível
- [ ] Email de procuração recebida
- [ ] Email de inscrição (público)
- [ ] Email broadcast (admin)

## 🔐 Testes de Segurança

- [ ] Rotas protegidas (requireAuth)
- [ ] Rotas admin protegidas (requireAdmin)
- [ ] Upload de arquivos validado
- [ ] SQL injection prevention
- [ ] XSS prevention
