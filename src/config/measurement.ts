import { seoLaunchConfig } from './seo-launch';

/**
 * Palavras-chave e marcos do ciclo de otimização de 90 dias.
 * Use como referência ao revisar Search Console e GA4 quinzenalmente.
 */
export const measurementConfig = {
  primaryKeywords: ['visagismo campinas', 'visagismo em campinas'],
  secondaryKeywords: [
    'consultoria de visagismo campinas',
    'visagismo masculino campinas',
    'corte visagista campinas',
    'colorimetria campinas',
    'dia da noiva campinas',
  ],
  sitemapUrl: seoLaunchConfig.sitemapUrl,
  searchConsoleProperty: seoLaunchConfig.searchConsoleProperty,
  priorityIndexUrls: seoLaunchConfig.priorityIndexUrls,
  conversionEvents: ['whatsapp_click', 'phone_click'] as const,
  reviewCycleDays: 90,
  checkpoints: [
    { week: '1-2', focus: 'GBP verificado, sitemap no GSC, PUBLIC_GA_ID na Vercel, indexação das money pages' },
    { week: '3-6', focus: 'Páginas de serviço aprofundadas, casos reais e primeiras avaliações no Google' },
    { week: '7-12', focus: 'Conteúdo editorial, citações locais e otimização por dados do Search Console' },
  ],
} as const;
