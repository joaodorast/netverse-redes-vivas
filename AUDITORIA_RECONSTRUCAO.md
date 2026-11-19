# Auditoria de reconstrução do NETVERSE

Data: 18/11/2026. Escopo: auditoria anterior à reconstrução. **Nenhum arquivo de implementação foi alterado nesta etapa.** O inventário em `docs/audit/inventario.json` contém caminho, tamanho, linhas, exports, títulos e SHA-256 de 39 arquivos textuais (16.297 linhas), obtido por leitura integral dos arquivos. Essa leitura automatizada é evidência de cobertura de inventário, não substitui uma prova de revisão humana linha a linha. A análise abaixo distingue achados de código, evidências existentes e medições ainda pendentes.

## Conclusão executiva

O produto atende experiências didáticas, mas sua arquitetura visual não atende ao novo contrato. A navegação ainda troca cenários e reinicia o motor; o modo imersivo é um diálogo adicional, com outro Canvas. Não existe um mundo persistente de 12 zonas nem transições físicas entre elas. A abordagem correta é preservar o motor, introduzir um único shell de mundo e migrar progressivamente os controles existentes para terminais acessíveis. Acrescentar mais overrides CSS ou efeitos ao renderer atual agravaria a dívida.

## Inventário das 12 áreas

Todas usam `content.ts`, o singleton de `useSimulation.ts`, `SimulationState` e, quando pertinentes, Controls, Explanation, Experiments, Logs, Inspector e Metrics. Os campos citados abaixo são consumidos ou necessários à experiência; não são novas APIs propostas ao motor.

| Área        | Ensino e implementação atual                                                                       | Interações e dados do motor                                                                                                | Fraqueza e conceito proposto                                                                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| home        | Home em App; CinematicNetwork; PathExplorer; StudioInteractions; seis missões em missions/Missions | Autoplay, pausa, jornadas, busca, inspeção, entrar/sair da imersão; scenario, running, complete, devices, packets, metrics | Duas experiências paralelas. Substituir por saguão com acesso às zonas, missão e estado de carregamento real.                                                                               |
| osi         | OsiWorkbench; layers; perguntas com feedback; pilhas CSS em perspectiva                            | Camada selecionada versus acompanhamento; osiLayer, osiDirection, config.message, packets.status; passo, pausa, PDU        | Pilhas não pertencem ao mundo WebGL; PDU é ilustrativa. Zona com duas torres e unidades físicas ligadas aos eventos; terminal semântico equivalente.                                        |
| tcp         | TcpLesson; duas pistas SVG, handshake e comparação                                                 | Perda provocada, retransmissão, ACK; packets por protocolo/label/status/attempt, metrics e eventos                         | Comparação está num painel separado do grafo. Dois túneis na mesma escala temporal; distinguir envio, confirmação e timeout sem prometer confiabilidade absoluta.                           |
| web         | WebLesson; navegador simulado, estágios, fragmentos                                                | Domínio, acessar página, perda HTTP; DNS, SYN/SYN-ACK/ACK, HTTP, pageReady, acknowledged                                   | A página é destino 2D e a rede é widget. Percurso físico por estações DNS/transporte/aplicação; TLS só como conceito quando não houver evento real do motor.                                |
| routing     | RoutingLesson; MacTable; tabela de rotas e prefixos editáveis                                      | Limpar MAC, editar rota, falhar gateway/rota; macTable, routes, packet MAC/IP, headers.Rota/Interface/TTL                  | Tabelas desconectadas espacialmente do encaminhamento. Mesa de decisão por salto com tabelas ancoradas e flooding derivado de cópias reais.                                                 |
| topology    | TopologyLesson; seleção de topologia e enlaces                                                     | Contagem, origem/destino, hub/switch, desconectar; devices, links.active, config.topology/count/central                    | Layouts fixos, editor completo fica no lab extra. Mesa espacial manipulável com edição pelas APIs existentes e fallback de teclado; layout visual não deve alterar semântica de roteamento. |
| media       | MediaLesson; três escolhas; Experiments                                                            | Meio, distância, interferência, banda, perda; config.medium/distance/interference, links, packets                          | Galeria vira cartões; sinal pouco tangível. Bancadas de cobre, fibra e rádio com efeitos ligados a pacotes; fórmulas continuam explicitamente didáticas.                                    |
| diagnostics | DiagnosticLesson; parser do motor e terminal                                                       | ipconfig, ping, tracert, nslookup, help, clear; terminal, eventos e falhas de DNS/gateway                                  | Terminal e rede separados; pouca ligação entre uma linha e o salto correspondente. Console físico com trajetos e respostas destacados; manter texto selecionável e teclado.                 |
| security    | SecurityLesson; regras ordenadas, testes, comparação HTTP/HTTPS                                    | CRUD/reordenar regras, testar 23/443, DDoS e criptografia simbólica; rules, blocked/lost, packets, config                  | Tabela domina e bloqueio não ocupa espaço. Barreira de inspeção com decisão real por regra; TLS não pode parecer cifra implementada ou ataque real.                                         |
| performance | PerformanceLesson; Recharts, seletor e estatísticas                                                | Banda, latência, simultaneidade/perda; samples, bytes, time, throughput, utilization                                       | Gráfico histórico 2D e cena em caixas diferentes. Observatório com gargalo no enlace, séries no espaço e tabela/gráfico acessível equivalente; distinguir métricas da rede de FPS.          |
| trends      | TrendsLesson; nuvem/IoT/SDN e tabela                                                               | Serviço cloud, sensores, política do controlador; config.trend/cloud/sdnAllowed e packets/events                           | Três conceitos compartilham uma tabela genérica. Três instalações com papéis diferentes; SDN tem fluxo de controle visível e dados só quando permitidos.                                    |
| glossary    | GlossaryLesson; 32 verbetes e 24 questões                                                          | Busca, filtros, expandir verbete, responder, feedback, score, reinício; estado local e content.ts                          | Única área sem jornada espacial; quiz fica isolado das missões. Biblioteca/terminais sem abandonar busca e formulário semânticos, nem esconder conteúdo atrás de movimento.                 |

