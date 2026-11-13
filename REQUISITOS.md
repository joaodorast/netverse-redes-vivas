# Matriz de requisitos e rastreabilidade

Fontes lidas: PDF “Trabalho Prático - Redes Vivas”, **todas as sete páginas**, e prompt mestre unificado fornecidos pelo usuário. O PDF é o contrato acadêmico; o prompt amplia o escopo. “Implementado” abaixo significa comportamento presente no modelo didático, não implementação de protocolos reais.

## Decisões de interpretação

1. O PDF lista **seis** áreas opcionais (topologias, meios, diagnóstico, segurança, desempenho e tendências). O prompt diz cinco em uma frase, mas enumera todas as seis em suas 12 abas. Foram implementadas as seis.
2. O PDF pede cabeçalhos a cada camada. Para evitar ensino incorreto, OSI representa responsabilidades e só acrescenta estruturas TCP, IP e Ethernet nas camadas pertinentes; física representa sinais.
3. O PDF sugere abrir index.html diretamente. A arquitetura React/Vite solicitada usa módulos e um servidor HTTP **local**, incluído com Node nativo. Continua funcionando sem internet; não precisa de hospedagem.
4. O PDF dá 18/11 sem ano. O prompt especifica 18/11/2026; essa data foi usada no roteiro.

## Contrato acadêmico

| ID / fonte | Requisito | Funcionalidade / arquivo | Teste ou verificação | Evidência | Estado |
| --- | --- | --- | --- | --- | --- |
| A01 · p.2,6 | Grupo 5–8, apresentação 10–15 min | Início; APRESENTACAO.md | Campo de integrantes; roteiro de 12 min | Tela inicial e roteiro | Implementado; preencher nomes reais |
| A02 · p.2,3 | Rede animada, texto sincronizado, experimento | NetworkScene, Explanation, Experiments | Cenários terminam; navegador percorre áreas | Logs e screenshots reais | Implementado |
| A03 · p.3 | Iniciar, pausar, passo, reiniciar, velocidade | Simulation e Controls | Testes de relógio, pausa, reset, velocidade | Suíte Vitest | Implementado |
| A04 · p.3 | Início com objetivo e guia | Home | Teste de abertura e navegação | home-desktop.png | Implementado |
| A05 · p.4 | OSI/TCP-IP, encapsulamento, camadas clicáveis | OsiLesson; osi() | Sete passos em cada sentido; mensagem preservada | UI e teste OSI | Implementado com precisão ajustada |
| A06 · p.4 | TCP/UDP lado a lado, handshake e recuperação | TcpLesson; handshake/fail | Ordem, perda TCP, perda UDP, falha persistente | Suíte de protocolos | Implementado |
| A07 · p.4,6,7 | Viagem DNS/TCP/HTTP, fragmentos, perda | web(); WebLesson | Fluxo completo com exatamente uma retransmissão | web-desktop.png e teste E2E | Implementado |
| A08 · p.4 | Aprendizado MAC e flooding | send(); MacTable | MAC origem/porta, unicast conhecido, cópias | Teste de encaminhamento | Implementado, domínio simples |
| A09 · p.4 | Rotas, gateway e saltos entre redes | lookupRoute; send; RoutingLesson | CIDR, prefixo ausente, MAC/TTL por salto | Tabela e inspeção | Implementado, rotas conectadas |
| A10 · p.4 | Glossário e quiz ≥5 questões | 32 verbetes, 24 questões | Busca, feedback, pontuação e reinício | quiz-desktop.png; E2E | Implementado |
| A11 · p.4 | Quatro topologias, falhas, hub × switch | network; TopologyLesson | Malha alternativa, estrela isolada, replay preserva falha | Testes de grafo e UI | Implementado com abstrações |
| A12 · p.4 | Cobre, fibra e rádio, distância/interferência | Experiments; send | Configurações alteram latência/perda, revisão das fórmulas | Meios e SIMULATION.md | Implementado como modelo ilustrativo |
| A13 · p.4 | ping, tracert, ipconfig, nslookup e falhas | command(); DiagnosticLesson | Argumentos, RTT, DNS fora do ar, saltos IP | Testes de comandos | Implementado |
| A14 · p.5 | Regras editáveis de firewall | setRules; SecurityLesson | Permitir443, bloquear23, IP restrito | Teste de segurança e missão | Implementado |
| A15 · p.5 | DDoS e interceptação HTTP/HTTPS | security; filas e payload simbólico | 60 envios, fila e perdas; inspeção conceitual | Teste DDoS; SIMULATION.md | Implementado: quatro fontes virtuais e interceptação conceitual |
| A16 · p.5 | Desempenho e gargalo, gráfico de throughput | sample(); PerformanceLesson | Fórmula a partir de bytes e tempo; enlace de 1/4 | Teste de métricas | Implementado |
| A17 · p.5 | IaaS/PaaS/SaaS, IoT e SDN | trends; TrendsLesson | Quatro leituras, serviço, política negada | Testes de tendências | Implementado didaticamente |
| A18 · p.5 | Cores, rótulos e legenda | protocolColors; renderer; Legend | Navegador e inspeção visual | Screenshots e mapa 2D | Implementado |
| A19 · p.5 | Pacotes inspecionáveis | Inspector, PacketTray, logs | Inspeção após HTTP; IPv4 do equipamento | E2E | Implementado |
| A20 · p.5 | Log cronológico e falhas provocáveis | events; Logs; configurações | Ordem dos eventos, falhas no meio do enlace | Vitest e UI | Implementado; lista mostra mais recente primeiro |
| A21 · p.5 | Desafios opcionais | Seis missões e conquista web | Condições de entrega/bloqueio/resolução | Interface e testes do motor | Seis condições verificadas, dicas e pontuação |
| A22 · p.5,6 | Execução local sem internet | Assets locais; scripts/serve.mjs | Bloqueio de URLs externas em E2E | Nenhuma dependência remota em runtime | Implementado |
| A23 · p.6 | Construção própria, créditos, transparência IA | Código original; ASSETS; GUIA-DO-GRUPO | Revisão de documentação | README e créditos | Implementado; compreensão depende do grupo |
| A24 · p.6 | Testar antes e todos participarem | TESTING; roteiro por papéis | Testes nesta máquina | Relatório de validação | Ensaio da sala ainda necessário |

