
# Guia de Testes - Bureau Social

## Testes de Autenticação
1. ✅ Login com Replit Auth
2. ✅ Logout
3. ✅ Redirecionamento para login em páginas protegidas

## Testes de Assembleias
1. ✅ Criar nova assembleia (admin/direção)
2. ✅ Listar assembleias
3. ✅ Ver detalhes de assembleia
4. ✅ Confirmar presença
5. ✅ Criar procuração
6. ✅ Revogar procuração
7. ✅ Gerar ata (PDF)
8. ✅ Download de ata

## Testes de Votações
1. ✅ Listar votações abertas
2. ✅ Votar (A favor/Contra/Abstenção)
3. ✅ Ver resultados (após encerramento)
4. ✅ Validar voto único por item
5. ✅ Validar peso de voto com procurações

## Testes de Documentos
1. ✅ Upload de documento (admin)
2. ✅ Download de documento
3. ✅ Editar metadados
4. ✅ Excluir documento
5. ✅ Filtros e busca

## Testes de Emails
1. ⚠️ Email de nova assembleia
2. ⚠️ Email de ata disponível
3. ⚠️ Email de procuração recebida
4. ⚠️ Email de broadcast (comunicações)
5. ⚠️ Email de inscrição

## Testes de Perfil
1. ⚠️ Editar perfil
2. ✅ Ver histórico de presenças
3. ✅ Ver histórico de votações

## Testes de Admin
1. ✅ Gestão de associados
2. ✅ Editar CMS
3. ✅ Comunicações em lote
4. ✅ Ver estatísticas

## Comandos de Teste (via curl)

```bash
# Criar assembleia
curl -X POST http://localhost:5000/api/assemblies \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Assembleia Teste",
    "tipo": "ordinaria",
    "dataAssembleia": "2025-12-31T14:00:00Z",
    "local": "Lisboa",
    "quorumMinimo": 50
  }' \
  -b "connect.sid=..."

# Criar voto
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -d '{
    "votingItemId": 1,
    "voto": "a_favor"
  }' \
  -b "connect.sid=..."

# Upload documento
curl -X POST http://localhost:5000/api/documents/upload \
  -F "file=@documento.pdf" \
  -F "titulo=Teste" \
  -F "tipo=pdf" \
  -F "visivelPara=todos" \
  -b "connect.sid=..."
```
