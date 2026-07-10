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
  ],
  sitemapUrl: 'https://www.visagismocampinas.com.br/sitemap-index.xml',
  searchConsoleProperty: 'https://www.visagismocampinas.com.br/',
  conversionEvents: ['whatsapp_click', 'phone_click'] as const,
  reviewCycleDays: 90,
  checkpoints: [
    { week: '1-2', focus: 'Correções críticas, home, schema, sitemap, redirects e GBP' },
    { week: '3-6', focus: 'Páginas de serviço, autoridade e primeiros casos reais' },
    { week: '7-12', focus: 'Conteúdo editorial, citações locais e otimização por dados' },
  ],
} as const;
