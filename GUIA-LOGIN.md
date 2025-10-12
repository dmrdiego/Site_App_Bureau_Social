# 🔐 Guia Rápido - Login e Permissões

## Como Fazer Login

### 1️⃣ Login Automático (Utilizador Normal)

1. Aceder: https://pt-bureausocial.replit.app
2. Clicar em **"Entrar"**
3. **Automático**: Se já estiver logado no Replit, entra direto
4. **Primeiro login**: Cria automaticamente como `contribuinte` (sem permissões admin)

**Permissões do Contribuinte:**
- ✅ Ver assembleias
- ✅ Votar em assembleias ativas
- ✅ Download de documentos
- ✅ Ver perfil
- ❌ Não pode gerar atas
- ❌ Não pode aceder ao CMS
- ❌ Não pode criar assembleias

---

## 2️⃣ Tornar-se Administrador

### Passo a Passo:

```bash
# 1. Fazer login normal primeiro (cria o utilizador)
# Aceder à app e fazer login via Replit

# 2. Ver o seu email no perfil ou listar utilizadores
psql $DATABASE_URL -c "SELECT email, first_name, is_admin, is_direcao FROM users ORDER BY created_at DESC LIMIT 5;"

# 3. Tornar-se ADMIN (substituir pelo SEU EMAIL)
psql $DATABASE_URL -c "UPDATE users SET is_admin = true, is_direcao = true WHERE email = 'SEU_EMAIL@example.com';"

# 4. Fazer LOGOUT e LOGIN novamente
# Agora terá permissões de admin!
```

### Exemplo Prático:

```bash
# Se o meu email é joao.silva@example.com
psql $DATABASE_URL -c "UPDATE users SET is_admin = true, is_direcao = true WHERE email = 'joao.silva@example.com';"

# Verificar se funcionou
psql $DATABASE_URL -c "SELECT email, is_admin, is_direcao FROM users WHERE email = 'joao.silva@example.com';"
```

**Permissões do Admin:**
- ✅ Tudo que o contribuinte pode
- ✅ **Gerar Atas** em assembleias encerradas
- ✅ **Criar Assembleias**
- ✅ **Editar CMS** (conteúdo do site)
- ✅ **Gerir Utilizadores**
- ✅ **Upload de Documentos**

---

## 3️⃣ Tipos de Utilizadores

| Tipo | Comando | Permissões |
|------|---------|------------|
| **Contribuinte** | *(automático no primeiro login)* | Ver, votar, download |
| **Direção** | `UPDATE users SET is_direcao = true WHERE email = '...'` | + Gerar atas, criar assembleias |
| **Admin** | `UPDATE users SET is_admin = true, is_direcao = true WHERE email = '...'` | + CMS, gerir users, tudo |

---

## 4️⃣ Verificar Permissões

### Ver Todos os Utilizadores:
```bash
psql $DATABASE_URL -c "SELECT email, first_name, is_admin, is_direcao, categoria FROM users;"
```

### Ver Apenas Admins:
```bash
psql $DATABASE_URL -c "SELECT email, first_name FROM users WHERE is_admin = true;"
```

### Remover Permissões de Admin:
```bash
psql $DATABASE_URL -c "UPDATE users SET is_admin = false, is_direcao = false WHERE email = 'user@example.com';"
```

---

## 5️⃣ Testar Funcionalidades

### Como Contribuinte (normal):
1. Login normal
2. Ir para **Assembleias**
3. ❌ **NÃO deve ver** botão "Gerar Ata"
4. ✅ **Deve poder** votar em assembleias ativas
5. ✅ **Deve poder** download de documentos

### Como Admin:
1. Tornar-se admin (comando acima)
2. Logout e login novamente
3. Ir para **Assembleias**
4. ✅ **Deve ver** botão "Gerar Ata" em assembleias encerradas
5. ✅ **Deve ver** "CMS Editor" na sidebar esquerda
6. ✅ **Deve ver** "Gerir Associados" na sidebar

---

## 🎯 Exemplo Completo: Do Zero a Admin

```bash
# 1. Aceder à aplicação
open https://pt-bureausocial.replit.app

# 2. Fazer login (cria utilizador automático)
# (clicar em "Entrar" na interface)

# 3. Descobrir o meu email
# (ver no perfil ou listar users)
psql $DATABASE_URL -c "SELECT email FROM users ORDER BY created_at DESC LIMIT 1;"

# 4. Tornar-me admin (assumindo email: maria@example.com)
psql $DATABASE_URL -c "UPDATE users SET is_admin = true, is_direcao = true WHERE email = 'maria@example.com';"

# 5. Verificar
psql $DATABASE_URL -c "SELECT email, is_admin, is_direcao FROM users WHERE email = 'maria@example.com';"
# Deve retornar: is_admin = t, is_direcao = t

# 6. Fazer LOGOUT e LOGIN novamente
# (clicar no perfil > Terminar Sessão > Entrar novamente)

# 7. Agora sou ADMIN! 🎉
# - Ver "CMS Editor" na sidebar
# - Ver botão "Gerar Ata" em assembleias encerradas
```

---

## 📌 Utilizadores de Teste Já Existentes

```bash
# Ver utilizadores admin atuais
psql $DATABASE_URL -c "SELECT email, first_name, is_admin, is_direcao FROM users WHERE is_admin = true;"

# Resultado esperado:
# admin2@bureausocial.pt (Admin + Direção)
# admin3@bureausocial.pt (Admin + Direção)
```

Pode usar estes emails se quiser testar com um admin já criado (mas precisará fazer login com a conta Replit correspondente).

---

## 🔧 Script Automático de Atualização

O script `update-status.js` agora atualiza automaticamente:
- ✅ **STATUS.md** (progresso do projeto + dias restantes)
- ✅ **COMANDOS.md** (comandos úteis + timestamp)

**Executar:**
```bash
node update-status.js
```

**Configurar para rodar a cada 15 minutos:**
```bash
# Adicionar ao crontab (Linux/Mac):
*/15 * * * * cd /caminho/do/projeto && node update-status.js

# Ou usar .replit para auto-run (Replit):
# (já configurado automaticamente)
```

---

**Última atualização**: 12 de Outubro de 2025, 17:45
