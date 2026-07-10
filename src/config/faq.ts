import { siteConfig } from './site';

export type FaqItem = {
  question: string;
  answer: string;
};

export const faqs: FaqItem[] = [
  {
    question: 'O que é visagismo e como funciona?',
    answer:
      'Visagismo é a harmonização da imagem pessoal com traços faciais, personalidade e objetivos de vida. No Visagismo Intencional, a consulta inclui análise facial, estudo de proporções, colorimetria e definição de um visual estratégico para cada cliente.',
  },
  {
    question: 'Onde fazer visagismo em Campinas?',
    answer: `O Visagismo Intencional by Ery Junior fica no Cambuí, em ${siteConfig.address.street}, Campinas/SP. O espaço é dedicado à consultoria de visagismo, com atendimento por hora marcada e foco em transformação de imagem.`,
  },
  {
    question: 'Quem é Ery Junior?',
    answer: `Ery Junior é visagista com mais de ${siteConfig.experienceYears} anos de atuação em Campinas, com formação internacional e trajetória que inclui a evolução do Sofisticatto Hair para o Visagismo Intencional, estúdio focado em visagismo no Cambuí.`,
  },
  {
    question: 'Quanto custa uma consultoria de visagismo em Campinas?',
    answer:
      'O investimento varia conforme o serviço escolhido. A consultoria completa inclui análise facial, mapeamento de personalidade, colorimetria e projeto de imagem. Entre em contato pelo WhatsApp para receber valores atualizados e orientação sobre o melhor pacote.',
  },
  {
    question: 'Quanto tempo dura uma consultoria de visagismo?',
    answer:
      'A primeira consultoria completa dura em média de 1h30 a 2 horas, incluindo diagnóstico, definição do projeto de imagem e orientações para execução.',
  },
  {
    question: 'Preciso agendar com antecedência?',
    answer:
      'Sim. Recomendamos agendar com 3 a 5 dias de antecedência. Para noivas e datas especiais, o ideal é reservar com 2 a 4 semanas. Agendamentos pelo WhatsApp (19) 99110-3018.',
  },
  {
    question: 'Qual a diferença entre um corte normal e visagismo?',
    answer:
      'O corte comum costuma seguir tendência. O visagismo parte da leitura do rosto, da personalidade e dos objetivos profissionais e pessoais para criar um visual coerente, estratégico e duradouro.',
  },
  {
    question: 'O visagismo funciona para homens também?',
    answer:
      'Sim. O visagismo masculino trabalha corte, barba, sobrancelhas e presença executiva de forma integrada, com foco em autoridade, credibilidade e identidade visual.',
  },
  {
    question: 'Como funciona o serviço de Dia da Noiva?',
    answer:
      'O pacote inclui teste prévio, consultoria de visagismo, definição do visual e atendimento exclusivo no dia do evento, com penteado e ajustes finais.',
  },
  {
    question: 'O Visagismo Intencional fica em qual bairro de Campinas?',
    answer: `No Cambuí, em ${siteConfig.address.street}. A região oferece ${siteConfig.parkingNote.toLowerCase()}`,
  },
  {
    question: 'Vocês atendem clientes de outras cidades?',
    answer:
      'Sim. Atendemos clientes de Campinas e região metropolitana, incluindo Valinhos, Vinhedo, Paulínia, Americana, Sumaré, Indaiatuba e Jundiaí.',
  },
  {
    question: 'O que é o Método Ery Junior?',
    answer:
      'É a metodologia do estúdio, que combina análise facial, mapeamento de personalidade, colorimetria, projeto de imagem e execução artística em etapas definidas.',
  },
  {
    question: 'Qual o horário de funcionamento?',
    answer: `${siteConfig.hours.weekdays}. ${siteConfig.hours.saturday}. ${siteConfig.hours.closed}.`,
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer: `Aceitamos ${siteConfig.paymentMethods.join(', ')}. Valores e condições são informados no agendamento.`,
  },
];
