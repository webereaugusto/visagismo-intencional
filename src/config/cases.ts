export type CaseStudy = {
  title: string;
  objective: string;
  diagnosis: string;
  approach: string;
  result: string;
  imageBefore: string;
  imageAfter: string;
  alt: string;
  /** Depoimento com consentimento do cliente — omitir se não houver autorização. */
  clientNote?: string;
};

export const caseStudies: CaseStudy[] = [
  {
    title: 'Harmonização feminina com colorimetria',
    objective: 'Valorizar traços faciais e renovar a imagem profissional sem perder identidade.',
    diagnosis:
      'Rosto oval com testa proporcional e mandíbula suave. Subtom de pele quente com subexposição de olhos por contraste inadequado entre cabelo e pele. Comprimento abaixo dos ombros sem movimento direcionado ao formato facial.',
    approach:
      'Análise de formato de rosto, estudo de subtom de pele e definição de corte em camadas estratégicas com iluminação na região do rosto. Paleta de cor alinhada ao biotipo para recuperar luminosidade sem agredir a fibra capilar.',
    result:
      'Visual mais leve, com cor alinhada ao tom de pele e maior definição facial. Cliente relatou mais confiança em reuniões e facilidade para manter o penteado no dia a dia.',
    imageBefore: '/images/visagismo-feminino-antes.webp',
    imageAfter: '/images/visagismo-feminino-depois.webp',
    alt: 'Transformação de visagismo feminino em Campinas',
    clientNote:
      'Pela primeira vez senti que a cor do cabelo conversava com meu rosto — não era só bonito, era meu.',
  },
  {
    title: 'Presença executiva masculina',
    objective: 'Transmitir autoridade e credibilidade com corte e barba integrados ao formato do rosto.',
    diagnosis:
      'Rosto retangular com mandíbula marcada e barba com densidade irregular nas bochechas. Corte anterior alongava o rosto e não acompanhava o contexto corporativo do cliente.',
    approach:
      'Mapeamento de linhas faciais, desenho de barba com transição gradual e corte com proporções calculadas para suavizar ângulos sem perder masculinidade. Harmonização de sobrancelhas para abrir o olhar.',
    result:
      'Imagem mais madura e alinhada ao contexto profissional. Barba e cabelo passaram a funcionar como um único projeto visual, não como serviços separados.',
    imageBefore: '/images/visagismo-masculino-antes.webp',
    imageAfter: '/images/visagismo-masculino-depois.webp',
    alt: 'Visagismo masculino em Campinas - antes e depois',
    clientNote:
      'O Ery explicou cada decisão antes de cortar. Saí com um visual que faz sentido para quem sou no trabalho.',
  },
  {
    title: 'Consultoria completa de imagem',
    objective: 'Revisar corte, cor e estilo para uma mudança intencional de imagem.',
    diagnosis:
      'Cliente em transição de carreira buscando reposicionamento visual. Desalinhamento entre estilo pessoal, rotina e mensagem que desejava transmitir. Cor e corte desatualizados em relação ao novo momento de vida.',
    approach:
      'Método Ery Junior com análise facial, colorimetria e projeto de imagem em etapas. Definição de referências visuais realistas, plano de manutenção e orientação de produtos para casa.',
    result:
      'Transformação coerente com personalidade e objetivos de vida do cliente. Projeto documentado para retornos futuros com o mesmo critério técnico.',
    imageBefore: '/images/antes2.webp',
    imageAfter: '/images/depois2.webp',
    alt: 'Consultoria de visagismo em Campinas - resultado',
    clientNote:
      'Não foi só um corte — foi um plano. Entendi por que cada escolha fazia sentido para mim.',
  },
];