O laboratório livre adicional também é contrato de regressão: criar/remover/mover nós, conectar/desconectar, editar IP, salvar/importar/exportar JSON e validar entrada. Não é a 13ª página da matriz exigida, mas seus recursos não podem desaparecer.

## Dívidas e riscos por módulo

- **App.tsx:** coordena navegação, relógio RAF, apresentação, áudio, missão, menu e diálogos. Navegar chama reset: persistência espacial não equivale a persistir o estado de todos os cenários. O novo shell deve manter uma única instância ativa e documentar essa política.
- **Lessons.tsx:** aulas de áreas distintas compartilham um módulo, incluindo Recharts. Há splitting em relação ao início, mas não por zona. Separar módulos antes de alegar preload independente por zona.
- **OsiWorkbench:** seleção e acompanhamento bem separados; preservar ambos. As questões são conceituais, não previsão verificada de um evento arbitrário do motor.
- **Panels:** controles e tabelas são reutilizáveis, mas precisam de slots e variantes. Não duplicar botões de execução em HUD e terminal sem uma única fonte de ação/estado.
- **Missions:** conclusão por condições reais do motor é uma boa base. Não substituir por contadores de cliques ou bloqueios de acesso que impeçam estudar uma área.
- **StudioInteractions:** busca/jornadas têm interação por teclado. Preservar foco, Escape, Enter e nomes acessíveis na nova navegação.
- **CinematicNetwork/ImmersiveLab:** autoplay e diálogo sobreposto criam dois contextos visuais. Suspender frames ao fundo ajuda, mas não equivale a um único Canvas nem garante liberação de recursos de ambos.
- **NetworkScene:** procedimentos de geometria, CanvasTexture, labels, eventos de ponteiro, câmera e fallback estão concentrados. Há meshes e callbacks por entidade; não há instancing geral, LOD de três níveis, instrumentação de GPU ou pós-processamento adaptativo. CameraFollow aloca Vector3 durante o frame; retirar alocações da nova camada.
- **Store:** refresh publica structuredClone de todo o estado; várias telas assinam a store inteira. Isso aumenta trabalho de React enquanto logs/pacotes crescem. O motor permanece intacto; otimizar a camada de consumo e publicação sem perder causalidade.
- **Motor:** fila determinística, execução de passo e limites de retenção são bases úteis. Congelar os hashes de engine no inventário e exigir diff zero durante a reconstrução. A UI não deve inventar eventos para compensar o modelo.
- **HTML/Vite/Vercel:** aplicação estática local, base relativa e rewrite de SPA existentes. Preservar assets locais, URLs diretas e fallback; deploy não é evidência de performance ou acessibilidade.
- **Documentação:** TESTING contém seções históricas com bundles, contagens e descrições já superadas; ARCHITECTURE ainda resume a fase anterior. Na nova entrega, separar baseline, histórico e resultado final por data/commit.

