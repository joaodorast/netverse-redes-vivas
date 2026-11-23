# Validação da reconstrução

Encerramento: 23/11/2026. As jornadas completas e medições abaixo foram executadas em 19/11/2026. Windows, Node.js 24.14.0, Vite 7.3.8, Vitest 4.1.12 e Chrome local via Playwright. As versões resolvidas estão no lockfile.

## Verificações concluídas

| Verificação                                                | Resultado                                                                                           |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run build`                                            | Aprovado; 2.566 módulos; build estático em `dist`                                                   |
| `npm run typecheck`                                        | Aprovado                                                                                            |
| `npm run lint`                                             | Aprovado                                                                                            |
| `npm test`                                                 | 36 testes aprovados; motor sem alteração                                                            |
| `NETVERSE_BASE_URL=http://127.0.0.1:4174 npm run test:e2e` | 22 jornadas aprovadas sobre o build final                                                           |
| Axe WCAG 2 A/AA e 2.1 AA                                   | 24 composições verificadas: 12 áreas × dois modos; zero violações nas regras automáticas examinadas |
| Tela cheia + mapa interno                                  | Troca de área em tela cheia e retorno aprovados; sem erros de JavaScript/console na jornada         |
| Integridade do motor                                       | Os três SHA-256 coincidem com o inventário anterior à reconstrução                                  |

Os testes de navegador cobrem as 12 áreas, controles, inspeção, comandos, 24 questões, missão com pontuação, JSON válido/inválido, recuperação de perda HTTP, recursos locais, teclado, navegação móvel, OSI interativo, Canvas persistente, fallback sem WebGL, tela cheia aninhada, bancadas, pausa e movimento da câmera em repouso, organização em worker e adiamento efetivo do chunk 3D na entrada leve. Larguras verificadas: 320, 768, 1.024, 1.366 e 1.920 px, além das jornadas móveis em 390 × 844.

Os 36 testes do motor incluem fila determinística, cenários, pausa/passo/reset, perdas e retransmissões, DNS, TCP/UDP, aprendizado MAC, flooding, endereços por salto, TTL, maior prefixo, cabos/rotas indisponíveis, firewall, comandos, throughput, JSON e condições das seis missões. Não foram alterados para acomodar a interface.

## Performance medida

O JavaScript principal tem 324,38 KB (103,86 KB gzip). O módulo do Canvas tem 959,41 KB (263,53 KB gzip), mais módulos compartilhados e a zona escolhida; esses bytes não fazem parte da entrada leve. A fonte local tem 98.932 bytes. Os testes verificam ausência de Canvas e de requisição ao chunk LabCanvas até o usuário escolher o mundo.

No Lighthouse local final (`docs/audit/lighthouse-final.json`): **performance 72, acessibilidade 100, boas práticas 100 e SEO 100**. FCP/LCP: 1,4 s; TBT: 1.730 ms; CLS: 0. Servidor Node local sem compressão HTTP, emulação móvel padrão do Lighthouse 13.6.0. Não é medição da conexão/CDN da Vercel. Os relatórios anteriores são históricos de sessões diferentes; não formam um experimento A/B controlado.

`world-renderer.json` registra amostras curtas por área: 37–60 FPS nessa rodada local, com o painel de métricas habilitado. O painel mantém renderização contínua para medir; fora dele, uma cena pausada desenha sob demanda. O resultado não é uma garantia de 60 FPS em qualquer equipamento.

`cpu-6x.json` registra amostras com repetição das experiências pelos controles, qualidade automática e throttling CDP de 1×/6×. Na condição 1×, as três amostras de atividade ficaram aproximadamente em 38–51 FPS. Com 6×, ficaram em 2,8–6,2 FPS: **essa condição está abaixo de uma experiência 3D fluida**. O CDP limita CPU do renderer; não reproduz uma GPU/celular físico. Para hardware muito restrito, a entrada leve e o botão Ver telas preservam o acesso ao conteúdo e às simulações. Não se afirma que a otimização eliminou esse limite.

## Estabilidade contínua

O ensaio de 30 minutos foi interrompido pelo detector de suspensão ou atraso prolongado, com último registro validado em **19 min 29 s**. Não certifica 30 minutos contínuos. Os registros preservados em `docs/audit/stability-interrupted.json` não contêm exceções da aplicação; documentam somente o intervalo observado. Não se declara aprovação do ensaio completo.

A publicação inicial foi mesclada pelo PR #2 e disponibilizada em `https://netverse-redes-vivas.vercel.app`. Três jornadas adicionais em produção passaram: percurso das 12 áreas, tela cheia/bancadas e adiamento do WebGL. HTML, fonte WOFF2 e ícone responderam HTTP 200; a fonte preservou seus 98.932 bytes. `production-check.json` e `production-assets.json` registram essa verificação.

## Evidências

- `docs/audit/axe-zones.json`: escopo e resultados das 24 composições.
- `docs/audit/contrast.json`: contraste dos tokens opacos, sem certificar transparências arbitrárias.
- `docs/audit/engine-integrity.json`: comparação de hashes do motor.
- `docs/audit/css-cleanup.json`: critérios e contagens da limpeza CSS.
- `docs/audit/world-renderer.json`, `cpu-6x.json` e `lighthouse-final.json`: medições com contexto.
- `docs/screenshots/world-zone-0.png` até `world-zone-11.png`: capturas reais por área.
- `docs/screenshots/lab-final-desktop.png`, `lab-final-osi.png` e `world-clean-mobile.png`: composição final sem painel de métricas.
- `WORLD_PROGRESS.md`: matriz por área, implementação e limites.
- `docs/audit/production-check.json`, `production-assets.json` e `stability-interrupted.json`: publicação e encerramento do ensaio.

## Reproduzir

```powershell
npm ci
npm run build
npm run typecheck
npm run lint
npm test
$env:NETVERSE_BASE_URL='http://127.0.0.1:4173'
npm run test:e2e
```

Playwright reutiliza o servidor configurado ou inicia o servidor estático. No Windows, detecta Chrome/Edge; outro executável pode ser definido com `NETVERSE_BROWSER`. Para o ensaio contínuo, mantenha o servidor e o computador ativos por 30 minutos e execute `node scripts/audit-browser.mjs` contra o mesmo build.

## Limites de validação

Não houve teste em celular/projetor físico, auditoria manual completa com leitor de tela, certificação WCAG integral nem medição de memória GPU. Axe e Lighthouse não substituem esses ensaios. O motor é um modelo didático, com simplificações descritas em `SIMULATION.md`; não executa uma pilha TCP/IP real. As evidências documentam o que foi verificado, sem nota máxima estética universal ou promessa de ausência absoluta de travamentos.
