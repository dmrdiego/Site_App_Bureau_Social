-- ============================================================================
-- CMS Content Seed - Bureau Social
-- ============================================================================
-- Seed script para popular conteúdo institucional do site público
-- Execute com: npm run db:push (se necessário) e depois este script manualmente

-- Limpar conteúdo existente (opcional)
-- DELETE FROM cms_content;

-- ============================================================================
-- HERO SECTION
-- ============================================================================
INSERT INTO cms_content (section_key, content, updated_at)
VALUES (
  'hero',
  '{
    "title": "Instituto Português de Negócios Sociais",
    "subtitle": "Construindo um futuro mais sustentável e inclusivo através da inovação social",
    "description": "O Bureau Social é uma organização dedicada ao desenvolvimento e apoio de negócios sociais em Portugal, promovendo soluções inovadoras para desafios sociais e ambientais.",
    "ctaText": "Torne-se Associado",
    "ctaLink": "/api/login",
    "imageUrl": null
  }'::jsonb,
  NOW()
)
ON CONFLICT (section_key) 
DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- ============================================================================
-- MISSION SECTION
-- ============================================================================
INSERT INTO cms_content (section_key, content, updated_at)
VALUES (
  'mission',
  '{
    "title": "A Nossa Missão",
    "description": "Promover e desenvolver o ecossistema de negócios sociais em Portugal, apoiando empreendedores a criar impacto social positivo através de modelos de negócio sustentáveis.",
    "values": [
      {
        "title": "Impacto Social",
        "description": "Priorizamos soluções que geram benefícios tangíveis para comunidades e sociedade",
        "icon": "heart"
      },
      {
        "title": "Sustentabilidade",
        "description": "Promovemos modelos de negócio economicamente viáveis e ambientalmente responsáveis",
        "icon": "leaf"
      },
      {
        "title": "Inovação",
        "description": "Apoiamos abordagens criativas e inovadoras para resolver desafios sociais",
        "icon": "lightbulb"
      },
      {
        "title": "Colaboração",
        "description": "Facilitamos parcerias e networking entre stakeholders do ecossistema",
        "icon": "users"
      }
    ]
  }'::jsonb,
  NOW()
)
ON CONFLICT (section_key) 
DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- ============================================================================
-- SERVICES SECTION
-- ============================================================================
INSERT INTO cms_content (section_key, content, updated_at)
VALUES (
  'services',
  '{
    "title": "Os Nossos Serviços",
    "description": "Apoiamos negócios sociais em todas as fases do seu desenvolvimento",
    "services": [
      {
        "title": "Consultoria e Mentoria",
        "description": "Acompanhamento especializado para desenvolvimento e escala de negócios sociais",
        "icon": "briefcase",
        "features": [
          "Modelação de negócio",
          "Estratégia de impacto",
          "Planeamento financeiro",
          "Mentoria individualizada"
        ]
      },
      {
        "title": "Formação",
        "description": "Programas de capacitação em empreendedorismo social e gestão de impacto",
        "icon": "graduation-cap",
        "features": [
          "Workshops temáticos",
          "Cursos de certificação",
          "Webinars especializados",
          "Comunidade de aprendizagem"
        ]
      },
      {
        "title": "Networking",
        "description": "Facilitação de contactos e parcerias estratégicas no ecossistema",
        "icon": "network",
        "features": [
          "Eventos de networking",
          "Matchmaking com investidores",
          "Parcerias corporativas",
          "Comunidade de associados"
        ]
      },
      {
        "title": "Recursos e Ferramentas",
        "description": "Acesso a recursos, templates e ferramentas para gestão de negócios sociais",
        "icon": "tools",
        "features": [
          "Biblioteca de recursos",
          "Templates e modelos",
          "Ferramentas de medição",
          "Base de conhecimento"
        ]
      }
    ]
  }'::jsonb,
  NOW()
)
ON CONFLICT (section_key) 
DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- ============================================================================
-- PROJECTS SECTION
-- ============================================================================
INSERT INTO cms_content (section_key, content, updated_at)
VALUES (
  'projects',
  '{
    "title": "Projetos em Destaque",
    "description": "Iniciativas que estão a transformar comunidades e criar impacto positivo",
    "projects": [
      {
        "title": "Incubadora de Negócios Sociais",
        "description": "Programa de aceleração para startups sociais em fase inicial",
        "impact": "15 negócios sociais incubados",
        "status": "Em curso",
        "category": "Empreendedorismo"
      },
      {
        "title": "Rede de Mentores",
        "description": "Plataforma que conecta empreendedores sociais com mentores experientes",
        "impact": "50+ pares mentor-mentee",
        "status": "Em curso",
        "category": "Mentoria"
      },
      {
        "title": "Fundo de Investimento Social",
        "description": "Fundo dedicado a investimentos em negócios com impacto social mensurável",
        "impact": "€500K investidos",
        "status": "Ativo",
        "category": "Financiamento"
      },
      {
        "title": "Certificação de Impacto",
        "description": "Programa de certificação para negócios sociais em Portugal",
        "impact": "20 organizações certificadas",
        "status": "Em desenvolvimento",
        "category": "Certificação"
      }
    ]
  }'::jsonb,
  NOW()
)
ON CONFLICT (section_key) 
DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- ============================================================================
-- CONTACT SECTION
-- ============================================================================
INSERT INTO cms_content (section_key, content, updated_at)
VALUES (
  'contact',
  '{
    "title": "Contacte-nos",
    "description": "Estamos aqui para apoiar o seu projeto de negócio social",
    "email": "geral@bureausocial.pt",
    "phone": "+351 21 XXX XXXX",
    "address": {
      "street": "Rua do Impacto Social, 123",
      "city": "Lisboa",
      "postalCode": "1000-001",
      "country": "Portugal"
    },
    "social": {
      "facebook": "https://facebook.com/bureausocial",
      "linkedin": "https://linkedin.com/company/bureau-social",
      "twitter": "https://twitter.com/bureausocial",
      "instagram": "https://instagram.com/bureausocial"
    },
    "hours": "Segunda a Sexta: 9h00 - 18h00"
  }'::jsonb,
  NOW()
)
ON CONFLICT (section_key) 
DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- ============================================================================
-- STATS SECTION (Impact Statistics)
-- ============================================================================
INSERT INTO cms_content (section_key, content, updated_at)
VALUES (
  'stats',
  '{
    "title": "O Nosso Impacto",
    "stats": [
      {
        "value": "150+",
        "label": "Negócios Sociais Apoiados",
        "icon": "briefcase"
      },
      {
        "value": "500+",
        "label": "Empreendedores Formados",
        "icon": "users"
      },
      {
        "value": "€2M+",
        "label": "Investimento Facilitado",
        "icon": "trending-up"
      },
      {
        "value": "25+",
        "label": "Parcerias Estratégicas",
        "icon": "handshake"
      }
    ]
  }'::jsonb,
  NOW()
)
ON CONFLICT (section_key) 
DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- Verificar inserções
SELECT section_key, updated_at FROM cms_content ORDER BY section_key;
