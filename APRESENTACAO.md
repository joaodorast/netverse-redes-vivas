# Apresentação · 18/11/2026

Duração proposta: 12 minutos, com até 3 minutos para perguntas. O PDF informa 18/11 sem ano; 2026 vem do prompt mestre. Grupo de 5–8 pessoas, sem nomes fictícios. Preencha os integrantes na aba Início e distribua os papéis abaixo entre os integrantes reais. Todos precisam estudar o guia do código.

| Tempo | Papel | Ação e fala |
| --- | --- | --- |
| 0:00–1:00 | Abertura | Mostre o Início e o grupo. “Nossa proposta é tornar visível o caminho dos dados.” Informe stack e apoio de IA. |
| 1:00–2:30 | Camadas | Abra OSI, edite a mensagem e use passos. Explique sete responsabilidades e quatro grupos; nem toda camada acrescenta cabeçalho. |
| 2:30–4:00 | Transporte | Abra TCP × UDP. Execute handshake. Use “Testar perda com TCP” e depois UDP. Compare recuperação, custo e limite. |
| 4:00–6:00 | Web | Abra Viagem da web. Antes de acessar, clique “Perder fragmento HTTP”, selecione 4× e acesse. Mostre DNS, handshake, GET, timeout, retransmissão e página montada. |
| 6:00–7:30 | Encaminhamento | Execute comutação. Mostre MAC aprendido, flooding e os IPs de sub-redes distintas. Inspecione o pacote após o roteador. |
| 7:30–8:30 | Topologia | Escolha malha, desconecte um enlace e envie. Compare com estrela. Explique a busca de caminho didática. |
| 8:30–10:00 | Segurança | Teste Telnet/23 e HTTPS/443; mostre decisões reais das regras e a missão verificada. Compare HTTP e TLS, incluindo metadados visíveis. |
| 10:00–11:30 | Diagnóstico | Prepare falha DNS. Execute ping por IP e nslookup por nome. Ative DNS, repita a consulta e mostre recuperação. |
| 11:30–12:00 | Encerramento | Faça uma questão do quiz. Ressalte o aprendizado e as simplificações. |

Para cinco integrantes, combine Abertura+Camadas, Transporte+Web, Encaminhamento+Topologia, Segurança e Diagnóstico+Encerramento. Com seis a oito, divida as falas sem deixar ninguém sem participação.

## Preparação na máquina da sala

Extraia o ZIP, instale Node 24 se necessário e abra o iniciador. Teste antes do dia da apresentação. Desconecte a internet e repita o fluxo web. Verifique projetor, zoom do navegador (110–125% conforme necessário) e legibilidade. Modo apresentação aumenta as explicações e oferece próximo cenário; todas as áreas continuam acessíveis ao sair do modo. Baixe a qualidade se o equipamento exigir ou use mapa 2D. Áudio começa desligado.

## Perguntas prováveis

- **Isso envia pacotes reais?** Não. É uma fila local de eventos e objetos tipados.
- **De onde vem o throughput?** Dos bytes entregues divididos pelo tempo virtual; não é um valor inventado no gráfico.
- **Por que reenviou?** A falha representou ausência de confirmação; o timeout agendou retransmissão limitada.
- **TCP sempre entrega?** Não. Falha persistente pode impedir a comunicação.
- **Por que MAC muda e IP fica?** MAC identifica a entrega no enlace atual; o IP identifica o destino final neste cenário sem NAT.
- **UDP sempre é mais rápido?** Não; depende da aplicação e das condições. Ele não oferece as mesmas garantias de transporte.
- **HTTPS impede todos os ataques?** Não. Protege o conteúdo sob premissas adequadas; metadados e endpoints ainda importam.
- **Onde está a IA?** Ela apoiou implementação, testes, documentação e arte. O grupo precisa explicar o código e suas limitações.
- **Qual a principal simplificação?** O motor não implementa uma pilha real; ARP, congestionamento, TLS e física estão abstraídos e documentados.
