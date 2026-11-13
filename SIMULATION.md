# Modelo de simulação e simplificações

## Relógio e unidades

O relógio usa milissegundos virtuais. A interface 1× avança 180 ms virtuais por segundo real para permitir inspeção. Latência é por enlace; o tempo total de entrega soma filas, serialização e latências. Uma transferência pode estar enfileirada e depois atravessar o enlace dentro do mesmo intervalo visual.

Serialização em ms = `bytes × 8 / (banda em Mbit/s × 10^6) × 1000`. Cada enlace mantém `busyUntil`, representando uma fila compartilhada nos dois sentidos. Esse enlace equivale a um canal agregado, não a duas filas full-duplex. Vazão acumulada em Mbit/s = `bytes entregues × 8 / segundos virtuais / 10^6`. Latência média é criação até entrega de cada unidade original ou retransmitida que chega. Contadores de envio/entrega não incluem cópias de flooding, mas o log mostra essas cópias.

## DNS, TCP, UDP e HTTP

DNS consulta `www.exemplo.com.br` ou `exemplo.com.br` e responde com `203.0.113.10`. Nomes não cadastrados resultam em NXDOMAIN; falha de DNS interrompe o fluxo web. Não há cache, recursão ou múltiplos tipos de registro.

TCP usa SYN, SYN-ACK e ACK antes dos dados da demonstração. Uma falha em unidade confiável agenda timeout de 1.200 ms e até três retransmissões. O valor de sequência na inspeção é ilustrativo e permanece o mesmo para uma retransmissão. O modelo não implementa uma máquina TCP completa, janelas, SACK, congestionamento, RTO adaptativo ou remontagem fora de ordem. A perda é detectada diretamente pelo motor, que representa a ausência de confirmação e agenda o timeout; não há um ACK oculto real. Confirmações explícitas são enviadas para os dados da comparação e para cada fragmento HTTP. Falha persistente não produz entrega.

UDP não confirma nem retransmite automaticamente. As duas pistas usam o mesmo grafo e condições; o TCP também paga o custo de abertura e confirmação. Isso não prova que um protocolo é universalmente mais rápido.

A página só é montada após consulta DNS, handshake, GET, três fragmentos HTTP 200 e seus ACKs. O exemplo representa HTTP/1.1 sobre TCP. HTTPS adiciona TLS; HTTP/3 usa QUIC sobre UDP. O navegador fictício não acessa o domínio real.

## OSI e TCP/IP

OSI tem sete responsabilidades, representadas em sete linhas; TCP/IP agrupa em quatro blocos. Cabeçalhos pertinentes aparecem como TCP, IP e Ethernet. Física representa sinais. Apresentação e sessão não recebem cabeçalhos fictícios independentes. Essa precisão ajusta a redação resumida do PDF, que pede cabeçalhos em todas as camadas. A correspondência de TLS com OSI é apenas uma analogia, não uma definição normativa.

## Comutação e roteamento

O switch aprende o MAC de origem na porta de ingresso. Um destino conhecido seleciona a indicação de porta registrada; desconhecido gera cópias para portas elegíveis, exceto a entrada. O caminho principal segue o grafo; cópias secundárias são mostradas e descartadas após verificação de destino. Não se modelam VLAN, STP, aging, loops de broadcast nem congestionamento de todas as cópias.

A resolução de vizinhos é pré-conhecida (ARP simplificado). Para alcançar rede remota, o quadro inicial aponta ao MAC do roteador. Ao encaminhar, o roteador consulta o prefixo mais específico, decrementa TTL e reconstrói MAC de origem/destino. Os IPs permanecem. Rotas são diretamente conectadas aos enlaces da topologia; a busca de caminho é BFS, sem protocolo dinâmico. O campo de interface identifica a saída didática; não se simula FIB de sistema operacional, NAT ou roteamento arbitrário por next-hop configurável. Os prefixos são editáveis para demonstrar acerto/ausência de rota.

## Topologias

Estrela depende do centro e de cada enlace de acesso. Barramento é aproximado por um meio compartilhado/hub; não simula propagação ao longo de um cabo único, terminações ou colisões. Anel é bidirecional com busca de caminho; não representa Token Ring. Malha usa caminhos ativos alternativos antes de cada envio. Uma falha no meio de um salto causa perda; o pacote não se teletransporta para outro caminho. Uma retransmissão ou novo envio recalcula o trajeto.

## Meios

Par trançado, fibra e Wi-Fi mudam o meio do enlace e o desenho do sinal. A banda é sempre configurável, não uma constante universal por tecnologia. Na aba de meios, a distância acrescenta propagação e afeta o risco de perda. A perda física didática de Wi-Fi é `min(0,8; interferência/120 + distância/2000)`; para cobre acima de 100 m, `min(0,8; (distância−100)/500)`. Fibra não recebe essa penalidade eletromagnética. Compara-se o maior valor entre perda física e perda configurada. Essas funções ensinam tendências; não são modelos de rádio, categoria de cabo ou orçamento óptico calibrados.

## Diagnóstico

O parser aceita `ping`, `tracert`, `ipconfig`, `nslookup`, `help` e `clear`. Comandos desconhecidos e argumentos ausentes têm mensagens próprias. Ping usa quatro pedidos/respostas ICMP, medindo RTT real do relógio virtual. Tracert mostra roteadores e destino, omitindo switches L2; representa pedidos e respostas dos saltos, sem construir uma pilha TTL completa. IPs fora do cadastro são desconhecidos. Nenhum comando usa o terminal do sistema.

## Segurança

Regras ordenadas com ação, protocolo, porta, IP de origem e destino. `*` em IP significa qualquer endereço; porta zero significa qualquer porta. A primeira correspondência vence; padrão é bloquear. É filtragem sem estado, sem inspeção de conexões; HTTP/HTTPS são associados a TCP para a regra. Não é um firewall de produção.

DDoS cria 60 envios virtuais de 1 MB a intervalos de 3 ms; a fila de enlace pode exceder 2 segundos e descartar. Quatro fontes fictícias com IPs próprios distribuem os envios pela rede; as três fontes extras surgem como equipamentos inspecionáveis. Nenhuma requisição real é emitida. A disponibilidade é observada por entregas e perdas; não há processo real de servidor.

O observador HTTP/TLS é conceitual. HTTP revela o payload e HTTPS mostra conteúdo cifrado simbólico; IP, tamanho e tempo continuam visíveis. Assume certificado correto e endpoints íntegros. Não há algoritmo criptográfico, interceptação real ou handshake TLS completo.

## Nuvem, IoT e SDN

Nuvem seleciona IaaS/PaaS/SaaS, envia uma unidade HTTPS e descreve responsabilidades. Quatro sensores produzem valores fictícios: temperatura, presença, câmera e estado de lâmpada. SDN envia a política do controlador ao switch; o fluxo de dados só é gerado quando permitido. Não implementa OpenFlow, infraestrutura cloud ou telemetria real.

## Referências primárias

- [RFC 9293 — TCP](https://www.rfc-editor.org/rfc/rfc9293.html)
- [RFC 768 — UDP](https://www.rfc-editor.org/rfc/rfc768.html)
- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)

Os textos do produto são explicações originais e simplificadas. As RFCs sustentam conceitos, mas esta implementação não reivindica conformidade completa com esses padrões.
