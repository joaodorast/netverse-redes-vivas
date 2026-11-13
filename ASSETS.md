# Assets, dependências e créditos

## Arte original de apoio

`public/assets/universe.webp` é uma arte decorativa criada com o gerador de imagem integrado em 12/11/2026 e convertida de PNG para WebP (qualidade 85) com Pillow. Não representa screenshot nem estado da simulação. O bitmap permanece local no projeto; equipamentos, enlaces e pacotes são objetos procedurais interativos.

Prompt usado (ferramenta integrada, sem CLI/API adicional):

> Use case: stylized-concept. Create a wide 1536x1024 cinematic background art for NETVERSE, an educational interactive computer networking universe. Deep midnight black #05070D, a refined abstract glass planetary ring built from fine cyan fiber-optic pathways, tiny blue and violet stars, distant dimensional network connections, understated high-end scientific art. Main luminous orbital structure on right half, left half mostly empty near-black for live UI text. No text, no logos, no watermark. This is decorative background art, not a screenshot. Subtle, elegant, crisp.

Arte gerada para esta entrega; não é um recurso externo sob licença Creative Commons e não se afirma exclusividade. Uso sujeito aos termos aplicáveis da ferramenta. Não há texturas ou modelos de terceiros baixados.

## Código visual

Logo tipográfico e símbolo de rede: texto e ícone Lucide. Modelos 3D: primitivas Three.js, composições originais. Fontes: Segoe UI/Consolas quando presentes, com alternativas de sistema; arquivos de fonte proprietários não são redistribuídos. Não há Google Fonts, CDN ou chamadas remotas em execução.

Capturas em `docs/screenshots` são geradas por Playwright sobre a aplicação local real. Não são imagens geradas por IA.

## Bibliotecas

React, React DOM, Vite, Tailwind CSS, Zustand, Three.js, React Three Fiber, Drei, Recharts e Vitest: licenças MIT conforme os respectivos pacotes. Lucide: ISC. TypeScript e Playwright: Apache-2.0. ESLint: MIT. Prettier: MIT. Confira os arquivos LICENSE dos pacotes e o lockfile para versões exatas; dependências transitivas podem ter licenças próprias. O projeto não é um simulador pronto de terceiros.

## Referências

O PDF “Trabalho Prático - Redes Vivas”, sete páginas fornecidas pelo usuário, fundamenta os requisitos acadêmicos. O prompt mestre fundamenta a ampliação e o acabamento. Não redistribuímos os documentos privados originais no repositório.

- [Especificação TCP — RFC 9293](https://www.rfc-editor.org/rfc/rfc9293.html)
- [Especificação UDP — RFC 768](https://www.rfc-editor.org/rfc/rfc768.html)
- [Especificação TLS — RFC 8446](https://www.rfc-editor.org/rfc/rfc8446.html)
- [Documentação do Vite](https://vite.dev/guide/)

Não foi adicionada uma licença geral de código em nome do usuário sem escolher explicitamente os termos de distribuição. Visibilidade pública no GitHub, por si só, não equivale a licença de uso irrestrito.