## Auditoria CSS

Análise por AST PostCSS em `docs/audit/css.json`:

- styles.css: **905 regras**, **83 grupos com mesmo seletor repetido no mesmo contexto**.
- design.css: **646 regras**, **27 grupos com mesmo seletor repetido no mesmo contexto**.
- **99 seletores individuais compartilhados** entre os arquivos.
- Exemplos concretos em styles.css: .sidebar (linhas 145/3649), .workspace-label (181/3316), .local-badge (291/3411).
- Exemplos em design.css: .spatial-stage (235/864), .spatial-pause (257/842), .spatial-stage .scene-tools (296/845). Linhas referem-se ao snapshot inventariado.
- Candidatos a CSS obsoleto incluem famílias do atlas 2.5D (.cinematic-device/.cinematic-wires), cartões de descoberta substituídos por PathExplorer e o OSI anterior (.osi-model/.tcp-model/.layer-detail). **Candidato não é prova de código morto**: confirmar uso em todas as variantes, fallback, apresentação e cobertura antes de remover.
- Repetição em media queries pode ser necessária. Não apagar por deduplicação textual cega. Migrar para tokens/base/shell/hud/zones/fallback, comparar estilos computados e remover as regras antigas somente após migração completa.

## Performance: evidência e lacunas

Build anterior documentado: entrada 317,47 KB / 101,53 KB gzip; módulo imersivo 6,03 KB / 2,27 KB gzip; Three.js separado. Isso satisfaz apenas o teto proposto para o chunk inicial, **não prova transferência total inicial**, porque a home solicita a cena logo após montar.

Gargalos prováveis, sustentados pelo código: snapshots completos ~a cada 45 ms; assinaturas amplas; RAF do App além do loop R3F; geometrias/materiais por dispositivo e pacote; texturas de rótulo; dois contextos WebGL no modo imersivo; conteúdo de aula/gráfico agrupado; sobreposição e duplicação de CSS.

**Não medidos ainda:** FPS em notebook comum/celular médio, p95 frame time, draw calls por zona, triângulos, memória GPU, FCP/LCP com cache frio, Lighthouse, CPU 6x, Spector.js e sessão contínua de 30 minutos. Não atribuir 60 FPS, <400 MB, <150 draw calls ou nota máxima sem esses dados. Heap JS não é memória GPU; em muitos browsers esta última não é exposta de forma confiável. O painel deve dizer indisponível quando pertinente.

## Precisão educativa e limites imutáveis

1. OSI representa responsabilidades; não fabricar sete cabeçalhos. TLS não corresponde normativamente a uma camada OSI exclusiva.
2. Web atual representa DNS/TCP/HTTP didático. Um portal TLS animado não pode ser apresentado como handshake real se o motor não o emite. Usar rótulo conceitual ou não exigir esse evento.
3. ARP é pré-conhecido no modelo: não anunciar uma negociação ARP real. Tracert é didático, sem pilha TTL completa.
4. Lookup por maior prefixo existe, mas o caminho do grafo é BFS e rotas são conectadas; não apresentar OSPF/BGP ou forwarding arbitrário por next-hop.
5. TCP usa timeout fixo e limite de tentativas; UDP não é universalmente mais rápido. Segurança é filtragem sem estado; DDoS é fila virtual.
6. Efeitos devem consumir status e timestamps reais. Pulso decorativo de ambiente deve ser explicitamente ambiente, nunca simulação de entregas, ataque, medição ou estado inexistente.
7. Se uma correção educativa exigir alterar semântica do motor, registrar conflito com a restrição de motor imutável; corrigir a explicação visual sem mudar silenciosamente a API.

## Contrato de regressão e aceite

Preservar: seis missões causais; 24 perguntas e 32 verbetes; terminal/argumentos; regras e ordem; MAC/rotas; configurações; logs/inspeção; pausas/passo/reset/velocidade; apresentação; editor/importação/exportação; execução offline; fallback SVG; foco e movimento reduzido.

A matriz final será 12 × {design, animação, performance, acessibilidade, responsividade, testes}. Neste momento todas as linhas estão **pendentes para o novo mundo**, não 10/10. Para aprovação de uma zona: cena própria + vínculo causal verificável + alternativa sem WebGL + teclado/toque + medidas de frame/draw calls/transferência + E2E específico + captura em desktop/mobile + revisão dos tokens. Nota de design é avaliação fundamentada, não benchmark objetivo. Nenhuma aprovação pode ser inferida de build verde.

