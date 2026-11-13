import type { SimulationState, Scenario } from "../engine/types";
export interface Mission {
  id: string;
  title: string;
  scenario: Scenario;
  objective: string;
  hints: string[];
  complete: (s: SimulationState) => boolean;
}
export const missions: Mission[] = [
  {
    id: "connection",
    title: "A primeira conexão",
    scenario: "topology",
    objective: "Envie uma mensagem de PC 01 ao último computador.",
    hints: [
      "Confira origem e destino no painel.",
      "Mantenha os enlaces da estrela conectados.",
      "Clique em Iniciar e acompanhe a entrega.",
    ],
    complete: (s) =>
      s.packets.some((p) => p.label === "MENSAGEM" && p.status === "delivered"),
  },
  {
    id: "loss",
    title: "O pacote perdido",
    scenario: "web",
    objective:
      "Entregue uma página apesar da perda preparada em um fragmento HTTP.",
    hints: [
      "A perda já está preparada.",
      "Clique em Acessar página; observe o timeout.",
      "Aguarde a retransmissão e os três ACKs de dados.",
    ],
    complete: (s) =>
      s.pageReady &&
      s.metrics.retransmitted > 0 &&
      s.metrics.acknowledged === 3,
  },
  {
    id: "cable",
    title: "Um caminho interrompido",
    scenario: "topology",
    objective: "Reconecte o primeiro enlace e entregue uma mensagem.",
    hints: [
      "O cabo de PC 01 foi desconectado.",
      "Use Reconectar primeiro enlace ou a lista de conexões.",
      "Inicie ou reproduza após reparar o enlace.",
    ],
    complete: (s) =>
      s.links[0]?.active &&
      s.packets.some((p) => p.label === "MENSAGEM" && p.status === "delivered"),
  },
  {
    id: "firewall",
    title: "A porta certa",
    scenario: "security",
    objective:
      "Verifique Telnet bloqueado e HTTPS permitido pelos dois testes.",
    hints: [
      "Portas: Telnet 23; HTTPS 443.",
      "Confira as duas regras e a ação escolhida.",
      "Clique Testar Telnet / 23 e Testar HTTPS / 443; aguarde as decisões.",
    ],
    complete: (s) =>
      s.packets.some(
        (p) => p.label === "TESTE TELNET" && p.status === "blocked",
      ) &&
      s.packets.some(
        (p) => p.label === "TESTE HTTPS" && p.status === "delivered",
      ),
  },
  {
    id: "dns",
    title: "O nome desapareceu",
    scenario: "diagnostics",
    objective: "Restaure o DNS e confirme a resolução pelo terminal.",
    hints: [
      "Compare ping por IP e nslookup por nome.",
      "O DNS está indisponível no painel Experimente.",
      "Ative DNS e execute nslookup www.exemplo.com.br.",
    ],
    complete: (s) =>
      s.config.dns &&
      s.terminal.some((t) => t.includes("Address: 203.0.113.10")),
  },
  {
    id: "route",
    title: "De volta à rota",
    scenario: "routing",
    objective:
      "Corrija a rota da rede 192.168.20.0/24 e entregue o pacote remoto.",
    hints: [
      "Observe a tabela de rotas abaixo da cena.",
      "A segunda rota foi alterada para 192.168.30.0/24.",
      "Edite o segundo prefixo para 192.168.20.0/24 e execute a experiência.",
    ],
    complete: (s) =>
      s.packets.some(
        (p) => p.label === "OUTRA SUB-REDE" && p.status === "delivered",
      ),
  },
];
