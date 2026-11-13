# Como compreender e explicar o código

## Percurso de leitura

1. Leia `src/engine/types.ts`. Identifique os campos de dispositivo, enlace, pacote, evento e métricas.
2. Em `network.ts`, desenhe o grafo padrão no papel. Explique como BFS percorre somente conexões ativas e como a consulta CIDR encontra a rota mais específica.
3. Em `Simulation.ts`, leia `schedule`, `start`, `tick`, `step`, `reset` e `restartTraffic`. Mostre a diferença entre tempo real e virtual.
4. Leia `send`: criação → validação → salto → decisão de equipamento → fila/latência → entrega ou perda.
5. Leia `fail`, `handshake`, `ack` e `web`. Siga a continuação `done` até a montagem da página.
6. Leia o teste “perda de resposta HTTP gera timeout, retransmissão e página”. Relacione cada asserção a uma linha do motor.
7. Leia a ponte `act` no store. Entenda por que a UI não inventa estados.
8. No renderer, encontre a interpolação `(time-start)/(end-start)`. Explique por que o pacote para ao pausar o relógio.
9. Em `Lessons.tsx`, compare o terminal e o gráfico: ambos leem a simulação; não chamam programas externos.

## Exercícios de domínio

- Altere latência de 80 para 200 ms, preveja o efeito e confira o resultado.
- Desligue o roteador no meio de um envio e explique por que a retransmissão pode falhar.
- Remova uma regra do firewall e explique o padrão de bloqueio.
- Esvazie a tabela MAC e encontre no log a primeira aprendizagem.
- Mude o prefixo da rota remota para outra rede; mostre que a consulta passa a falhar.
- Exporte uma topologia, abra o JSON e identifique os dois extremos de um enlace.
- Reproduza uma falha sem depender de frases memorizadas.

## Vocabulário para a apresentação

Uma **entidade** guarda informação; um **evento** representa uma mudança em um instante; a **fila** decide o próximo acontecimento; um **callback** continua a jornada quando uma etapa termina. Um **snapshot** é uma cópia para a interface. Um **teste** verifica automaticamente uma condição esperada, mas não substitui o ensaio na máquina da sala.

Cada integrante deve conseguir explicar pelo menos um fluxo completo e uma limitação. Não diga que o grupo implementou uma pilha TCP completa, criptografia real ou um simulador físico de rádio.
