export type CaseStudy = {
  title: string;
  objective: string;
  approach: string;
  result: string;
  imageBefore: string;
  imageAfter: string;
  alt: string;
};

export const caseStudies: CaseStudy[] = [
  {
    title: 'Harmonização feminina com colorimetria',
    objective: 'Valorizar traços faciais e renovar a imagem profissional sem perder identidade.',
    approach: 'Análise de formato de rosto, estudo de subtom de pele e definição de corte com camadas estratégicas.',
    result: 'Visual mais leve, com cor alinhada ao tom de pele e maior definição facial.',
    imageBefore: '/images/visagismo-feminino-antes.webp',
    imageAfter: '/images/visagismo-feminino-depois.webp',
    alt: 'Transformação de visagismo feminino em Campinas',
  },
  {
    title: 'Presença executiva masculina',
    objective: 'Transmitir autoridade e credibilidade com corte e barba integrados ao formato do rosto.',
    approach: 'Mapeamento de linhas faciais, desenho de barba e corte com proporções calculadas para o biotipo.',
    result: 'Imagem mais madura e alinhada ao contexto profissional do cliente.',
    imageBefore: '/images/visagismo-masculino-antes.webp',
    imageAfter: '/images/visagismo-masculino-depois.webp',
    alt: 'Visagismo masculino em Campinas - antes e depois',
  },
  {
    title: 'Consultoria completa de imagem',
    objective: 'Revisar corte, cor e estilo para uma mudança intencional de imagem.',
    approach: 'Método Ery Junior com análise facial, colorimetria e projeto de imagem em etapas.',
    result: 'Transformação coerente com personalidade e objetivos de vida do cliente.',
    imageBefore: '/images/antes2.webp',
    imageAfter: '/images/depois2.webp',
    alt: 'Consultoria de visagismo em Campinas - resultado',
  },
];
