# Bureau Social - Guia de Acesso ao Sistema

## Autenticação

O Bureau Social utiliza **Replit Auth (OIDC)** para autenticação segura. Os utilizadores podem fazer login através de:

- 🔐 **Google Account**
- 🔐 **GitHub Account**  
- 📧 **Email (link mágico)**

**Não existem senhas a memorizar** - toda a autenticação é gerida de forma segura pelo Replit Auth.

## Utilizador Administrador

### Conta Principal
- **Email**: dmrdiego@gmail.com
- **Permissões**: Admin + Direção
- **Categoria**: Fundador
- **Nº Sócio**: 001
- **Acesso**: Login via Google/GitHub/Email associado a dmrdiego@gmail.com

## Como Aceder ao Sistema

### 1. Primeiro Acesso
1. Aceder à URL do portal Bureau Social
2. Clicar em "Entrar"
3. Escolher método de autenticação (Google/GitHub/Email)
4. Seguir o processo de login do provedor escolhido
5. Após login, a conta é automaticamente criada no sistema

### 2. Gestão de Utilizadores (Apenas Admin)

O administrador pode gerir todos os associados através da página **Admin → Gestão de Associados** (`/admin/associados`):

#### Funcionalidades Disponíveis:
- ✅ Ver todos os utilizadores registados
- ✅ Editar categoria (Fundador, Efetivo, Contribuinte, Honorário)
- ✅ Atribuir nº de sócio e telefone
- ✅ Conceder permissões de Admin
- ✅ Conceder permissões de Direção
- ✅ Pesquisar por nome, email ou nº sócio
- ✅ Filtrar por categoria

## Estrutura de Permissões

### 👤 Associado (Normal)
- Ver assembleias
- Registar presença
- Votar em items
- Delegar voto (procuração)
- Ver documentos públicos
- Editar perfil

### 👔 Direção (isDirecao = true)
- Todas as permissões de Associado +
- Gerar atas de assembleia (PDF)

### 👑 Admin (isAdmin = true)
- Todas as permissões de Direção +
- Criar assembleias
- Editar CMS (conteúdo público)
- Gerir utilizadores
- Fazer upload de documentos
- Ver procurações (auditoria)

## Categorias de Sócios

1. **Fundador** - Sócios fundadores do Bureau Social
2. **Efetivo** - Sócios com direitos de voto plenos
3. **Contribuinte** - Sócios que contribuem financeiramente
4. **Honorário** - Sócios com estatuto honorário

## Sistema de Notificações

O sistema envia automaticamente emails para:

### 📧 Nova Assembleia Agendada
- **Destinatários**: Todos os associados
- **Conteúdo**: Título, data/hora, localização, descrição
- **Acionado**: Quando admin cria assembleia

### 📄 Ata Disponível
- **Destinatários**: Todos os associados
- **Conteúdo**: Título da assembleia, link para download
- **Acionado**: Quando admin/direção gera PDF da ata

### 🤝 Procuração Recebida
- **Destinatário**: Associado que recebe delegação de voto
- **Conteúdo**: Nome do delegante, assembleia
- **Acionado**: Quando alguém delega voto

### 📁 Novo Documento Publicado
- **Destinatários**: Todos os associados (ou filtrados por categoria)
- **Conteúdo**: Título, categoria, link para download
- **Acionado**: Quando admin faz upload de documento

## Segurança

### 🔒 Boas Práticas Implementadas
- ✅ Autenticação delegada a Replit Auth (Google/GitHub/Email)
- ✅ **Sem armazenamento de senhas** no sistema
- ✅ Sessões seguras com cookies httpOnly
- ✅ HTTPS obrigatório em produção
- ✅ Validação de permissões em todos os endpoints
- ✅ Segredo RESEND_API_KEY armazenado em variável de ambiente

### ⚠️ Nunca Faça
- ❌ Partilhar links de acesso direto
- ❌ Guardar credenciais em ficheiros de texto
- ❌ Expor a chave API do Resend
- ❌ Conceder permissões admin sem necessidade

## Suporte Técnico

Para questões técnicas ou problemas de acesso:
- **Email**: dmrdiego@gmail.com
- **Portal**: Através da secção de contacto no website

---

**Última atualização**: 22 de Outubro de 2025  
**Versão**: 1.0
