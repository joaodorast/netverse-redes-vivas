# Desenvolvimento do mundo — primeira etapa

## Entregue
- Canvas persistente entre as 12 zonas; geometria apenas da zona ativa e estruturas vizinhas.
- Câmera com transição, WASD/setas, pointer lock opcional e controles de toque.
- Material holográfico GLSL ligado ao relógio real de OSI; tráfego instanciado, sem relógio decorativo independente.
- Teclados e grades dos equipamentos instanciados; Início caiu de 161 para 93 draw calls e Topologias de 186 para 72 na amostra local.
- Terminais DOM preservam aulas, missões, tabelas, comandos, quiz e laboratório; opção de visão simplificada preservada.
- Relógio via useFrame no modo mundo, RAF somente na visão simplificada/fallback. Motor intacto por comparação de SHA-256.
- Painel P com FPS/frame time/draw calls/triângulos/contagens de recursos; memória GPU explicitamente indisponível.
- Build/lint/36 testes do motor; 15 jornadas de navegador e teste adicional de relógio sem WebGL aprovados.

## Matriz de acompanhamento (não é aceite final)

Escala: P = protótipo implementado; V = verificação automatizada parcial; A = aberto. Não se atribui nota máxima sem evidência. Todos os conceitos abaixo precisam de direção de arte final, revisão com usuário iniciante e benchmark físico.

| Zona | Design | Animação causal | Performance | Acessibilidade | Responsividade | Testes/evidência |
|---|---|---|---|---|---|---|
| home | P: saguão/grafo | P: tráfego real | V: 93 calls | V: terminal/fallback | V parcial | world-zone-0.png |
| osi | P: duas torres | P: camada/GLSL/relógio | V: 49 calls | V: terminal completo | V parcial | world-zone-1.png + OSI E2E |
| tcp | P: dois túneis | P: unidades por protocolo | V: 20 calls | V: comparação DOM | V parcial | world-zone-2.png |
| web | P: estações | P: pageReady | V: 13 calls | V: navegador DOM | V parcial | world-zone-3.png + fluxo com perda |
| routing | P: mesa/tabelas | P: entradas reais | V: 9 calls | V: rotas/MAC DOM | V parcial | world-zone-4.png |
| topology | P: grafo | P: enlaces/pacotes | V: 72 calls | V: editor DOM | V parcial | world-zone-5.png + importação/exportação |
| media | P: bancadas | P: estado do motor | V: 27 calls | V: controles DOM | V parcial | world-zone-6.png |
| diagnostics | P: console | P: terminal real | V: contadores JSON | V: comandos por teclado | V parcial | world-zone-7.png |
| security | P: fronteira | P: regras/bloqueios reais | V: contadores JSON | V: regras DOM | V parcial | world-zone-8.png |
| performance | P: barras espaciais | P: samples reais | V: contadores JSON | V: gráfico DOM | V parcial | world-zone-9.png |
| trends | P: instalações | P: configuração real | V: contadores JSON | V: escolhas DOM | V parcial | world-zone-10.png |
| glossary | P: terminais | A: coreografia educativa | V: contadores JSON | V: quiz/busca DOM | V parcial | world-zone-11.png + 24 questões |

## Ainda não concluído

Esta etapa não atende integralmente ao pedido de reconstrução final. Faltam: cenas autorais completas de todas as zonas (as atuais são protótipos), terminais espacialmente integrados, minimapa, portais/boot com portas, áudio espacial, drag/puxar cabos no mundo, force-directed em worker, LOD completo, pós-processamento adaptativo, migração e remoção do CSS antigo, fontes locais licenciadas, verificação WCAG AA de todas as composições, Lighthouse/Spector/CPU6x, teste de 30 minutos e celular físico. As zonas não são declaradas perfeitas nem aprovadas.

O benchmark JSON é amostra curta Chrome headless local; não certifica FPS em hardware de apresentação. Build principal ~101,8 KB gzip; o Three.js carrega depois e deve ser contado no carregamento real do mundo. Prévia separada evita substituir a produção estável por uma etapa ainda incompleta.
