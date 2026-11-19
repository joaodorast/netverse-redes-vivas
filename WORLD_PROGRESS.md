# Laboratório: reconstrução e evidências

Atualização de 18/11/2026. O fluxo de exploração é único: entrada leve → Mundo 3D → controles da cena ou conteúdo → Ver telas. As duas versões preservam o mesmo motor, cenários e estado. Não há um segundo laboratório imersivo escondido.

## Critérios comuns às 12 áreas

- Navegação com nomes completos, câmera reposicionada pela área, mapa recolhível e inspeção acessível.
- Cena desobstruída por padrão; bancada e explicação abertas pelo usuário.
- Tela cheia do mundo e expansão independente das explicações/aulas.
- Texto DOM nítido no mundo, materiais PBR locais e iluminação sem HDRI externo.
- Um Canvas persistente, módulos lazy, instâncias e qualidade adaptativa. A versão leve não inicializa WebGL. O mundo em repouso renderiza sob demanda; o shell não acompanha cada tick.
- Eventos, perdas, tabelas, gráficos e pacotes derivados do motor; arquitetura estática não é tráfego fictício.

## Matriz das áreas

A matriz registra implementação e evidências verificáveis, não uma nota estética universal. As capturas `world-zone-N.png`, o relatório do renderer e os testes em `e2e/app.spec.ts` permitem revisar cada área.

| Área            | Design e interação próprios                        | Animação/dados                             | Otimização                                       | Acessibilidade e responsividade         | Evidência específica                   |
| --------------- | -------------------------------------------------- | ------------------------------------------ | ------------------------------------------------ | --------------------------------------- | -------------------------------------- |
| Início          | Saguão circular, equipamentos, missão              | DNS/TCP/HTTP automático                    | Pacotes e peças instanciados; SVG inicial        | Equipamentos por teclado; HUD recolhido | zone-0, entrada e saída, modo leve     |
| OSI             | Duas torres, camadas selecionáveis, PDU            | Encapsulamento e shader pelo tempo virtual | Etiquetas DOM, sem pós-processamento             | Pilha DOM, previsões, expansão          | zone-1, origem/destino e quiz OSI      |
| TCP/UDP         | Duas pistas, estado de handshake, perda provocada  | SYN/SYN-ACK/ACK e resultados reais         | Geometrias simples e chunk próprio               | Comparação DOM e controles rotulados    | zone-2, testes TCP/UDP do motor        |
| Web             | Três estações DNS/TCP/HTTP, domínio e fragmentos   | Página montada com dados reais             | Bancada sob demanda                              | Navegador DOM e explicação expansível   | zone-3, recuperação de perda HTTP      |
| Switch/roteador | Mesa de encaminhamento, rotas e MAC                | Contagens/tabelas do motor                 | Sem gráfico pesado em segundo plano              | Tabelas semânticas e maior prefixo      | zone-4, testes de MAC/rotas            |
| Topologias      | Ilha circular, cabos curvos, arrastar e organizar  | Conexões alteram o caminho real            | Force-directed em worker, cache de curvas        | Editor DOM equivalente; JSON validado   | zone-5, worker e importação/exportação |
| Meios físicos   | Três bancadas de sinal, seleção de meio            | Configuração de latência/perda real        | Materiais locais e sem partículas decorativas    | Sliders e escolhas DOM                  | zone-6, teste dos cenários             |
| Diagnóstico     | Console espacial com comando                       | Saída de ping/ipconfig/tracert             | Retenção limitada do motor                       | Terminal por teclado                    | zone-7, comando no terminal espacial   |
| Segurança       | Fronteira física e regras editáveis                | Bloqueios e política por porta             | Sem efeitos de rajada fictícios                  | Formulário e tabela de regras           | zone-8, firewall e fila DDoS           |
| Desempenho      | Observatório com barras, escala e unidades         | Throughput e novas perdas por amostra      | Barras instanciadas, 30 amostras visuais         | Gráfico/tabela DOM equivalentes         | zone-9, fórmula do motor e métricas    |
| Tendências      | Três instalações IoT/nuvem/SDN                     | Arquitetura e política do cenário          | Módulo próprio; escolhas sem recarregar renderer | Conteúdo e seletores DOM                | zone-10, cenários e serviço cloud      |
| Glossário/quiz  | Biblioteca de terminais, busca e resposta imediata | Feedback vinculado à resposta real         | Busca local e conteúdo sob demanda               | 24 questões por teclado                 | zone-11, 24 respostas e pontuação      |

## Evidências e limites

`docs/audit/world-renderer.json` contém amostras curtas por área. `contrast.json` calcula contraste dos tokens opacos. `axe-zones.json` registra o escopo do teste automático de acessibilidade. Os relatórios Lighthouse são medições locais, com histórico mantido para comparação. O arquivo de estabilidade só certifica 30 minutos se contiver `complete: true` e duração correspondente.

Não se declara certificação WCAG completa, memória GPU medida, 60 FPS universal nem validação em celular físico. Chrome headless e CPU emulada não substituem o dispositivo de apresentação. Não foi adicionado pós-processamento caro para mascarar geometria; a prioridade é leitura e resposta. O CSS foi reduzido por regras comprovadamente sem uso e duplicações seguras; os três arquivos ainda compõem a cascata.
