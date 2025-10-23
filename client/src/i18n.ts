import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  pt: {
    translation: {
      // Navigation
      nav: {
        home: 'Início',
        about: 'Quem Somos',
        areas: 'Áreas de Atuação',
        associate: 'Associe-se',
        partnerships: 'Parcerias',
        documents: 'Documentos',
        news: 'Notícias',
        contact: 'Contato'
      },
      // Hero Section
      hero: {
        title: 'Impacto Positivo e Negócios Rentáveis',
        subtitle: 'Promovemos o desenvolvimento sustentável através de negócios sociais que geram impacto positivo nas comunidades',
        cta: 'Conheça Nossas Áreas'
      },
      // Areas
      areas: {
        title: 'Áreas de Atuação',
        subtitle: 'Atuamos em cinco áreas estratégicas alinhadas com os Objetivos de Desenvolvimento Sustentável',
        housing: {
          title: 'Habitação Social e Reabilitação Urbana',
          description: 'Desenvolvimento de projetos de habitação acessível e reabilitação de edifícios'
        },
        inclusion: {
          title: 'Inclusão Social e Combate à Pobreza',
          description: 'Programas de capacitação profissional e integração no mercado de trabalho'
        },
        sustainability: {
          title: 'Sustentabilidade Ambiental',
          description: 'Promoção da economia circular e práticas sustentáveis'
        },
        entrepreneurship: {
          title: 'Empreendedorismo Social',
          description: 'Incubação e aceleração de negócios sociais'
        },
        innovation: {
          title: 'Inovação e Tecnologia Social',
          description: 'Desenvolvimento de soluções tecnológicas para desafios sociais'
        }
      },
      // About
      about: {
        title: 'Quem Somos',
        mission: {
          title: 'Missão',
          text: 'Promover o desenvolvimento sustentável através de negócios sociais que geram impacto positivo nas comunidades, alinhados com os Objetivos de Desenvolvimento Sustentável (ODS) da ONU.'
        },
        vision: {
          title: 'Visão',
          text: 'Ser uma referência nacional e internacional em negócios sociais, reconhecida pela capacidade de criar soluções inovadoras que combinam rentabilidade económica com impacto social e ambiental positivo.'
        },
        values: {
          title: 'Valores',
          sustainability: 'Sustentabilidade',
          innovation: 'Inovação',
          transparency: 'Transparência',
          collaboration: 'Colaboração',
          impact: 'Impacto Social'
        },
        esg: {
          title: 'Compromisso ESG',
          environmental: 'Ambiental',
          social: 'Social',
          governance: 'Governança'
        }
      },
      // Associate
      associate: {
        title: 'Associe-se',
        subtitle: 'Junte-se a nós e faça parte de uma rede de transformação social',
        categories: 'Categorias de Associados',
        benefits: 'Benefícios',
        howto: 'Como se Associar',
        founder: {
          title: 'Fundadores',
          description: 'Membros fundadores do Instituto'
        },
        effective: {
          title: 'Efetivos',
          description: 'Pessoas singulares com participação ativa'
        },
        contributor: {
          title: 'Contribuintes',
          description: 'Apoiadores regulares da missão'
        },
        benefactor: {
          title: 'Beneméritos',
          description: 'Contribuidores de serviços relevantes'
        },
        honorary: {
          title: 'Honorários',
          description: 'Personalidades de reconhecido mérito'
        },
        sponsor: {
          title: 'Patrocinadores',
          description: 'Empresas que apoiam financeiramente'
        },
        institutional: {
          title: 'Institucionais',
          description: 'Organizações parceiras'
        },
        student: {
          title: 'Estudantes',
          description: 'Estudantes do ensino superior'
        }
      },
      // Partnerships
      partnerships: {
        title: 'Parcerias',
        subtitle: 'Construímos pontes entre setores para maximizar o impacto social',
        types: 'Tipos de Parceiros',
        opportunities: 'Oportunidades de Colaboração',
        strategic: {
          title: 'Parceiros Estratégicos',
          description: 'Organizações com missão alinhada'
        },
        financial: {
          title: 'Parceiros Financeiros',
          description: 'Investidores de impacto e financiadores'
        },
        technical: {
          title: 'Parceiros Técnicos',
          description: 'Especialistas e consultores'
        },
        institutional: {
          title: 'Parceiros Institucionais',
          description: 'Entidades públicas e privadas'
        }
      },
      // Documents
      documents: {
        title: 'Documentos',
        subtitle: 'Acesse os documentos institucionais do Bureau Social',
        download: 'Baixar',
        categories: {
          statutes: 'Estatutos e Regulamentos',
          governance: 'Governança e Ética',
          scope: 'Escopo Institucional',
          planning: 'Planeamento e Estratégia',
          operational: 'Documentos Operacionais',
          members: 'Documentos para Associados',
          accountability: 'Prestação de Contas',
          partnership: 'Documentos de Parceria'
        }
      },
      // Contact
      contact: {
        title: 'Contato',
        subtitle: 'Entre em contato conosco',
        form: {
          subject: 'Assunto',
          selectSubject: 'Selecione o assunto',
          name: 'Nome',
          email: 'Email',
          phone: 'Telefone',
          organization: 'Organização',
          projectDescription: 'Descrição do Projeto',
          message: 'Mensagem Adicional',
          attachment: 'Anexar Arquivo (opcional)',
          chooseFile: 'Escolher Arquivo',
          formats: 'Formatos aceitos: PDF, Word, Images, ZIP (máx. 10MB)',
          submit: 'Enviar Mensagem',
          sending: 'Enviando...',
          success: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
          error: 'Erro ao enviar mensagem. Por favor, tente novamente ou entre em contato por email.',
          types: {
            associate: 'Quero ser Associado',
            partnership: 'Proposta de Parceria',
            volunteer: 'Quero ser Voluntário',
            project: 'Submeter Projeto',
            question: 'Dúvida ou Informação',
            other: 'Outro Assunto'
          }
        },
        info: {
          address: 'Morada',
          phone: 'Telefone',
          email: 'Email'
        }
      },
      // Footer
      footer: {
        about: 'Sobre',
        mission: 'Nossa missão é promover o desenvolvimento sustentável através de negócios sociais.',
        quickLinks: 'Links Rápidos',
        contact: 'Contato',
        follow: 'Siga-nos',
        rights: 'Todos os direitos reservados.'
      },
      // Common
      common: {
        learnMore: 'Saiba Mais',
        readMore: 'Ler Mais',
        back: 'Voltar',
        next: 'Próximo',
        previous: 'Anterior'
      },
      // Dashboard (Portal)
      dashboard: {
        welcome: 'Bem-vindo, {{name}}!',
        summary: 'Aqui está um resumo da sua atividade como associado do Bureau Social.',
        upcomingAssemblies: 'Próximas Assembleias',
        pendingVotes: 'Votações Pendentes',
        recentDocuments: 'Documentos Recentes',
        notifications: 'Notificações',
        viewAll: 'Ver todas',
        noAssemblies: 'Nenhuma assembleia agendada no momento',
        noVotes: 'Nenhuma votação pendente no momento',
        noDocuments: 'Nenhum documento recente',
        voteNow: 'Votar Agora',
        status: {
          agendada: 'Agendada',
          em_curso: 'Em Curso',
          encerrada: 'Encerrada',
          aberta: 'Aberta',
          fechada: 'Fechada'
        }
      },
      // Assembleias
      assemblies: {
        title: 'Assembleias Gerais',
        subtitle: 'Consulte as assembleias agendadas e passadas',
        new: 'Nova Assembleia',
        noAssemblies: 'Nenhuma assembleia disponível',
        scheduled: 'Agendadas',
        inProgress: 'Em Curso',
        closed: 'Encerradas'
      },
      // Votações
      votes: {
        title: 'Votações',
        subtitle: 'Participe nas votações abertas e consulte resultados passados',
        open: 'Votações Abertas',
        pending: 'Aguardando Abertura',
        closed: 'Votações Encerradas',
        noVotes: 'Nenhuma votação disponível',
        voteFor: 'A Favor',
        voteAgainst: 'Contra',
        abstain: 'Abstenção'
      },
      // Repositório de Documentos
      repository: {
        title: 'Documentos',
        subtitle: 'Acesse documentos institucionais e atas',
        category: 'Categoria',
        allCategories: 'Todas as Categorias',
        download: 'Baixar',
        noDocuments: 'Nenhum documento disponível'
      },
      // Perfil
      profile: {
        title: 'Meu Perfil',
        subtitle: 'Informações da sua conta de associado',
        personalInfo: 'Informação Pessoal',
        accountDetails: 'Detalhes da Conta',
        participation: 'Estatísticas de Participação',
        email: 'Email',
        phone: 'Telefone',
        memberNumber: 'Número de Sócio',
        joinDate: 'Data de Adesão',
        memberSince: 'Membro desde',
        status: 'Status',
        active: 'Ativo',
        inactive: 'Inativo'
      },
      // Admin
      admin: {
        cms: {
          title: 'Editor de Conteúdo (CMS)',
          subtitle: 'Edite o conteúdo do site público',
          save: 'Guardar Alterações',
          sections: 'Secções do Site'
        },
        members: {
          title: 'Gerir Associados',
          subtitle: 'Administre categorias, permissões e informações dos associados',
          search: 'Pesquisar por nome, email ou número de sócio',
          category: 'Categoria',
          allCategories: 'Todas Categorias',
          edit: 'Editar',
          permissions: 'Permissões',
          admin: 'Administrador',
          direction: 'Direção'
        },
        communications: {
          title: 'Comunicações',
          subtitle: 'Enviar emails para associados',
          newMessage: 'Nova Mensagem',
          subject: 'Assunto',
          message: 'Mensagem',
          recipients: 'Destinatários',
          segment: 'Segmento',
          sendTest: 'Enviar Teste',
          sendBroadcast: 'Enviar Email'
        }
      }
    }
  },
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        about: 'About Us',
        areas: 'Areas of Action',
        associate: 'Become a Member',
        partnerships: 'Partnerships',
        documents: 'Documents',
        news: 'News',
        contact: 'Contact'
      },
      // Hero Section
      hero: {
        title: 'Positive Impact and Profitable Business',
        subtitle: 'We promote sustainable development through social businesses that generate positive impact in communities',
        cta: 'Discover Our Areas'
      },
      // Areas
      areas: {
        title: 'Areas of Action',
        subtitle: 'We operate in five strategic areas aligned with the Sustainable Development Goals',
        housing: {
          title: 'Social Housing and Urban Rehabilitation',
          description: 'Development of affordable housing projects and building rehabilitation'
        },
        inclusion: {
          title: 'Social Inclusion and Poverty Alleviation',
          description: 'Professional training programs and labor market integration'
        },
        sustainability: {
          title: 'Environmental Sustainability',
          description: 'Promotion of circular economy and sustainable practices'
        },
        entrepreneurship: {
          title: 'Social Entrepreneurship',
          description: 'Incubation and acceleration of social businesses'
        },
        innovation: {
          title: 'Innovation and Social Technology',
          description: 'Development of technological solutions for social challenges'
        }
      },
      // About
      about: {
        title: 'About Us',
        mission: {
          title: 'Mission',
          text: 'To promote sustainable development through social businesses that generate positive impact in communities, aligned with the UN Sustainable Development Goals (SDGs).'
        },
        vision: {
          title: 'Vision',
          text: 'To be a national and international reference in social business, recognized for the ability to create innovative solutions that combine economic profitability with positive social and environmental impact.'
        },
        values: {
          title: 'Values',
          sustainability: 'Sustainability',
          innovation: 'Innovation',
          transparency: 'Transparency',
          collaboration: 'Collaboration',
          impact: 'Social Impact'
        },
        esg: {
          title: 'ESG Commitment',
          environmental: 'Environmental',
          social: 'Social',
          governance: 'Governance'
        }
      },
      // Associate
      associate: {
        title: 'Become a Member',
        subtitle: 'Join us and be part of a social transformation network',
        categories: 'Member Categories',
        benefits: 'Benefits',
        howto: 'How to Join',
        founder: {
          title: 'Founders',
          description: 'Founding members of the Institute'
        },
        effective: {
          title: 'Active Members',
          description: 'Individuals with active participation'
        },
        contributor: {
          title: 'Contributors',
          description: 'Regular supporters of the mission'
        },
        benefactor: {
          title: 'Benefactors',
          description: 'Contributors of relevant services'
        },
        honorary: {
          title: 'Honorary Members',
          description: 'Personalities of recognized merit'
        },
        sponsor: {
          title: 'Sponsors',
          description: 'Companies providing financial support'
        },
        institutional: {
          title: 'Institutional',
          description: 'Partner organizations'
        },
        student: {
          title: 'Students',
          description: 'Higher education students'
        }
      },
      // Partnerships
      partnerships: {
        title: 'Partnerships',
        subtitle: 'We build bridges between sectors to maximize social impact',
        types: 'Types of Partners',
        opportunities: 'Collaboration Opportunities',
        strategic: {
          title: 'Strategic Partners',
          description: 'Organizations with aligned mission'
        },
        financial: {
          title: 'Financial Partners',
          description: 'Impact investors and funders'
        },
        technical: {
          title: 'Technical Partners',
          description: 'Experts and consultants'
        },
        institutional: {
          title: 'Institutional Partners',
          description: 'Public and private entities'
        }
      },
      // Documents
      documents: {
        title: 'Documents',
        subtitle: 'Access Bureau Social institutional documents',
        download: 'Download',
        categories: {
          statutes: 'Statutes and Regulations',
          governance: 'Governance and Ethics',
          scope: 'Institutional Scope',
          planning: 'Planning and Strategy',
          operational: 'Operational Documents',
          members: 'Member Documents',
          accountability: 'Accountability',
          partnership: 'Partnership Documents'
        }
      },
      // Contact
      contact: {
        title: 'Contact',
        subtitle: 'Get in touch with us',
        form: {
          subject: 'Subject',
          selectSubject: 'Select subject',
          name: 'Name',
          email: 'Email',
          phone: 'Phone',
          organization: 'Organization',
          projectDescription: 'Project Description',
          message: 'Additional Message',
          attachment: 'Attach File (optional)',
          chooseFile: 'Choose File',
          formats: 'Accepted formats: PDF, Word, Images, ZIP (max. 10MB)',
          submit: 'Send Message',
          sending: 'Sending...',
          success: 'Message sent successfully! We will contact you soon.',
          error: 'Error sending message. Please try again or contact us by email.',
          types: {
            associate: 'I want to be a Member',
            partnership: 'Partnership Proposal',
            volunteer: 'I want to Volunteer',
            project: 'Submit Project',
            question: 'Question or Information',
            other: 'Other Subject'
          }
        },
        info: {
          address: 'Address',
          phone: 'Phone',
          email: 'Email'
        }
      },
      // Footer
      footer: {
        about: 'About',
        mission: 'Our mission is to promote sustainable development through social businesses.',
        quickLinks: 'Quick Links',
        contact: 'Contact',
        follow: 'Follow Us',
        rights: 'All rights reserved.'
      },
      // Common
      common: {
        learnMore: 'Learn More',
        readMore: 'Read More',
        back: 'Back',
        next: 'Next',
        previous: 'Previous'
      },
      // Dashboard (Portal)
      dashboard: {
        welcome: 'Welcome, {{name}}!',
        summary: 'Here is a summary of your activity as a Bureau Social member.',
        upcomingAssemblies: 'Upcoming Assemblies',
        pendingVotes: 'Pending Votes',
        recentDocuments: 'Recent Documents',
        notifications: 'Notifications',
        viewAll: 'View all',
        noAssemblies: 'No assemblies scheduled at the moment',
        noVotes: 'No pending votes at the moment',
        noDocuments: 'No recent documents',
        voteNow: 'Vote Now',
        status: {
          agendada: 'Scheduled',
          em_curso: 'In Progress',
          encerrada: 'Closed',
          aberta: 'Open',
          fechada: 'Closed'
        }
      },
      // Assembleias
      assemblies: {
        title: 'General Assemblies',
        subtitle: 'View scheduled and past assemblies',
        new: 'New Assembly',
        noAssemblies: 'No assemblies available',
        scheduled: 'Scheduled',
        inProgress: 'In Progress',
        closed: 'Closed'
      },
      // Votações
      votes: {
        title: 'Votes',
        subtitle: 'Participate in open votes and view past results',
        open: 'Open Votes',
        pending: 'Awaiting Opening',
        closed: 'Closed Votes',
        noVotes: 'No votes available',
        voteFor: 'For',
        voteAgainst: 'Against',
        abstain: 'Abstain'
      },
      // Repository
      repository: {
        title: 'Documents',
        subtitle: 'Access institutional documents and minutes',
        category: 'Category',
        allCategories: 'All Categories',
        download: 'Download',
        noDocuments: 'No documents available'
      },
      // Perfil
      profile: {
        title: 'My Profile',
        subtitle: 'Your member account information',
        personalInfo: 'Personal Information',
        accountDetails: 'Account Details',
        participation: 'Participation Statistics',
        email: 'Email',
        phone: 'Phone',
        memberNumber: 'Member Number',
        joinDate: 'Join Date',
        memberSince: 'Member since',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive'
      },
      // Admin
      admin: {
        cms: {
          title: 'Content Editor (CMS)',
          subtitle: 'Edit public website content',
          save: 'Save Changes',
          sections: 'Website Sections'
        },
        members: {
          title: 'Manage Members',
          subtitle: 'Manage categories, permissions and member information',
          search: 'Search by name, email or member number',
          category: 'Category',
          allCategories: 'All Categories',
          edit: 'Edit',
          permissions: 'Permissions',
          admin: 'Administrator',
          direction: 'Board'
        },
        communications: {
          title: 'Communications',
          subtitle: 'Send mass emails to members',
          newMessage: 'New Message',
          subject: 'Subject',
          message: 'Message',
          recipients: 'Recipients',
          segment: 'Segment',
          sendTest: 'Send Test',
          sendBroadcast: 'Send Email'
        }
      }
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n