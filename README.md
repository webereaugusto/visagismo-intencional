# Visagismo Campinas — Ery Junior

Site institucional e de SEO local do **Visagismo Intencional by Ery Junior** (Cambuí, Campinas – SP).
Produção: https://www.visagismocampinas.com.br/

## Stack

- [Astro 5](https://docs.astro.build) (site estático) + Tailwind CSS 4
- `@astrojs/sitemap` para `sitemap-index.xml`
- Deploy na Vercel (redirects e cabeçalhos de cache em `vercel.json`)

## Comandos

| Comando           | Ação                                         |
| :---------------- | :------------------------------------------- |
| `npm install`     | Instala as dependências                      |
| `npm run dev`     | Servidor local em `localhost:4321`           |
| `npm run build`   | Gera o site em `./dist/`                     |
| `npm run preview` | Pré-visualiza o build localmente             |

## Estrutura

```text
src/
├── config/      # Dados do negócio (site.ts), FAQ, casos, metas de SEO e medição
├── layouts/     # Layout.astro (head, SEO, schema) e PageLayout.astro (páginas internas)
├── components/  # Seções da home e blocos reutilizáveis
├── pages/       # Rotas: home, páginas de serviço, guias e 404
├── utils/       # schema.ts — JSON-LD (Organization, HairSalon, Person, FAQ, Article…)
└── styles/      # global.css (tema Tailwind)
public/          # Imagens otimizadas (WebP), favicons e robots.txt
docs/            # Documentos de estratégia do projeto
```

Nome, endereço, telefones, horários e redes sociais ficam **somente** em `src/config/site.ts` —
mantenha esses dados idênticos ao Google Business Profile.

As pastas `galeria/` e `images/` na raiz guardam os originais das fotos e não entram no build.

## Variáveis de ambiente

Configure na Vercel (veja `.env.example` para o checklist pós-deploy):

- `PUBLIC_GA_ID` — Google Analytics 4 (eventos `whatsapp_click`, `phone_click`, `maps_click`)
- `PUBLIC_GSC_VERIFICATION` — verificação do Search Console (opcional)
- `PUBLIC_GBP_PLACE_ID` / `PUBLIC_GBP_PROFILE_URL` — Google Business Profile