## Ampliações do prompt

| Item | Entrega concreta | Limite ou diferença |
| --- | --- | --- |
| React/TS/Vite/Tailwind + 3D | Stack instalada, tipagem estrita, módulos separados | GSAP, Radix e shadcn eram preferências e não foram necessários |
| Visual cinematográfico | Identidade escura, arte orbital local, equipamentos procedurais, câmera livre | Aproximação inicial breve e pulável; sem coreografia progressiva dos cabos |
| Geração de imagem | WebP gerado e documentado | Fundo decorativo; não substitui equipamentos |
| Pacote como entidade causal | Trajetória, cabeçalhos, eventos, inspeção e câmera | SEQ ilustrativo, sem pilha completa ou ARP detalhado |
| Lab livre | Criar, arrastar no mapa de edição, conectar, desligar, IP e JSON | Não é editor arbitrário de interfaces, sub-redes e next-hops; tráfego precisa de grafo compatível |
| Apresentação | Nove cenários, instrução de fala e texto maior | Perda HTTP, cabo e DNS são preparados nas paradas; não há autoplay completo de todo roteiro |
| Iniciante/Técnico | Analogias OSI e inspeção detalhada | Analogias de eventos no iniciante, detalhes e campos técnicos no modo técnico; títulos de eventos são compartilhados |
| Áudio | Tons locais opcionais, desligados inicialmente, volume | Não há trilha sonora |
| Desempenho adaptativo | Pixel ratio automático, perfis, lazy load, limpeza de recursos | Sem InstancedMesh, bloom ou benchmark de 60 FPS; primitivas pequenas dispensam tais efeitos |
| Acessibilidade | Foco, teclado, rótulos, movimento reduzido, alternativas 2D/lista | Não foi realizada auditoria WCAG completa com leitores de tela |
| Responsividade | Breakpoints, navegação móvel e painéis reorganizados | Gráficos/tabelas podem ter rolagem local; não devem causar rolagem horizontal da página |
| Documentação e testes | Matriz, arquitetura, simulações, roteiro, créditos e suítes | Resultados e escopo real registrados em TESTING.md |
| Git individual e PT-BR | Scripts de verificação do histórico, staging por caminho | A contagem final está no relatório de entrega; não se inventa URL ou commit |
| Entrega ZIP | Código, build, iniciadores e instruções | Node deve estar instalado; node_modules não acompanha |

O projeto cobre as áreas e experiências acadêmicas com as simplificações explicitadas. Os itens da coluna de limites não devem ser apresentados como concluídos integralmente no acabamento ideal do prompt.
