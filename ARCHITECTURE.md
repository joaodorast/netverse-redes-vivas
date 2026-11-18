# Arquitetura

O motor não importa React, Three.js, DOM ou serviços de rede. Ele guarda estado serializável e uma fila privada de tarefas. A visualização recebe snapshots, enquanto as posições por quadro consultam o relógio do motor. Assim, pausar a lógica também pausa a posição dos pacotes.

```mermaid
flowchart LR
  UI[Controles e experimentos] --> Engine[Simulation]
  Engine --> Queue[Fila ordenada por tempo e desempate]
  Queue --> Engine
  Engine --> State[Snapshot tipado]
  State --> Store[Zustand]
  Store --> Scene[Three.js ou SVG 2D]
  Store --> Panels[Explicações, logs, tabelas e métricas]
```

## Módulos

`types.ts` define dispositivos, enlaces, pacotes, eventos, configurações e métricas. `network.ts` cria grafos de cenário, identifica caminhos ativos e consulta prefixos IP pelo maior comprimento. `Simulation.ts` é o controlador: agendamento, geração determinística de perdas, roteamento, transporte, diagnóstico e cenários.

`useSimulation.ts` mantém uma única instância do motor. `act()` executa uma alteração e publica seu snapshot. `App.tsx` tem um único ciclo `requestAnimationFrame`, cancelado no desmontar, que publica mudanças aproximadamente a cada 45 ms enquanto há reprodução. A escala de reprodução é aplicada antes de `tick`; o motor escala a velocidade selecionada.

`NetworkScene.tsx` renderiza só a cena visível. As geometrias são procedurais; os rótulos usam CanvasTexture com descarte no desmontar. A configuração automática reduz pixel ratio se a taxa observada cair abaixo de 35 FPS; isso não constitui garantia de desempenho. Uma fronteira de erro e o botão de mapa disponibilizam a alternativa SVG.

## Invariantes

- A fila usa tempo virtual e número de ordem como desempate estável.
- `pause()` não consome eventos. `step()` executa exatamente uma tarefa lógica; uma tarefa pode gerar vários registros pertinentes à mesma decisão.
- Reset limpa eventos pendentes, IDs, seed, pacotes e métricas. Não sobrevivem callbacks de cenários anteriores.
- `restartTraffic()` preserva equipamentos, conexões e tabelas, reiniciando somente a experiência de tráfego.
- Pacotes guardam origem/destino final, MAC atual, caminho previsto, histórico efetivo e instante de criação.
- A posição visual interpola somente entre os dois nós do salto atual.
- Logs, tabelas, throughput e explicações são consequências dos mesmos eventos.
- JSON do laboratório é validado antes de substituir o estado; não executa código.

## Limites de recursos

Logs retêm até 800 eventos, amostras de gráfico até 300 pontos e a lista principal de pacotes tem limite de retenção de 400 no envio. Cópias de flooding transitórias podem elevar esse limite durante uma rajada. Laboratório aceita até 30 dispositivos, 100 enlaces e arquivos de 100 KB pela interface. Retransmissões são limitadas a três. O motor aborta uma drenagem de testes acima de 20.000 tarefas.

Nomes do grupo ficam somente em localStorage. Laboratório usa exportação explícita para arquivo local. Não há autenticação, telemetria, armazenamento remoto ou backend de aplicação.

## Fundação do mundo persistente

`src/world/Lab` compõe o HUD; `LabCanvas` mantém o único Canvas no modo mundo e realiza culling por vizinhança. `Navigation` usa vetores/Euler reutilizados; `PacketField` usa InstancedMesh a partir dos timestamps do motor; `Hologram` compartilha o uniforme de relógio publicado por Clock. O renderer legado, quando dentro de WorldMode, mostra SVG e não cria Canvas adicional. O relógio do App desliga no modo mundo; Clock assume via useFrame. Sem WebGL, WorldFallback usa o RAF equivalente. Os terminais continuam usando as funcionalidades existentes; são escondidos no mundo e abertos pelo HUD. Limites e status estão em WORLD_PROGRESS.md.
