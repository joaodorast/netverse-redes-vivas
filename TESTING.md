# Validação e evidências

Entrega finalizada em 13/11/2026. Ambiente: Windows, Node.js 24.14.0, TypeScript 5.9, Vite 7.3.8, Vitest 4.1.12 e Chrome local via Playwright. Versões resolvidas estão no lockfile.

## Verificações executadas

| Comando | Resultado observado |
| --- | --- |
| `npm run typecheck` | Aprovado, sem erros TypeScript |
| `npm run lint` | Aprovado, sem erros ESLint |
| `npm test` | **36 testes aprovados** |
| `npm run test:e2e` | **9 testes de navegador aprovados** |
| `npm run build` | Aprovado; 2.527 módulos transformados; saída em `dist` |
| Build em `127.0.0.1:4173`, servido por Node nativo | **3 testes de produção aprovados**: viagem web com perda, recursos exclusivamente locais e missão com pontuação |

O build final contém HTML, CSS, JavaScript principal, módulo 3D carregado separadamente e a arte WebP local. Os arquivos JS principais têm aproximadamente 712 KB e 948 KB antes de gzip; essa divisão mantém a cena 3D fora do carregamento inicial do código principal, mas não é um benchmark de performance em hardware de sala.

## Motor: 36 testes

- Pausa, passo, relógio, velocidade, reset e 100 trocas de cenário sem eventos antigos.
- Seed reproduzível e conclusão dos 13 cenários, contando o laboratório.
- DNS → handshake → GET → três fragmentos → confirmações → página.
- Perda HTTP com exatamente uma retransmissão e timeout de 1.200 ms.
- TCP recuperando dados, UDP sem retransmissão e falha persistente limitada.
- DNS indisponível, NXDOMAIN e sete passos de desencapsulamento.
- MAC aprendido pela origem, flooding e consulta unicast conhecida.
- IP preservado, MAC por salto, TTL e consulta por prefixo mais específico.
- Gateway ausente, rota removida, equipamento desligado e cabo rompido durante trânsito.
- Malha com alternativa, estrela isolada e reprodução preservando cabo desconectado.
- Ping ao gateway local sem gateway padrão, RTT, argumentos de terminal e saltos de tracert.
- Firewall por porta e endereço, fila DDoS, IoT, nuvem e SDN.
- Fórmula de throughput e gargalo real do modelo.
- Exportação/importação do laboratório e rejeição de formatos inválidos.
- Condições de conclusão das seis missões, sem pontuar cliques isolados.

## Navegador: 9 jornadas

1. Percorre as 12 áreas, usa passo/reset, executa ipconfig, responde quiz e busca DNS no glossário. Verifica ausência de erros JavaScript nessa jornada.
2. Adiciona equipamento, exporta JSON, reinicia, importa e rejeita topologia inválida sem substituir a válida.
3. Responde as 24 questões, confere pontuação de 8 acertos ao escolher sempre a primeira alternativa e reinicia o quiz.
4. Confere largura de página em 320, 768, 1.024, 1.366 e 1.920 pixels.
5. Desabilita WebGL, verifica mapa 2D e inspeciona o computador.
6. Completa a viagem web com perda, confirma uma retransmissão e inspeciona os dados de um pacote.
7. Verifica navegação móvel em 390 × 844, ausência de overflow horizontal e modo apresentação.
8. Bloqueia requisições externas, carrega a cena com recursos locais e usa inspeção no mapa 2D.
9. Inicia uma missão, revela dica, verifica conclusão e pontuação persistente durante a sessão.

As capturas reais revisadas estão em `docs/screenshots`: início desktop/mobile, notebook, página web, segurança mobile e quiz. O teste da página retorna ao topo antes de capturar, evitando a posição intermediária de elementos fixos durante a rolagem.

## Como repetir

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Playwright inicia o servidor automaticamente e reutiliza um servidor existente quando apropriado. No Windows, detecta Chrome ou Edge nos caminhos usuais. Para outro executável, defina `NETVERSE_BROWSER`. Sem navegador local detectado, instale o Chromium do Playwright com `npx playwright install chromium`.

Para testar o build usando somente o servidor estático nativo, defina `NETVERSE_BASE_URL=http://127.0.0.1:4173` e rode os testes desejados. A configuração escolhe `node scripts/serve.mjs --no-open` nesse caso.

## Escopo e limites da validação

Não houve auditoria WCAG completa, teste manual com leitor de tela, comparação entre todos os navegadores, ensaio em projetor físico ou garantia de 60 FPS. Os testes de estabilidade são ciclos automatizados, não uma sessão ininterrupta de várias horas. A física, TLS e algoritmos de redes são modelos simplificados, descritos em SIMULATION.md. Os iniciadores Windows são wrappers simples; o servidor Node é verificado diretamente.

O grupo ainda deve testar na máquina da apresentação, preencher seus nomes e ensaiar as falas. Uma suíte aprovada não substitui a compreensão do código.

## Reformulação visual

36 testes de motor, nove jornadas de navegador sobre o build isolado, typecheck, lint e build aprovados. A abertura inicia tráfego automaticamente e utiliza Motion e atlas gerado de equipamentos. O build desta atualização transforma 2.957 módulos.
## Revisão da interface — 17/11/2026
Build e lint aprovados. As sete jornadas funcionais passaram; após corrigir uma largura herdada do palco, passaram também as verificações em 320, 768, 1024, 1366 e 1920 pixels e a jornada mobile. Capturas de desktop, notebook e celular atualizadas. A simulação não foi alterada nesta revisão.
## Experiências e otimização — 17/11/2026
Dez jornadas de navegador aprovadas, incluindo inspeção de camada OSI, retorno ao acompanhamento automático e largura mobile. Build e lint aprovados. O motor não foi alterado. A renderização WebGL usa visibilidade de viewport/aba e os modelos estáticos usam memoização. Aulas/gráficos e Three.js são carregados em chunks separados; o tamanho final está registrado no build. Capturas OSI desktop/mobile em docs/screenshots.
