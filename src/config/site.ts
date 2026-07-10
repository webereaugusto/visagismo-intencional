export const siteConfig = {
  siteName: 'Visagismo Intencional',
  brandLine: 'Visagismo Intencional by Ery Junior',
  siteUrl: 'https://www.visagismocampinas.com.br',
  defaultImage: '/images/baner.webp',
  locale: 'pt_BR',
  themeColor: '#D4A853',
  author: 'Ery Junior',
  experienceYears: 30,
  phoneDisplay: '(19) 99110-3018',
  phone: '+55 19 99110-3018',
  phoneClean: '5519991103018',
  email: 'contato@visagismointencional.com.br',
  whatsappBase: 'https://wa.me/5519991103018',
  address: {
    street: 'Rua Cel. Quirino, 41',
    neighborhood: 'Cambuí',
    city: 'Campinas',
    state: 'SP',
    country: 'Brasil',
    postalCode: '13025-000',
    latitude: -22.8975,
    longitude: -47.0565,
    full: 'Rua Cel. Quirino, 41 — Cambuí, Campinas, SP',
  },
  hours: {
    weekdays: 'Terça a Sexta: 09h às 19h',
    saturday: 'Sábado: 09h às 17h',
    closed: 'Domingo e Segunda: fechado',
  },
  paymentMethods: ['Dinheiro', 'Cartão de crédito', 'Cartão de débito', 'PIX'],
  parkingNote:
    'Fácil acesso no Cambuí, com amplas vagas e estacionamentos ao redor.',
  social: {
    instagram: 'https://www.instagram.com/eryjuniorhair/',
    instagramHandle: '@eryjuniorhair',
    facebook: 'https://www.facebook.com/visagismointencional',
    youtube: 'https://www.youtube.com/@eryjunior',
  },
  press: [
    {
      title: 'Contínua excelência é o que conduz o cabeleireiro Ery Júnior',
      url: 'https://www.portalnocambui.com.br/continua-excelencia-e-o-que-conduz-o-cabeleireiro-ery-junior-fundador-da-sofisticatto-hair-em-campinas/',
      outlet: 'Portal no Cambuí',
    },
  ],
  credentials: [
    'Formação Vidal Sassoon (Londres)',
    'Especializações em Nova York',
    'Certificações L\'Oréal (Paris)',
  ],
} as const;

/** Place ID do Google Business Profile — defina PUBLIC_GBP_PLACE_ID na Vercel após verificar o perfil. */
export function getGbpPlaceId(): string | null {
  const id = import.meta.env.PUBLIC_GBP_PLACE_ID;
  return typeof id === 'string' && id.trim().length > 0 ? id.trim() : null;
}

/** URL canônica do listing no Google Maps — defina PUBLIC_GBP_PROFILE_URL na Vercel. */
export function getGbpProfileUrl(): string | null {
  const url = import.meta.env.PUBLIC_GBP_PROFILE_URL;
  return typeof url === 'string' && url.trim().length > 0 ? url.trim() : null;
}

export function hasGoogleBusinessProfile(): boolean {
  return Boolean(getGbpPlaceId() || getGbpProfileUrl());
}

export function googleBusinessProfileUrl(): string {
  const profile = getGbpProfileUrl();
  if (profile) return profile;
  const placeId = getGbpPlaceId();
  if (placeId) return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  return mapsSearchUrl();
}

/** Link direto para avaliação no Google — só disponível com Place ID configurado. */
export function googleReviewUrl(): string | null {
  const placeId = getGbpPlaceId();
  if (!placeId) return null;
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}

export function getSameAsLinks(): string[] {
  const links: string[] = [
    siteConfig.social.instagram,
    siteConfig.social.facebook,
    siteConfig.social.youtube,
  ];
  const gbp = getGbpProfileUrl() ?? (getGbpPlaceId() ? googleBusinessProfileUrl() : null);
  if (gbp) links.push(gbp);
  return links;
}

export function whatsappLink(message: string) {
  return `${siteConfig.whatsappBase}?text=${encodeURIComponent(message)}`;
}

export function mapsSearchUrl() {
  const query = encodeURIComponent(
    `${siteConfig.address.street}, ${siteConfig.address.neighborhood}, ${siteConfig.address.city} - ${siteConfig.address.state}`
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function mapsEmbedUrl() {
  const { latitude, longitude } = siteConfig.address;
  return `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;
}

export function absoluteUrl(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') return `${siteConfig.siteUrl}/`;
  const withSlash = normalized.endsWith('/') ? normalized : `${normalized}/`;
  return `${siteConfig.siteUrl}${withSlash}`;
}
