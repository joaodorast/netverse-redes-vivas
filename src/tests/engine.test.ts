import { describe, it, expect } from "vitest";
import { Simulation } from "../engine/Simulation";
import {
  findPath,
  network,
  defaults,
  lookupRoute,
  device,
  validIPv4,
} from "../engine/network";
import type { Scenario } from "../engine/types";
import { missions } from "../features/missions";
const run = (
  scenario: Scenario,
  config: Parameters<typeof network>[1] = defaults,
) => {
  const e = new Simulation(scenario, config);
  e.start();
  e.runToEnd();
  return e;
};
describe("relógio, fila e controle", () => {
  it("pausa congela relógio e estado, passo avança evento", () => {
    const e = new Simulation("web");
    e.start();
    e.tick(50);
    e.pause();
    const before = e.snapshot();
    e.tick(5000);
    expect(e.snapshot()).toEqual(before);
    e.step();
    expect(e.state.events.length).toBeGreaterThan(before.events.length);
    expect(e.state.running).toBe(false);
  });
  it("velocidade escala relógio sem alterar sequência causal", () => {
    const a = new Simulation("web"),
      b = new Simulation("web");
    a.start();
    b.start();
    b.state.speed = 4;
    a.tick(20);
    b.tick(5);
    expect(a.state.time).toBe(b.state.time);
    a.runToEnd();
    b.runToEnd();
    expect(a.state.events).toEqual(b.state.events);
  });
  it("reinício cancela eventos e remove resultados antigos", () => {
    const e = run("web");
    e.reset();
    expect(e.state.packets).toHaveLength(0);
    expect(e.state.metrics.sent).toBe(0);
    expect(e.state.time).toBe(0);
    expect(e.state.pageReady).toBe(false);
    e.runToEnd();
    expect(e.state.events).toHaveLength(0);
  });
  it("seed reproduz perdas e resultados", () => {
    const c = { ...defaults, loss: 27, simultaneous: 30 };
    expect(run("performance", c).state.events).toEqual(
      run("performance", c).state.events,
    );
  });
  it("conclui todos os cenários sem fila infinita", () => {
    for (const scenario of [
      "home",
      "osi",
      "tcp",
      "web",
      "routing",
      "topology",
      "media",
      "diagnostics",
      "security",
      "performance",
      "trends",
      "glossary",
      "lab",
    ] as Scenario[]) {
      const e = run(scenario);
      expect(e.state.complete, scenario).toBe(true);
      expect(e.state.running, scenario).toBe(false);
      expect(e.state.metrics.sent, scenario).toBeGreaterThan(0);
    }
  });
  it("resiste a 100 trocas de cenário e reset durante execução", () => {
    const e = new Simulation();
    for (let i = 0; i < 100; i++) {
      e.reset(i % 2 ? "tcp" : "web");
      e.start();
      e.tick(100);
      e.pause();
      e.step();
    }
    e.reset("web");
    e.start();
    e.runToEnd();
    expect(e.state.pageReady).toBe(true);
  });
});
describe("protocolos e viagem web", () => {
  it("DNS precede handshake e HTTP, página só monta após três fragmentos confirmados", () => {
    const e = run("web");
    const packets = e.state.packets.filter(
      (p) => !["FLOOD", "REPETIÇÃO"].includes(p.label),
    );
    expect(packets.map((p) => p.label)).toEqual([
      "DNS consulta",
      "DNS resposta",
      "SYN",
      "SYN-ACK",
      "ACK",
      "HTTP GET",
      "HTTP 200 · 1/3",
      "ACK dados",
      "HTTP 200 · 2/3",
      "ACK dados",
      "HTTP 200 · 3/3",
      "ACK dados",
    ]);
    expect(e.state.pageReady).toBe(true);
    expect(e.state.metrics.acknowledged).toBe(3);
  });
  it("perda de resposta HTTP gera timeout, retransmissão e página", () => {
    const e = new Simulation("web");
    e.loseNext(true);
    e.start();
    e.runToEnd();
    expect(e.state.metrics.lost).toBe(1);
    expect(e.state.metrics.retransmitted).toBe(1);
    expect(e.state.pageReady).toBe(true);
    const loss = e.state.events.find((v) => v.type === "PERDA")!,
      retry = e.state.events.find((v) => v.type === "RETRANSMISSÃO")!;
    expect(retry.time - loss.time).toBe(1200);
  });
  it("UDP perde e não retransmite", () => {
    const e = new Simulation("tcp");
    e.loseNext();
    e.send({ protocol: "UDP", label: "UDP teste", data: true });
    e.runToEnd();
    expect(e.state.metrics.lost).toBe(1);
    expect(e.state.metrics.retransmitted).toBe(0);
    expect(e.state.packets.filter((p) => p.label === "UDP teste")).toHaveLength(
      1,
    );
  });
  it("TCP recupera a perda de dados", () => {
    const e = new Simulation("tcp");
    e.loseNext();
    e.send({ protocol: "TCP", label: "TCP teste", data: true, reliable: true });
    e.runToEnd();
    expect(e.state.metrics.retransmitted).toBe(1);
    expect(
      e.state.packets.some(
        (p) => p.label === "TCP teste" && p.status === "delivered",
      ),
    ).toBe(true);
  });
  it("falha persistente limita retransmissões e não promete entrega", () => {
    const e = new Simulation("tcp", { cable: false });
    e.send({ protocol: "TCP", label: "TCP teste", data: true, reliable: true });
    e.runToEnd();
    expect(e.state.metrics.retransmitted).toBe(3);
    expect(e.state.metrics.delivered).toBe(0);
    expect(e.state.events.some((e) => e.type === "FALHA")).toBe(true);
  });
  it("DNS indisponível impede handshake", () => {
    const e = run("web", { ...defaults, dns: false });
    expect(e.state.pageReady).toBe(false);
    expect(e.state.packets.some((p) => p.label === "SYN")).toBe(false);
  });
  it("nome não cadastrado responde NXDOMAIN sem montar página", () => {
    const e = run("web", { ...defaults, domain: "inexistente.test" });
    expect(e.state.pageReady).toBe(false);
    expect(e.state.events.some((v) => v.message.includes("NXDOMAIN"))).toBe(
      true,
    );
  });
  it("encapsula e desencapsula as sete camadas", () => {
    const e = run("osi", { ...defaults, message: "Mensagem verificável" });
    expect(
      e.state.events.filter((v) => v.type === "DESENCAPSULAMENTO"),
    ).toHaveLength(7);
    expect(e.state.osiLayer).toBe(7);
    expect(e.state.osiDirection).toBe("up");
    expect(e.state.packets.find((p) => p.label === "MENSAGEM")?.payload).toBe(
      "Mensagem verificável",
    );
  });
});
describe("encaminhamento e falhas", () => {
  it("novo envio preserva enlace interrompido e mapa customizado", () => {
    const e = run("topology");
    e.setLink("link-0", false);
    e.start();
    e.runToEnd();
    expect(e.state.links[0].active).toBe(false);
    expect(e.state.metrics.lost).toBe(1);
  });
  it("ping ao gateway local não depende de gateway padrão", () => {
    const e = new Simulation("diagnostics", { gateway: false });
    e.command("ping 192.168.10.1");
    e.runToEnd();
    expect(e.state.terminal.join("\n")).toContain("recebidos=4/4");
  });
  it("prefixo editado sem correspondência impede a entrega remota", () => {
    const e = new Simulation("routing");
    const router = e.state.devices.find((d) => d.type === "router")!;
    router.routes = router.routes.filter(
      (r) => r.network !== "192.168.20.0/24",
    );
    e.send({ protocol: "ICMP", label: "ROTA AUSENTE" });
    e.runToEnd();
    expect(e.state.metrics.lost).toBe(1);
    expect(
      e.state.events.some((v) => v.message.includes("sem rota correspondente")),
    ).toBe(true);
  });
  it("MACs de IDs com os mesmos caracteres permanecem distintos", () => {
    expect(
      device("device12", "A", "pc", [0, 0, 0], "192.168.10.12").mac,
    ).not.toBe(device("device21", "B", "pc", [0, 0, 0], "192.168.10.21").mac);
  });
  it("aprende origem na porta de entrada e faz flooding desconhecido", () => {
    const e = run("routing");
    const sw = e.state.devices.find((d) => d.id === "switch")!,
      pc = e.state.devices.find((d) => d.id === "pc")!,
      peer = e.state.devices.find((d) => d.id === "peer")!;
    expect(sw.macTable[pc.mac]).toBe("pc");
    expect(sw.macTable[peer.mac]).toBe("peer");
    expect(e.state.events.some((v) => v.type === "FLOOD")).toBe(true);
    expect(
      e.state.events.some((v) => v.detail.includes("Unicast conhecido")),
    ).toBe(true);
    e.clearMac();
    expect(sw.macTable).toEqual({});
  });
  it("roteador preserva destino IP e reescreve MAC", () => {
    const e = run("routing");
    const p = e.state.packets.find((p) => p.label === "OUTRA SUB-REDE")!;
    expect(p.destinationIP).toBe("192.168.20.2");
    expect(p.sourceMAC).toBe(
      e.state.devices.find((d) => d.id === "router")!.mac,
    );
    expect(p.headers.TTL).toBe("63");
    expect(p.path).toEqual(["pc", "switch", "router", "server"]);
  });
  it("gateway ou rota ausente bloqueia rede remota", () => {
    for (const flag of ["gateway", "route"]) {
      const e = run("web", { ...defaults, [flag]: false });
      expect(e.state.pageReady).toBe(false);
      expect(e.state.metrics.lost).toBeGreaterThan(0);
    }
  });
  it("desconectar durante trânsito causa perda real", () => {
    const e = new Simulation("performance");
    e.start();
    e.tick(5);
    e.setLink("link-0", false);
    e.runToEnd();
    expect(e.state.metrics.lost).toBeGreaterThan(0);
  });
  it("malha encontra caminho alternativo e estrela isola nó", () => {
    for (const topology of ["mesh", "star"] as const) {
      const { devices, links } = network("topology", { ...defaults, topology });
      const direct = links.find((l) => l.from === "pc")!;
      direct.active = false;
      const path = findPath(devices, links, "pc", "server");
      expect(path.length > 0).toBe(topology === "mesh");
    }
  });
  it("equipamento desligado não encaminha", () => {
    const e = new Simulation("web");
    e.setDevice("router", false);
    e.start();
    e.runToEnd();
    expect(e.state.pageReady).toBe(false);
  });
  it("latência configurada altera o tempo de entrega", () => {
    const a = run("performance", { ...defaults, latency: 20 }),
      b = run("performance", { ...defaults, latency: 200 });
    expect(b.state.time).toBeGreaterThan(a.state.time);
    expect(b.state.metrics.totalLatency).toBeGreaterThan(
      a.state.metrics.totalLatency,
    );
  });
  it("consulta por prefixo mais específico", () => {
    const d = device("r", "R", "router", [0, 0, 0], "192.168.10.1");
    d.routes.push({
      network: "0.0.0.0/0",
      interface: "default",
      nextHop: "direto",
    });
    expect(lookupRoute(d, "203.0.113.10")?.interface).toBe("WAN");
    expect(lookupRoute(d, "198.51.100.1")?.interface).toBe("default");
    expect(validIPv4("999.1.1.1")).toBe(false);
  });
});
describe("segurança, diagnóstico e dados", () => {
  it("seis missões verificam condições causais e não cliques", () => {
    expect(missions).toHaveLength(6);
    for (const m of missions)
      expect(m.complete(new Simulation(m.scenario).state), m.id).toBeFalsy();
    const connection = run("topology");
    expect(missions[0].complete(connection.state)).toBe(true);
    const loss = new Simulation("web");
    loss.loseNext(true);
    loss.start();
    loss.runToEnd();
    expect(missions[1].complete(loss.state)).toBe(true);
    expect(missions[2].complete(connection.state)).toBe(true);
    const firewall = new Simulation("security");
    firewall.send({ protocol: "TCP", label: "TESTE TELNET", port: 23 });
    firewall.send({ protocol: "TCP", label: "TESTE HTTPS", port: 443 });
    firewall.runToEnd();
    expect(missions[3].complete(firewall.state)).toBe(true);
    const dns = new Simulation("diagnostics");
    dns.command("nslookup www.exemplo.com.br");
    dns.runToEnd();
    expect(missions[4].complete(dns.state)).toBe(true);
    expect(missions[5].complete(run("routing").state)).toBe(true);
  });
  it("firewall permite 443, bloqueia 23 e aplica origem/destino", () => {
    const e = new Simulation("security");
    e.send({ protocol: "TCP", label: "HTTPS teste", port: 443, data: true });
    e.send({ protocol: "TCP", label: "Telnet teste", port: 23, data: true });
    e.runToEnd();
    expect(e.state.packets.find((p) => p.label === "HTTPS teste")?.status).toBe(
      "delivered",
    );
    expect(
      e.state.packets.find((p) => p.label === "Telnet teste")?.status,
    ).toBe("blocked");
    e.reset();
    e.setRules([
      {
        id: "restrita",
        action: "allow",
        protocol: "TCP",
        port: 443,
        source: "192.168.10.99",
        destination: "*",
      },
    ]);
    e.send({ protocol: "TCP", label: "restrito", port: 443 });
    e.runToEnd();
    expect(e.state.metrics.blocked).toBe(1);
  });
  it("DDoS é fila local que pode saturar e descartar", () => {
    const e = run("security", { ...defaults, ddos: true, bandwidth: 1 });
    expect(e.state.metrics.lost).toBeGreaterThan(0);
    expect(e.state.time).toBeGreaterThan(2000);
    expect(e.state.metrics.sent).toBe(60);
  });
  it("comandos interpretam argumentos e dependem da rede", () => {
    const e = new Simulation("diagnostics");
    e.command("ipconfig");
    expect(e.state.terminal.join("\n")).toContain("192.168.10.2");
    e.command("ping 192.168.10.1");
    e.runToEnd();
    expect(e.state.terminal.join("\n")).toContain("recebidos=4/4");
    e.command("ping 198.51.100.9");
    expect(e.state.terminal.at(-1)).toContain("desconhecido");
    e.command("nslookup www.exemplo.com.br");
    e.runToEnd();
    expect(e.state.terminal.join("\n")).toContain("Address: 203.0.113.10");
  });
  it("tracert mostra saltos IP sem switch", () => {
    const e = new Simulation("diagnostics");
    e.command("tracert 203.0.113.10");
    e.runToEnd();
    expect(e.state.terminal.join("\n")).toContain("1 192.168.10.1");
    expect(e.state.terminal.join("\n")).toContain("2 203.0.113.10");
    expect(e.state.terminal.join("\n")).not.toContain("192.168.10.254");
  });
  it("nslookup falha quando DNS indisponível", () => {
    const e = new Simulation("diagnostics", { dns: false });
    e.command("nslookup www.exemplo.com.br");
    e.runToEnd();
    expect(e.state.terminal.join("\n")).toContain("DNS indisponível");
  });
  it("SDN bloqueia dados quando controlador nega", () => {
    const e = run("trends", { ...defaults, trend: "sdn", sdnAllowed: false });
    expect(e.state.packets.some((p) => p.label === "PLANO DE DADOS")).toBe(
      false,
    );
    expect(
      e.state.events.some((v) => v.message.includes("bloqueou o fluxo")),
    ).toBe(true);
  });
  it("IoT produz quatro leituras e nuvem identifica serviço", () => {
    const e = run("trends");
    expect(
      e.state.packets.filter((p) =>
        ["24 °C", "PRESENÇA", "FRAME", "ESTADO: ON"].includes(p.label),
      ),
    ).toHaveLength(4);
    expect(
      run("trends", {
        ...defaults,
        trend: "cloud",
        cloud: "PaaS",
      }).state.events.some(
        (event) => event.type === "NUVEM" && event.message.includes("PaaS"),
      ),
    ).toBe(true);
  });
  it("throughput é calculado a partir de bytes e tempo", () => {
    const e = run("performance");
    const expected = (e.state.metrics.bytes * 8) / (e.state.time / 1000) / 1e6;
    expect(e.state.samples.at(-1)?.throughput).toBeCloseTo(expected, 3);
    expect(e.state.links.find((l) => l.to === "server")?.bandwidth).toBe(
      defaults.bandwidth / 4,
    );
  });
  it("laboratório exporta e importa JSON e rejeita estrutura inválida", () => {
    const e = new Simulation("lab"),
      raw = e.exportLab();
    e.addDevice(device("extra", "PC extra", "pc", [2, 0, 3], "192.168.10.44"));
    e.addLink("pc", "extra");
    e.importLab(raw);
    expect(e.state.devices.some((d) => d.id === "extra")).toBe(false);
    expect(() =>
      e.importLab('{"version":1,"devices":[],"links":[]}'),
    ).toThrow();
    expect(() => e.importLab("invalid")).toThrow();
  });
});
