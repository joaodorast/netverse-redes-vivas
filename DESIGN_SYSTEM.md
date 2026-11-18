# Sistema visual do mundo NETVERSE

Tokens: fundo #05070d; superfície #101d2d; texto #ecf4ff; secundário #adc0d6; ciano #84e5d0; índigo #aaa5ff; âmbar #ffc48a. Grid de 8 px; espaçamentos 8/16/24/32/48. Raios 8/16/24. Tipografia local de sistema sans e Consolas mono; tamanhos 12/14/16/24/32/48. Texto corrido permanece DOM, selecionável e escalável.

Movimento: transição de zona 1,2 s, ease-out cúbico; seleção 160 ms; movimento reduzido elimina deslocamento de câmera. Materiais metálicos roughness 0,35–0,7; emissive localizado. Sem pós-processamento caro obrigatório. Canvas único no modo mundo; terminais DOM e fallback SVG preservam funções.

Contraste: medir os pares em texto opaco; não certificar contraste sobre transparência/3D sem composição final. Escuro sobre claro é reservado ao botão primário. Não depender somente de cor para estado.
