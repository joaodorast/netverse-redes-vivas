# Inovações implementadas

| Recurso | Problema resolvido | Implementação e custo |
| --- | --- | --- |
| Reproduzir mantendo falhas | Um novo envio não deve reparar magicamente um cabo desligado | Reinicia tráfego, preserva grafo e tabelas; cópia pequena do estado |
| Inspeção pelos logs e pela lista de pacotes | Pacotes rápidos são difíceis de clicar | IDs compartilhados com a cena e painel; até seis botões recentes |
| Mapa 2D funcional | WebGL pode falhar na máquina da sala | SVG usa os mesmos eventos, nós e posições; sem segunda lógica de rede |
| Seed determinística | Demonstrações precisam ser reproduzíveis | PRNG congruente linear no motor, sem `Math.random` nos protocolos |
| Qualidade automática | Projetores e notebooks têm GPUs diferentes | Ajuste de pixel ratio pela taxa observada; não promete FPS constante |
| Rotas editáveis com consulta CIDR | O aluno precisa testar uma rota incorreta | Busca de prefixo mais específico e perda causal sem correspondência |
| Arte separada da simulação | Uma imagem bonita não deve fingir tráfego | Fundo WebP decorativo, equipamentos e pacotes geométricos reais |
| Versão compilada no ZIP | Instalar dependências durante a apresentação é arriscado | Servidor estático Node nativo, pronto após extrair e instalar Node |
| Modos de leitura | Iniciantes precisam de analogias sem perder precisão | OSI e painel de eventos alternam analogias e detalhes; cabeçalhos permanecem disponíveis na inspeção |

## Propostas futuras, não entregues como funcionalidades

Replay arbitrário do histórico, editor completo de interfaces/sub-redes, protocolos STP/OSPF, congestionamento TCP, câmera microscópica, simulação física calibrada, estados internos detalhados de portas e benchmark automático por dispositivo. O projeto atual não usa InstancedMesh nem bloom; a cena pequena utiliza primitivas e luzes com pixel ratio controlado.
