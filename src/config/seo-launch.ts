import { siteConfig } from './site';

/**
 * URLs prioritárias para solicitar indexação no Search Console após cada deploy.
 */
export const seoLaunchConfig = {
  sitemapUrl: 'https://www.visagismocampinas.com.br/sitemap-index.xml',
  searchConsoleProperty: 'https://www.visagismocampinas.com.br/',
  priorityIndexUrls: [
    'https://www.visagismocampinas.com.br/',
    'https://www.visagismocampinas.com.br/consultoria-de-visagismo-campinas/',
    'https://www.visagismocampinas.com.br/visagismo-masculino-campinas/',
    'https://www.visagismocampinas.com.br/visagismo-feminino-campinas/',
    'https://www.visagismocampinas.com.br/resultados/',
    'https://www.visagismocampinas.com.br/dicas-de-visagismo-campinas/',
    'https://www.visagismocampinas.com.br/dia-da-noiva-campinas/',
  ],
  gbpChecklist: [
    'Acesse business.google.com e crie o perfil com o nome exato do siteConfig.brandLine',
    `Endereço: ${siteConfig.address.street}, ${siteConfig.address.neighborhood}, ${siteConfig.address.city} - ${siteConfig.address.state}`,
    `Telefone: ${siteConfig.phoneDisplay} | Site: ${siteConfig.siteUrl}`,
    'Categoria: Salão de beleza ou Consultor de imagem',
    'Após verificar, copie Place ID e URL do perfil para PUBLIC_GBP_PLACE_ID e PUBLIC_GBP_PROFILE_URL na Vercel',
    'Peça avaliações reais após cada atendimento (sem incentivo)',
  ],
} as const;
