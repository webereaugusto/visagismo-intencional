import { siteConfig, absoluteUrl, getSameAsLinks, googleBusinessProfileUrl } from '../config/site';
import type { FaqItem } from '../config/faq';

type SchemaPage = {
  title: string;
  description: string;
  path?: string;
  image?: string;
};

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.siteUrl}/#organization`,
    name: siteConfig.siteName,
    alternateName: [siteConfig.brandLine, 'Visagismo em Campinas', 'Visagismo Campinas'],
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}/images/logo-branco-500-transparente-visagismo.png`,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.postalCode,
      addressCountry: 'BR',
    },
    sameAs: getSameAsLinks(),
  };
}

export function buildHairSalonSchema(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': `${siteConfig.siteUrl}/#hairsalon`,
    name: siteConfig.brandLine,
    alternateName: ['Visagismo em Campinas', 'Visagismo Campinas'],
    description,
    url: siteConfig.siteUrl,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    image: [
      `${siteConfig.siteUrl}${siteConfig.defaultImage}`,
      `${siteConfig.siteUrl}/images/logo-branco-500-transparente-visagismo.png`,
    ],
    priceRange: '$$$',
    currenciesAccepted: 'BRL',
    paymentAccepted: siteConfig.paymentMethods.join(', '),
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.postalCode,
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.address.latitude,
      longitude: siteConfig.address.longitude,
    },
    hasMap: googleBusinessProfileUrl(),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '17:00',
      },
    ],
    founder: {
      '@type': 'Person',
      '@id': `${siteConfig.siteUrl}/#person`,
      name: siteConfig.author,
      jobTitle: 'Visagista',
      sameAs: [siteConfig.social.instagram, siteConfig.social.youtube],
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Campinas',
        containedInPlace: { '@type': 'State', name: 'São Paulo' },
      },
      {
        '@type': 'Neighborhood',
        name: siteConfig.address.neighborhood,
        containedInPlace: { '@type': 'City', name: 'Campinas' },
      },
    ],
    sameAs: getSameAsLinks(),
  };
}

export function buildPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteConfig.siteUrl}/#person`,
    name: siteConfig.author,
    jobTitle: 'Visagista',
    description: `Visagista em Campinas com mais de ${siteConfig.experienceYears} anos de experiência em consultoria de imagem e visagismo.`,
    image: `${siteConfig.siteUrl}/images/about-1.jpg`,
    url: absoluteUrl('/sobre/ery-junior/'),
    worksFor: { '@id': `${siteConfig.siteUrl}/#organization` },
    knowsAbout: [
      'Visagismo',
      'Consultoria de Imagem',
      'Colorimetria',
      'Corte de Cabelo',
      'Harmonização Facial',
    ],
    sameAs: [siteConfig.social.instagram, siteConfig.social.youtube],
  };
}

export function buildWebSiteSchema(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.siteUrl}/#website`,
    url: siteConfig.siteUrl,
    name: siteConfig.siteName,
    description,
    publisher: { '@id': `${siteConfig.siteUrl}/#organization` },
    inLanguage: 'pt-BR',
  };
}

export function buildWebPageSchema(page: SchemaPage) {
  const pageUrl = absoluteUrl(page.path ?? '/');
  const image = page.image?.startsWith('http')
    ? page.image
    : `${siteConfig.siteUrl}${page.image ?? siteConfig.defaultImage}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: page.title,
    description: page.description,
    isPartOf: { '@id': `${siteConfig.siteUrl}/#website` },
    about: { '@id': `${siteConfig.siteUrl}/#hairsalon` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: image,
    },
    inLanguage: 'pt-BR',
  };
}

export function buildBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildFAQPageSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildServiceSchema(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType: 'Visagismo',
    provider: { '@id': `${siteConfig.siteUrl}/#hairsalon` },
    areaServed: {
      '@type': 'City',
      name: 'Campinas',
      containedInPlace: { '@type': 'State', name: 'São Paulo' },
    },
    url: absoluteUrl(path),
  };
}