## Direção de arte proposta — dez linhas

1. Mundo de instrumentação científica contínuo, com saguão e doze zonas conectadas por um eixo de circulação.
2. Fundo #05070d; ciano e índigo como acentos; âmbar restrito a seleção, atenção e perda contextual.
3. Sans legível e mono técnica locais; nenhuma fonte por CDN; texto educativo em superfície opaca quando necessário.
4. Escala tipográfica e espaçamento de 8px definidos em tokens, sem novas cores arbitrárias por componente.
5. Piso metálico/vidro controlado, bordas emissivas e iluminação por zona, evitando bloom global que destrua a leitura.
6. Um foco pedagógico por zona: torre, túnel, trajeto, tabela, grafo, meio, console, barreira, série, instalações ou biblioteca.
7. Câmera física com transição pulável; movimento reduzido usa teleporte direto e controles estáveis.
8. HUD compacto com mapa, objetivo e inspeção; controles DOM reutilizados como terminais acessíveis no mundo.
9. Materiais e instâncias compartilhados; efeitos habilitados por orçamento medido, não por lista de tecnologias.
10. Boot informa carregamento real; áudio espacial opcional e legendado; toda conquista depende de ação e resultado verificáveis.

## Sequenciamento sem excluir nenhuma página

A reconstrução só começa depois da revisão deste relatório e da direção pedida no anexo. Fundação: design system escrito com contraste calculado, adaptador de eventos, Canvas persistente, navegação, HUD, fallback, áudio e profiler. Depois: home → osi → tcp → web → routing → topology → media → diagnostics → security → performance → trends → glossary. Cada zona percorre análise/conceito/implementação/medição/revisão/testes. As fases não são autorização para entregar nove zonas inacabadas: todas permanecem no contrato final.

Shaders, partículas GPU, Web Worker e pós-processamento são escolhas condicionadas a benefício e perfil medido. Instanciar tráfego intenso é justificável; criar simulação física ou efeito caro onde um sinal simples ensina melhor não é requisito de qualidade. Force-directed deve resolver apenas apresentação e respeitar o mapa lógico do motor. Preservar posições editadas pelo usuário e parar o worker fora da zona.

## Estado desta etapa

Relatório estrutural e inventário produzidos; implementação nova não iniciada. As medições ausentes e a validação visual exaustiva por zona permanecem explicitamente abertas. Este documento não declara auditoria WCAG completa, revisão semântica comprovada de cada linha, validação GPU de 30 minutos ou conformidade com o mundo final. Essas lacunas não serão convertidas em notas máximas por suposição.

## Registro da implementação — 18/11/2026

A reconstrução e a matriz por área estão em `WORLD_PROGRESS.md`. As 12 cenas têm módulos próprios; navegação, conteúdo e laboratório usam um fluxo único. A entrada SVG adia o carregamento WebGL. A página anterior não fica montada trabalhando por trás do mundo. Rótulos DOM preservam a leitura com DPR adaptativo, e a explicação/bancada começa recolhida.

Correções educativas desta revisão: a seleção de nuvem passou a comparar a chave real `cloud`; o PDU da bancada OSI identifica o protocolo configurado e explicita sinais na camada Física; o observatório informa Mbit/s e assinala apenas amostras com novas perdas, não toda amostra após a primeira perda. A apresentação web identifica DNS/TCP/HTTP e não afirma uma implementação TLS real.

O motor não foi alterado: `docs/audit/engine-integrity.json` compara os três hashes com o inventário anterior. A limpeza CSS registra regras removidas e seus critérios em `css-cleanup.json`; a cascata base/design/world permanece documentada. Não se declara que todo o CSS legado foi migrado.

A primeira medição Lighthouse revelou custo excessivo de inicializar WebGL na versão leve. `SimpleScene`/`NetworkMap` removem essa inicialização; a jornada de navegador verifica ausência de Canvas e do chunk LabCanvas até a escolha do mundo. Medições finais e limites de interpretação ficam em `TESTING.md`.


## Fechamento — 19/11/2026

A animação de entrada de conteúdo passa a manter opacidade total desde o primeiro quadro, preservando contraste durante o carregamento de aulas lazy. O deslocamento sutil permanece; conteúdo educativo não fica quase transparente na transição. A espera dos testes pelo Canvas considera o carregamento assíncrono do módulo 3D, sem aumentar o prazo dos controles comuns. A inicialização leve continua verificando ausência de WebGL e do chunk 3D antes da escolha do usuário.
