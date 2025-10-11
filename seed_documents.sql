-- Seed documents for Bureau Social
-- This script populates the documents table with institutional documents

-- First, let's insert all the documents from documentos_parcerias (PDF and DOCX only)
INSERT INTO documents (titulo, tipo, categoria, file_path, file_size, visivel_para, uploaded_by)
VALUES
  -- Parcerias documents
  ('Carta Apresentação Institucional', 'pdf', 'parcerias', '/documents/documentos_parcerias/Carta_Apresentacao_Institucional.pdf', 313868, 'todos', 'system'),
  ('Carta Apresentação Institucional', 'docx', 'parcerias', '/documents/documentos_parcerias/Carta_Apresentacao_Institucional.docx', 13446, 'todos', 'system'),
  ('Proposta Parceria Estratégica', 'pdf', 'parcerias', '/documents/documentos_parcerias/Proposta_Parceria_Estrategica.pdf', 348563, 'todos', 'system'),
  ('Proposta Parceria Estratégica', 'docx', 'parcerias', '/documents/documentos_parcerias/Proposta_Parceria_Estrategica.docx', 17534, 'todos', 'system'),
  ('Termo Cooperação Padrão', 'pdf', 'parcerias', '/documents/documentos_parcerias/Termo_Cooperacao_Padrao.pdf', 341779, 'todos', 'system'),
  ('Termo Cooperação Padrão', 'docx', 'parcerias', '/documents/documentos_parcerias/Termo_Cooperacao_Padrao.docx', 18137, 'todos', 'system'),
  ('Ficha Adesão Parceiro', 'pdf', 'parcerias', '/documents/documentos_parcerias/Ficha_Adesao_Parceiro.pdf', 322634, 'todos', 'system'),
  ('Ficha Adesão Parceiro', 'docx', 'parcerias', '/documents/documentos_parcerias/Ficha_Adesao_Parceiro.docx', 14061, 'todos', 'system'),
  
  -- Atas
  ('Ata Constituição', 'docx', 'atas', '/documents/documentos_word/Ata_Constituicao_Bureau_Social.docx', 12025, 'socios', 'system'),
  
  -- Apresentações
  ('Apresentação Institucional', 'docx', 'apresentacoes', '/documents/documentos_word/Apresentacao_Institucional_Bureau_Social.docx', 14640, 'todos', 'system'),
  
  -- Código de Conduta e Políticas
  ('Código Conduta Ética', 'docx', 'politicas', '/documents/documentos_word/Codigo_Conduta_Etica_Bureau_Social.docx', 14771, 'socios', 'system'),
  ('Política Proteção Dados RGPD', 'docx', 'politicas', '/documents/documentos_word/Politica_Protecao_Dados_RGPD_Bureau_Social.docx', 16584, 'socios', 'system'),
  ('Política Recursos Humanos', 'docx', 'politicas', '/documents/documentos_word/Politica_Recursos_Humanos_Bureau_Social.docx', 13717, 'direcao', 'system'),
  ('Política Conflito Interesses', 'docx', 'politicas', '/documents/documentos_word/Politica_Conflito_Interesses_Bureau_Social.docx', 14830, 'socios', 'system'),
  ('Política Compras Contratações', 'docx', 'politicas', '/documents/documentos_word/Politica_Compras_Contratacoes_Bureau_Social.docx', 13875, 'direcao', 'system'),
  
  -- Fichas
  ('Ficha Candidatura Associado', 'docx', 'fichas', '/documents/documentos_word/Ficha_Candidatura_Associado_Bureau_Social.docx', 12298, 'todos', 'system'),
  ('Termo Adesão Associado', 'docx', 'fichas', '/documents/documentos_word/Termo_Adesao_Associado_Bureau_Social.docx', 11414, 'todos', 'system'),
  
  -- Manuais
  ('Manual Associado', 'docx', 'manuais', '/documents/documentos_word/Manual_Associado_Bureau_Social.docx', 14301, 'socios', 'system'),
  ('Manual Procedimentos Administrativos Financeiros', 'docx', 'manuais', '/documents/documentos_word/Manual_Procedimentos_Administrativos_Financeiros_Bureau_Social.docx', 13839, 'direcao', 'system'),
  
  -- Orçamentos
  ('Orçamento 2026', 'docx', 'orcamentos', '/documents/documentos_word/Orcamento_2026_Bureau_Social.docx', 12985, 'socios', 'system'),
  
  -- Planos
  ('Plano Atividades 2026', 'docx', 'planos', '/documents/documentos_word/Plano_Atividades_2026_Bureau_Social.docx', 14508, 'socios', 'system'),
  ('Plano Captação Recursos 2026', 'docx', 'planos', '/documents/documentos_word/Plano_Captacao_Recursos_2026_Bureau_Social.docx', 12984, 'socios', 'system'),
  ('Plano Comunicação Marketing', 'docx', 'planos', '/documents/documentos_word/Plano_Comunicacao_Marketing_Bureau_Social.docx', 15142, 'socios', 'system'),
  ('Plano Estratégico Trienal 2026-2028', 'docx', 'planos', '/documents/documentos_word/Plano_Estrategico_Trienal_2026_2028_Bureau_Social.docx', 16060, 'socios', 'system'),
  ('Plano Voluntariado', 'docx', 'planos', '/documents/documentos_word/Plano_Voluntariado_Bureau_Social.docx', 14282, 'socios', 'system'),
  
  -- Regulamentos
  ('Regulamento Eleitoral', 'docx', 'regulamentos', '/documents/documentos_word/Regulamento_Eleitoral_Bureau_Social.docx', 14695, 'socios', 'system'),
  ('Regulamento Interno', 'docx', 'regulamentos', '/documents/documentos_word/Regulamento_Interno_Bureau_Social.docx', 14323, 'socios', 'system'),
  ('Regulamento Quotas Contribuições', 'docx', 'regulamentos', '/documents/documentos_word/Regulamento_Quotas_Contribuicoes_Bureau_Social.docx', 13399, 'socios', 'system'),
  ('Regulamento Utilização Instalações', 'docx', 'regulamentos', '/documents/documentos_word/Regulamento_Utilizacao_Instalacoes_Bureau_Social.docx', 13419, 'socios', 'system'),
  
  -- Relatórios
  ('Relatório Atividades Contas (Modelo)', 'docx', 'relatorios', '/documents/documentos_word/Relatorio_Atividades_Contas_Modelo_Bureau_Social.docx', 15139, 'direcao', 'system');
