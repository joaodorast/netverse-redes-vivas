# Alterações

## Reconstrução do laboratório · 2026-11-19

- Unifica a entrada no laboratório, mantém os nomes das 12 áreas e separa Mundo 3D, Ver telas e Controles e conteúdo.
- Reconstrói as cenas em módulos próprios, com bancadas interativas recolhidas, composição espacial por assunto, inspeção e mapa de viagem.
- Adiciona tela cheia do mundo e expansão independente de explicações e aulas.
- Melhora iluminação PBR local, rótulos nítidos, enquadramento por área e adaptação ao formato da tela.
- Adia WebGL na entrada leve; mantém um Canvas no mundo, renderiza sob demanda em repouso, reaproveita cabos e instancia peças, pacotes e barras.
- Separa a atualização da navegação e do áudio do relógio. Preserva o motor, aulas, missões, quiz, logs, métricas e JSON do laboratório.
- Inclui fonte Inter local licenciada, limpeza CSS documentada e novas evidências de navegador, acessibilidade e performance.

## 1.0.0 · 2026-11-13

- Cria motor de eventos determinístico, controles universais, simulações de rede, explicações e inspeção.
- Adiciona as 12 áreas, laboratório adicional, roteiro de apresentação, glossário com 32 verbetes e quiz com 24 questões.
- Implementa cena 3D procedural, alternativa 2D, arte local e layout adaptado a notebook e celular.
- Inclui testes de motor e navegador, documentação acadêmica e iniciadores Windows.
- Prepara entrega ZIP com código e build offline.

As simplificações e diferenças em relação ao escopo ideal constam em REQUISITOS.md e SIMULATION.md. Os resultados de validação executados constam em TESTING.md.

## Atualização visual da abertura

A tela inicial passa a iniciar tráfego automaticamente, com repetição ao terminar a jornada, controle de pausa do ambiente, equipamentos gerados em alta definição, animações Motion, conexões luminosas, órbitas e inspeção ligada aos pacotes reais. O painel exibe a explicação e a quantidade de entregas do motor. As demais áreas mantêm o laboratório 3D orbital.

## Cena espacial

A abertura agora utiliza equipamentos modelados em Three.js, bases luminosas, detalhes de portas, antenas e racks, câmera orbital e tráfego automático.

## Interface refinada

Sistema visual unificado: abertura com composição editorial e cena 3D, indicadores reais de atividade, navegação com estados mais claros, painéis e controles padronizados, contraste e layouts responsivos revisados.

## Experiências distintas e OSI dimensional

OSI com origem/destino, sete camadas em perspectiva, inspeção independente e PDU sincronizada ao motor. TCP/UDP prioriza comparação; web, o navegador; diagnóstico, o terminal; segurança, regras; desempenho, gráficos; meios, escolhas físicas. Three.js carrega em um chunk separado; renderização suspensa fora da tela e em aba oculta; equipamentos estáticos usam memoização. Pacotes ganharam rastros e o ambiente 3D recebeu estrelas estáticas leves.

## Laboratório imersivo e participação

Ambiente arquitetônico 3D sob demanda, câmera próxima, deslocamento W/A/S/D, inspeção contextual e missão de exploração. Jornadas interativas, busca com Ctrl+K, perguntas OSI com feedback e salto para inspeção da camada. Overlays responsivos, saída por Esc, pausa da cena ao fundo e carregamento separado do modo imersivo (cerca de 6 KB sem compressão).
