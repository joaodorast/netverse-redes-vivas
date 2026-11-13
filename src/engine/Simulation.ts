import {
  defaults,
  findPath,
  network,
  lookupRoute,
  validIPv4,
  device,
} from "./network";
import type {
  Config,
  NetworkPacket,
  Protocol,
  Scenario,
  SimulationState,
  FirewallRule,
  NetworkDevice,
  NetworkLink,
} from "./types";
type Job = { at: number; order: number; run: () => void };
type Send = {
  source?: string;
  destination?: string;
  protocol: Protocol;
  label: string;
  payload?: string;
  port?: number;
  size?: number;
  reliable?: boolean;
  data?: boolean;
  attempt?: number;
  sequence?: number;
  done?: (ok: boolean) => void;
};
const emptyMetrics = () => ({
  sent: 0,
  delivered: 0,
  lost: 0,
  blocked: 0,
  retransmitted: 0,
  acknowledged: 0,
  bytes: 0,
  totalLatency: 0,
});
export class Simulation {
  state: SimulationState;
  private queue: Job[] = [];
  private serial = 0;
  private packetSerial = 0;
  private rng = 42;
  private started = false;
  private dropNext = false;
  private dropResponse = false;
  constructor(scenario: Scenario = "home", config: Partial<Config> = {}) {
    const c = { ...defaults, ...config };
    this.state = {
      scenario,
      time: 0,
      running: false,
      speed: 1,
      ...network(scenario, c),
      packets: [],
      events: [],
      metrics: emptyMetrics(),
      samples: [],
      explanation:
        "Sua rede está pronta. Inicie uma experiência ou avance um passo.",
      detail:
        "Todos os endereços, eventos e tempos pertencem a esta rede virtual. Nenhum tráfego é enviado à internet.",
      phase: "PRONTO PARA EXPLORAR",
      osiLayer: 7,
      osiDirection: "down",
      pageReady: false,
      terminal: [
        "NETVERSE OS · terminal da rede simulada",
        "Digite help para conhecer os comandos.",
      ],
      rules: [
        {
          id: "https",
          action: "allow",
          protocol: "TCP",
          port: 443,
          source: "*",
          destination: "*",
        },
        {
          id: "telnet",
          action: "deny",
          protocol: "TCP",
          port: 23,
          source: "*",
          destination: "*",
        },
      ],
      config: c,
      complete: false,
    };
    this.rng = c.seed;
  }
  snapshot(): SimulationState {
    return structuredClone(this.state);
  }
  private random() {
    this.rng = (Math.imul(1664525, this.rng) + 1013904223) >>> 0;
    return this.rng / 4294967296;
  }
  private schedule(delay: number, run: () => void) {
    this.queue.push({ at: this.state.time + delay, order: this.serial++, run });
    this.queue.sort((a, b) => a.at - b.at || a.order - b.order);
  }
  log(
    type: string,
    message: string,
    detail = "",
    packetId?: string,
    deviceId?: string,
  ) {
    this.state.events.push({
      id: this.serial++,
      time: this.state.time,
      type,
      message,
      detail,
      packetId,
      deviceId,
    });
    if (this.state.events.length > 800) this.state.events.shift();
    this.state.explanation = message;
    this.state.detail = detail;
    this.state.phase = type;
  }
  configure(change: Partial<Config>) {
    Object.assign(this.state.config, change);
    for (const l of this.state.links) {
      l.latency = this.state.config.latency;
      l.bandwidth =
        this.state.scenario === "performance" && l.to === "server"
          ? this.state.config.bandwidth / 4
          : this.state.config.bandwidth;
      l.loss = this.state.config.loss;
      l.medium = this.state.config.medium;
    }
    this.log(
      "CONFIGURAÇÃO",
      "Condições da rede atualizadas.",
      "As novas condições se aplicam aos próximos saltos.",
    );
  }
  reset(scenario = this.state.scenario, config = this.state.config) {
    const speed = this.state.speed,
      rules = this.state.rules;
    this.queue = [];
    this.serial = 0;
    this.packetSerial = 0;
    this.started = false;
    this.dropNext = false;
    this.dropResponse = false;
    this.state = new Simulation(scenario, config).state;
    this.state.speed = speed;
    this.state.rules = structuredClone(rules);
    this.rng = config.seed;
  }
  start() {
    if (this.state.complete) {
      const dropNext = this.dropNext,
        dropResponse = this.dropResponse;
      this.restartTraffic();
      this.dropNext = dropNext;
      this.dropResponse = dropResponse;
    }
    if (!this.started) {
      this.started = true;
      this.launch();
    }
    this.state.running = true;
  }
  /** Replay traffic while keeping the topology, failures and learned tables. */
  restartTraffic() {
    const devices = structuredClone(this.state.devices),
      links = structuredClone(this.state.links);
    this.reset();
    this.state.devices = devices;
    this.state.links = links.map((l) => ({ ...l, busyUntil: 0 }));
  }
  pause() {
    this.state.running = false;
  }
  step() {
    this.state.running = false;
    if (!this.started) {
      this.started = true;
      this.launch();
    }
    const job = this.queue.shift();
    if (job) {
      this.state.time = job.at;
      job.run();
      this.sample();
    }
    this.finishIfIdle();
  }
  tick(delta: number) {
    if (!this.state.running) return;
    const target = this.state.time + delta * this.state.speed;
    let guard = 0;
    while (this.queue[0] && this.queue[0].at <= target && guard++ < 2000) {
      const job = this.queue.shift()!;
      this.state.time = job.at;
      job.run();
      this.sample();
    }
    if (this.queue.length) this.state.time = target;
    this.finishIfIdle();
  }
  private finishIfIdle() {
    if (this.started && !this.queue.length) {
      this.state.running = false;
      this.state.complete = true;
    }
  }
  runToEnd(limit = 20000) {
    let n = 0;
    while (this.queue.length && n++ < limit) {
      const j = this.queue.shift()!;
      this.state.time = j.at;
      j.run();
      this.sample();
    }
    this.finishIfIdle();
    if (n >= limit) throw Error("Limite de eventos excedido");
  }
  loseNext(response = false) {
    if (response) this.dropResponse = true;
    else this.dropNext = true;
    this.log(
      "EXPERIMENTO",
      response
        ? "O próximo fragmento HTTP será perdido."
        : "O próximo pacote de dados será perdido.",
      "A falha é aplicada pelo motor no enlace, não apenas na animação.",
    );
  }
  setLink(id: string, active: boolean) {
    const l = this.state.links.find((l) => l.id === id);
    if (l) {
      l.active = active;
      this.log(
        "ENLACE",
        `${l.from} ↔ ${l.to}: ${active ? "conectado" : "desconectado"}.`,
      );
    }
  }
  setDevice(id: string, active: boolean) {
    const d = this.state.devices.find((d) => d.id === id);
    if (d) {
      d.active = active;
      this.log("EQUIPAMENTO", `${d.name}: ${active ? "ligado" : "desligado"}.`);
    }
  }
  clearMac() {
    this.state.devices.forEach((d) => (d.macTable = {}));
    this.log(
      "SWITCH",
      "Tabelas MAC esvaziadas.",
      "O próximo quadro com destino desconhecido provoca flooding.",
    );
  }
  setRules(rules: FirewallRule[]) {
    this.state.rules = rules;
    this.log(
      "FIREWALL",
      "Regras aplicadas na ordem exibida.",
      "A primeira correspondência decide. Sem correspondência, bloquear.",
    );
  }
  private sample() {
    const { metrics: m, time: t, config: c } = this.state;
    if (t === 0) return;
    const throughput = (m.bytes * 8) / (t / 1000) / 1e6;
    const last = this.state.samples.at(-1);
    const sample = {
      time: +(t / 1000).toFixed(3),
      throughput: +throughput.toFixed(4),
      delivered: m.delivered,
      lost: m.lost,
      latency: m.delivered ? m.totalLatency / m.delivered : 0,
      utilization: Math.min(100, (throughput / c.bandwidth) * 100),
    };
    if (last?.time === sample.time)
      this.state.samples[this.state.samples.length - 1] = sample;
    else this.state.samples.push(sample);
    if (this.state.samples.length > 300) this.state.samples.shift();
  }
  private fail(p: NetworkPacket, opt: Send, reason: string, blocked = false) {
    p.status = blocked ? "blocked" : "lost";
    p.end = this.state.time;
    p.history.push(reason);
    this.state.metrics[blocked ? "blocked" : "lost"]++;
    this.log(
      blocked ? "BLOQUEADO" : "PERDA",
      reason,
      "O destino não recebeu esta unidade.",
      p.id,
    );
    if (opt.reliable && !blocked && (opt.attempt ?? 0) < 3) {
      this.log(
        "TIMEOUT",
        `Aguardando confirmação de ${p.label}.`,
        "Neste modelo o timeout é 1.200 ms; TCP real estima o RTO a partir do RTT.",
        p.id,
      );
      this.schedule(1200, () => {
        this.state.metrics.retransmitted++;
        this.log(
          "RETRANSMISSÃO",
          `TCP reenvia ${p.label}.`,
          "Não houve confirmação; a retransmissão é limitada a três tentativas.",
          p.id,
        );
        this.send({ ...opt, attempt: (opt.attempt ?? 0) + 1 });
      });
    } else {
      if (opt.reliable && !blocked)
        this.log(
          "FALHA",
          "Limite de retransmissões atingido.",
          "TCP não garante entrega se a rede permanecer indisponível.",
          p.id,
        );
      opt.done?.(false);
    }
  }
  send(opt: Send) {
    this.started = true;
    const c = this.state.config;
    const source = opt.source ?? "pc",
      destination = opt.destination ?? "server";
    const s = this.state.devices.find((d) => d.id === source),
      d = this.state.devices.find((d) => d.id === destination);
    if (!s || !d) {
      this.log("ERRO", "Origem ou destino inexistente.");
      opt.done?.(false);
      return;
    }
    if (!validIPv4(s.ip) || !validIPv4(d.ip)) {
      this.log("ERRO", "IPv4 inválido na origem ou no destino.");
      opt.done?.(false);
      return;
    }
    const path = findPath(
      this.state.devices,
      this.state.links,
      source,
      destination,
    );
    const servicePort =
      opt.port ??
      (opt.protocol === "DNS"
        ? 53
        : opt.protocol === "HTTP"
          ? 80
          : opt.protocol === "HTTPS"
            ? 443
            : ["web", "home"].includes(this.state.scenario)
              ? 80
              : 5000);
    const response = source === "server" || source === "dns";
    // Preserve the same illustrative sequence value when retransmitting a unit.
    opt = { ...opt, sequence: opt.sequence ?? this.packetSerial * 100 + 1 };
    const p: NetworkPacket = {
      id: `P${String(++this.packetSerial).padStart(3, "0")}`,
      protocol: opt.protocol,
      label: opt.label,
      source,
      destination,
      sourceIP: s.ip,
      destinationIP: d.ip,
      sourceMAC: s.mac,
      destinationMAC: (
        path
          .slice(1)
          .map((id) => this.state.devices.find((n) => n.id === id)!)
          .find((n) => n.type === "router") ?? d
      ).mac,
      sourcePort: opt.protocol === "ICMP" ? 0 : response ? servicePort : 49152,
      destinationPort:
        opt.protocol === "ICMP" ? 0 : response ? 49152 : servicePort,
      payload: opt.payload ?? c.message,
      size: opt.size ?? (opt.data ? c.size : 64),
      status: "queued",
      path,
      history: [],
      headers: {
        TTL: "64",
        ...(["TCP", "HTTP", "HTTPS"].includes(opt.protocol)
          ? {
              Transporte: "TCP",
              Flags: opt.protocol === "TCP" ? opt.label : "ACK, PSH",
              "SEQ ilustrativo": String(opt.sequence),
            }
          : {}),
        ...(opt.protocol === "HTTP" ? { HTTP: opt.label } : {}),
      },
      from: source,
      to: source,
      createdAt: this.state.time,
      start: this.state.time,
      end: this.state.time,
      attempt: opt.attempt ?? 0,
    };
    this.state.packets.push(p);
    if (this.state.packets.length > 400) this.state.packets.shift();
    this.state.metrics.sent++;
    this.state.complete = false;
    this.log(
      "ENVIO",
      `${p.label}: ${s.name} → ${d.name}.`,
      "Clique no pacote para acompanhar seus cabeçalhos e sua trajetória.",
      p.id,
      s.id,
    );
    if (
      !path.length ||
      !c.cable ||
      (!c.destination && destination === "server") ||
      (!c.dns && destination === "dns")
    ) {
      this.schedule(100, () =>
        this.fail(
          p,
          opt,
          !c.dns && destination === "dns"
            ? "DNS indisponível: consulta sem resposta."
            : "Sem caminho ativo até o destino.",
        ),
      );
      return;
    }
    if (path.slice(1, -1).includes("router") && (!c.gateway || !c.route)) {
      this.schedule(100, () =>
        this.fail(
          p,
          opt,
          !c.gateway
            ? "Gateway padrão ausente: rede remota inacessível."
            : "Roteador sem rota para a rede de destino.",
        ),
      );
      return;
    }
    const hop = (i: number) => {
      if (i >= path.length - 1) {
        p.status = "delivered";
        p.history.push(`Entregue em ${this.state.time.toFixed(1)} ms`);
        this.state.metrics.delivered++;
        this.state.metrics.bytes += p.size;
        this.state.metrics.totalLatency += this.state.time - p.createdAt;
        this.log(
          "ENTREGA",
          `${p.label} recebido por ${d.name}.`,
          opt.protocol === "UDP"
            ? "UDP não confirma nem retransmite automaticamente no transporte."
            : "A unidade chegou ao destino da simulação.",
          p.id,
          d.id,
        );
        opt.done?.(true);
        return;
      }
      const from = this.state.devices.find((d) => d.id === path[i])!,
        to = this.state.devices.find((d) => d.id === path[i + 1])!;
      const link = this.state.links.find(
        (l) =>
          (l.from === from.id && l.to === to.id) ||
          (l.to === from.id && l.from === to.id),
      );
      if (!link?.active || !from.active || !to.active || !c.cable) {
        this.fail(p, opt, "Enlace ou equipamento desligado durante a viagem.");
        return;
      }
      if (from.type === "firewall") {
        const rule = this.state.rules.find(
          (r) =>
            (r.protocol === "any" ||
              r.protocol === p.protocol ||
              (r.protocol === "TCP" &&
                ["HTTP", "HTTPS"].includes(p.protocol))) &&
            (r.port === 0 || r.port === p.destinationPort) &&
            (r.source === "*" || r.source === p.sourceIP) &&
            (r.destination === "*" || r.destination === p.destinationIP),
        );
        if (!rule || rule.action === "deny") {
          this.fail(
            p,
            opt,
            `Firewall bloqueou ${p.protocol}/${p.destinationPort}: ${rule ? `regra ${rule.id}` : "política padrão"}.`,
            true,
          );
          return;
        }
        this.log(
          "FIREWALL",
          `Permitido pela regra ${rule.id}.`,
          "Protocolo, porta, origem e destino conferidos.",
          p.id,
          from.id,
        );
      }
      if (from.type === "router") {
        const route = lookupRoute(from, d.ip);
        if (!c.route || !route) {
          this.fail(p, opt, "Roteador sem rota correspondente ao destino.");
          return;
        }
        p.headers.Rota = route.network;
        p.headers.Interface = route.interface;
        p.sourceMAC = from.mac;
        p.destinationMAC = to.mac;
        p.headers.TTL = String(Number(p.headers.TTL) - 1);
        this.log(
          "ROTEAMENTO",
          `Rota para ${d.ip}: saída ${to.name}.`,
          "O IP de destino permanece; o quadro usa novos endereços MAC no próximo enlace.",
          p.id,
          from.id,
        );
      }
      if (from.type === "switch" || from.type === "hub") {
        const ingress = path[i - 1] ?? source;
        const learned = from.macTable[p.destinationMAC];
        if (from.type === "switch") {
          from.macTable[p.sourceMAC] = ingress;
          this.log(
            "MAC",
            `Switch aprendeu ${p.sourceMAC} na porta ${ingress}.`,
            learned
              ? `Unicast conhecido: saída ${learned}.`
              : "Destino desconhecido: flooding em portas elegíveis, exceto a de entrada.",
            p.id,
            from.id,
          );
        }
        if (from.type === "hub" || !learned) {
          const branches = this.state.links
            .filter((l) => l.active && (l.from === from.id || l.to === from.id))
            .map((l) => (l.from === from.id ? l.to : l.from))
            .filter((id) => id !== ingress && id !== to.id);
          for (const id of branches) {
            const copy: NetworkPacket = {
              ...p,
              id: `P${String(++this.packetSerial).padStart(3, "0")}`,
              label: from.type === "hub" ? "REPETIÇÃO" : "FLOOD",
              path: [from.id, id],
              history: [
                "Cópia de enlace; descartada se o MAC não é do destinatário.",
              ],
              from: from.id,
              to: id,
              start: this.state.time,
              end:
                this.state.time +
                link.latency +
                ((p.size * 8) / (link.bandwidth * 1e6)) * 1000,
              status: "transit",
            };
            this.state.packets.push(copy);
            this.schedule(
              link.latency + ((p.size * 8) / (link.bandwidth * 1e6)) * 1000,
              () => {
                copy.status = "delivered";
                this.log(
                  "FLOOD",
                  `${id} recebe cópia de enlace; verifica MAC e descarta se não é seu.`,
                  from.type === "hub"
                    ? "Hub repete sinais sem aprender endereços."
                    : "Flooding de unicast desconhecido.",
                  copy.id,
                  id,
                );
              },
            );
          }
        }
      }
      const physicalLoss =
        c.medium === "wifi"
          ? Math.min(0.8, c.interference / 120 + c.distance / 2000)
          : c.medium === "copper" && c.distance > 100
            ? Math.min(0.8, (c.distance - 100) / 500)
            : 0;
      const serialize = ((p.size * 8) / (link.bandwidth * 1e6)) * 1000;
      const start = Math.max(this.state.time, link.busyUntil);
      link.busyUntil = start + serialize;
      const duration =
        start -
        this.state.time +
        serialize +
        link.latency +
        (this.state.scenario === "media"
          ? c.distance / (c.medium === "wifi" ? 300000 : 200000)
          : 0);
      p.from = from.id;
      p.to = to.id;
      p.start = this.state.time;
      p.end = this.state.time + Math.max(duration, 1);
      p.status = "transit";
      p.history.push(`${from.name} → ${to.name} · ${duration.toFixed(2)} ms`);
      this.schedule(Math.max(duration, 1), () => {
        if (!link.active || !from.active || !to.active || !c.cable) {
          this.fail(
            p,
            opt,
            "O enlace foi interrompido com o pacote em trânsito.",
          );
          return;
        }
        const forced =
          (this.dropNext && opt.data) ||
          (this.dropResponse && p.label.startsWith("HTTP 200"));
        if (forced) {
          if (this.dropNext) this.dropNext = false;
          else this.dropResponse = false;
        }
        if (
          forced ||
          (opt.data && this.random() < Math.max(link.loss / 100, physicalLoss))
        ) {
          this.fail(
            p,
            opt,
            `${p.label} perdido no enlace ${from.id} → ${to.id}.`,
          );
          return;
        }
        if (c.ddos && opt.data && start - p.start > 2000) {
          this.fail(
            p,
            opt,
            "Fila saturada: pacote descartado no modelo DDoS local.",
          );
          return;
        }
        hop(i + 1);
      });
    };
    this.schedule(0, () => hop(0));
  }
  private ack(source: string, destination: string, done: () => void) {
    this.send({
      source,
      destination,
      protocol: "TCP",
      label: "ACK dados",
      done: (ok) => {
        if (ok) {
          this.state.metrics.acknowledged++;
          done();
        }
      },
    });
  }
  private handshake(done: () => void) {
    this.send({
      protocol: "TCP",
      label: "SYN",
      reliable: true,
      done: (ok) => {
        if (!ok) return;
        this.send({
          source: "server",
          destination: "pc",
          protocol: "TCP",
          label: "SYN-ACK",
          reliable: true,
          done: (ok) => {
            if (!ok) return;
            this.send({
              protocol: "TCP",
              label: "ACK",
              reliable: true,
              done: (ok) => {
                if (ok) {
                  this.log(
                    "CONEXÃO",
                    "Conexão TCP estabelecida.",
                    "SYN → SYN-ACK → ACK sincroniza os números de sequência.",
                  );
                  done();
                }
              },
            });
          },
        });
      },
    });
  }
  private web() {
    this.log(
      "DNS",
      `O navegador precisa localizar ${this.state.config.domain}.`,
      "O nome precisa ser traduzido para um endereço IP.",
    );
    if (
      !["www.exemplo.com.br", "exemplo.com.br"].includes(
        this.state.config.domain,
      )
    ) {
      this.schedule(500, () =>
        this.log("DNS", "NXDOMAIN: nome não cadastrado nesta rede fictícia."),
      );
      return;
    }
    this.send({
      protocol: "DNS",
      label: "DNS consulta",
      destination: "dns",
      done: (ok) => {
        if (!ok) return;
        this.send({
          source: "dns",
          destination: "pc",
          protocol: "DNS",
          label: "DNS resposta",
          payload: "203.0.113.10",
          done: (ok) => {
            if (!ok) return;
            this.handshake(() =>
              this.send({
                protocol: "HTTP",
                label: "HTTP GET",
                port: 80,
                reliable: true,
                data: true,
                done: (ok) => {
                  if (!ok) return;
                  const chunk = (i: number) => {
                    if (i > 3) {
                      this.state.pageReady = true;
                      this.log(
                        "PÁGINA PRONTA",
                        "A página chegou. Uma rede inteira tornou isso possível.",
                        "DNS resolveu o nome; TCP transportou e confirmou os três fragmentos; HTTP entregou o conteúdo.",
                      );
                      return;
                    }
                    this.send({
                      source: "server",
                      destination: "pc",
                      protocol: "HTTP",
                      label: `HTTP 200 · ${i}/3`,
                      port: 80,
                      reliable: true,
                      data: true,
                      payload: `Fragmento ${i}: <article>Olá, universo!</article>`,
                      done: (ok) => {
                        if (ok) this.ack("pc", "server", () => chunk(i + 1));
                      },
                    });
                  };
                  chunk(1);
                },
              }),
            );
          },
        });
      },
    });
  }
  private osi() {
    const names = [
      "Bits",
      "Quadro Ethernet",
      "Pacote IP",
      "Segmento TCP",
      "Dados · sessão",
      "Dados · apresentação",
      "Dados · aplicação",
    ];
    this.log(
      "ENCAPSULAMENTO",
      "A mensagem começa na aplicação.",
      "As camadas são responsabilidades; nem todas acrescentam cabeçalhos próprios.",
    );
    for (let i = 7; i >= 1; i--)
      this.schedule((7 - i) * 450, () => {
        this.state.osiLayer = i;
        this.state.osiDirection = "down";
        this.log(
          "ENCAPSULAMENTO",
          `${i}. ${names[i - 1]}`,
          "Aplicação → transporte (TCP) → internet (IP) → enlace (Ethernet) → sinais físicos.",
        );
      });
    this.schedule(3150, () =>
      this.send({
        protocol: "TCP",
        label: "MENSAGEM",
        data: true,
        reliable: true,
        done: (ok) => {
          if (ok)
            for (let i = 1; i <= 7; i++)
              this.schedule(i * 450, () => {
                this.state.osiLayer = i;
                this.state.osiDirection = "up";
                this.log(
                  "DESENCAPSULAMENTO",
                  `${i}. ${names[i - 1]}`,
                  i === 7
                    ? `Mensagem entregue: ${this.state.config.message}`
                    : "No destino, cada camada interpreta a informação pertinente.",
                );
              });
        },
      }),
    );
  }
  private launch() {
    const c = this.state.config;
    switch (this.state.scenario) {
      case "osi":
        this.osi();
        break;
      case "web":
      case "home":
      case "glossary":
        this.web();
        break;
      case "tcp":
        this.send({
          protocol: "UDP",
          label: "UDP dados",
          data: true,
          payload: c.message,
        });
        this.handshake(() =>
          this.send({
            protocol: "TCP",
            label: "TCP dados",
            data: true,
            reliable: true,
            done: (ok) => {
              if (ok)
                this.ack("server", "pc", () =>
                  this.log("TCP", "Dados TCP confirmados."),
                );
            },
          }),
        );
        break;
      case "routing":
        this.send({
          destination: "peer",
          protocol: "ICMP",
          label: "LAN: primeiro quadro",
          data: true,
          done: (ok) => {
            if (ok)
              this.send({
                source: "peer",
                destination: "pc",
                protocol: "ICMP",
                label: "LAN: resposta",
                done: () =>
                  this.send({
                    protocol: "ICMP",
                    label: "OUTRA SUB-REDE",
                    data: true,
                  }),
              });
          },
        });
        break;
      case "topology":
      case "lab":
        this.send({
          source: c.source,
          destination: c.target,
          protocol: c.protocol,
          label: "MENSAGEM",
          data: true,
        });
        break;
      case "media":
        this.send({
          protocol: "UDP",
          label:
            c.medium === "wifi"
              ? "RÁDIO"
              : c.medium === "fiber"
                ? "PULSO ÓPTICO"
                : "SINAL ELÉTRICO",
          data: true,
        });
        break;
      case "diagnostics":
        this.command("ping 203.0.113.10");
        break;
      case "security":
        if (c.ddos) {
          for (let i = 1; i <= 3; i++) {
            const id = `source${i}`;
            if (!this.state.devices.some((d) => d.id === id)) {
              this.addDevice(
                device(
                  id,
                  `FONTE FICTÍCIA ${i}`,
                  "pc",
                  [-7, 0, (i - 2) * 3],
                  `192.168.10.${100 + i}`,
                ),
              );
              this.addLink(id, "switch");
            }
          }
          for (let i = 0; i < 60; i++)
            this.schedule(i * 3, () =>
              this.send({
                source: ["pc", "source1", "source2", "source3"][i % 4],
                protocol: "TCP",
                label: `CARGA LOCAL ${i + 1}`,
                port: 443,
                data: true,
                size: 1000000,
              }),
            );
        } else
          this.send({
            protocol: c.encrypted ? "HTTPS" : "HTTP",
            label: c.encrypted ? "TLS · cifrado" : "HTTP · visível",
            port: c.port,
            data: true,
            payload: c.encrypted
              ? "[conteúdo cifrado no modelo]"
              : "mensagem=Olá, rede!",
            done: (ok) => {
              if (ok)
                this.log(
                  "INTERCEPTAÇÃO",
                  c.encrypted
                    ? "Observador vê metadados, mas não lê o conteúdo protegido por TLS."
                    : "Observador consegue ler o conteúdo HTTP em texto claro.",
                  c.encrypted
                    ? "Pressupõe certificado validado e endpoints íntegros. HTTPS não oculta IP, tamanho ou tempo do tráfego."
                    : "Demonstração fictícia: nenhum dado real é interceptado.",
                );
            },
          });
        break;
      case "performance":
        for (let i = 0; i < c.simultaneous; i++)
          this.send({ protocol: "UDP", label: `DADOS ${i + 1}`, data: true });
        break;
      case "trends":
        if (c.trend === "sdn") {
          this.send({
            source: "controller",
            destination: "switch",
            protocol: "SDN",
            label: c.sdnAllowed ? "FLOW · permitir" : "FLOW · bloquear",
            done: (ok) => {
              if (ok && c.sdnAllowed)
                this.send({
                  protocol: "UDP",
                  label: "PLANO DE DADOS",
                  data: true,
                });
              else
                this.log(
                  "SDN",
                  "Política do controlador bloqueou o fluxo.",
                  "Plano de controle programa as decisões; plano de dados encaminha.",
                );
            },
          });
        } else if (c.trend === "iot") {
          ["pc", "presence", "camera", "lamp"].forEach((id, i) =>
            this.schedule(i * 300, () =>
              this.send({
                source: id,
                protocol: "UDP",
                label: ["24 °C", "PRESENÇA", "FRAME", "ESTADO: ON"][i],
                data: true,
              }),
            ),
          );
        } else
          this.send({
            protocol: "HTTPS",
            label: c.cloud,
            port: 443,
            data: true,
            done: () =>
              this.log(
                "NUVEM",
                `${c.cloud}: serviço acessado na nuvem fictícia.`,
                c.cloud === "IaaS"
                  ? "Usuário: SO, aplicações e dados. Provedor: infraestrutura."
                  : c.cloud === "PaaS"
                    ? "Usuário: aplicações e dados. Provedor: plataforma e infraestrutura."
                    : "Usuário: configuração e uso dos dados. Provedor: aplicação, plataforma e infraestrutura.",
              ),
          });
        break;
    }
  }
  command(input: string) {
    const [cmd, ...args] = input.trim().toLowerCase().split(/\s+/);
    const target = args[0];
    this.state.terminal.push(`netverse> ${input}`);
    const out = (s: string) => {
      this.state.terminal.push(s);
      if (this.state.terminal.length > 100) this.state.terminal.splice(0, 20);
    };
    const c = this.state.config;
    if (cmd === "help") {
      out(
        "ping <IP/nome> | tracert <IP/nome> | ipconfig | nslookup <nome> | clear",
      );
      return;
    }
    if (cmd === "clear") {
      this.state.terminal = [];
      return;
    }
    if (cmd === "ipconfig") {
      out(
        `IPv4: ${this.state.devices.find((d) => d.id === "pc")?.ip}\nMáscara: 255.255.255.0\nGateway: ${c.gateway ? "192.168.10.1" : "não configurado"}\nCabo: ${c.cable ? "conectado" : "desconectado"}`,
      );
      return;
    }
    if (!["ping", "tracert", "nslookup"].includes(cmd)) {
      out(`Comando desconhecido: ${cmd}. Digite help.`);
      return;
    }
    if (!target) {
      out(`Uso: ${cmd} <destino>`);
      return;
    }
    this.started = true;
    this.state.complete = false;
    this.state.running = true;
    if (cmd === "nslookup") {
      this.send({
        protocol: "DNS",
        label: "DNS consulta",
        destination: "dns",
        done: (ok) => {
          if (!ok) {
            out("Tempo esgotado: servidor DNS indisponível.");
            return;
          }
          this.send({
            source: "dns",
            destination: "pc",
            protocol: "DNS",
            label: "DNS resposta",
            done: (ok) =>
              out(
                ok
                  ? ["www.exemplo.com.br", "exemplo.com.br"].includes(target)
                    ? "Servidor: 192.168.10.53\nNome: www.exemplo.com.br\nAddress: 203.0.113.10"
                    : "NXDOMAIN: nome não cadastrado."
                  : "Resposta DNS perdida.",
              ),
          });
        },
      });
      return;
    }
    const destination =
      this.state.devices.find((d) => d.ip === target)?.id ??
      (["www.exemplo.com.br", "exemplo.com.br"].includes(target)
        ? "server"
        : undefined);
    if (!destination) {
      out("Destino desconhecido na rede virtual.");
      this.finishIfIdle();
      return;
    }
    if (target.includes("exemplo") && !c.dns) {
      out("Falha na resolução de nome: DNS indisponível.");
      this.finishIfIdle();
      return;
    }
    if (cmd === "tracert") {
      const path = findPath(
        this.state.devices,
        this.state.links,
        "pc",
        destination,
      );
      const hops = path.filter(
        (id) =>
          this.state.devices.find((d) => d.id === id)?.type === "router" ||
          id === destination,
      );
      out(
        `Rastreando ${target}; switches de camada 2 não aparecem como saltos IP.`,
      );
      hops.forEach((id, i) => {
        const started = this.state.time;
        this.send({
          destination: id,
          protocol: "ICMP",
          label: `TTL ${i + 1}`,
          done: (ok) => {
            if (!ok) {
              out(`${i + 1} * * * tempo esgotado`);
              return;
            }
            this.send({
              source: id,
              destination: "pc",
              protocol: "ICMP",
              label: id === destination ? "ECHO REPLY" : "TIME EXCEEDED",
              done: (ok) =>
                out(
                  `${i + 1} ${this.state.devices.find((d) => d.id === id)!.ip} ${ok ? (this.state.time - started).toFixed(1) + " ms" : "*"}`,
                ),
            });
          },
        });
      });
      if (!hops.length) {
        out("Nenhum caminho disponível.");
        this.finishIfIdle();
      }
      return;
    }
    let received = 0;
    for (let i = 0; i < 4; i++)
      this.schedule(i * 1000, () => {
        const begin = this.state.time;
        this.send({
          destination,
          protocol: "ICMP",
          label: "ECHO REQUEST",
          data: true,
          size: 32,
          done: (ok) => {
            if (!ok) {
              out("Tempo esgotado para o pedido.");
              return;
            }
            this.send({
              source: destination,
              destination: "pc",
              protocol: "ICMP",
              label: "ECHO REPLY",
              size: 32,
              done: (ok) => {
                if (ok) {
                  received++;
                  out(
                    `Resposta de ${target}: bytes=32 tempo=${(this.state.time - begin).toFixed(1)} ms; recebidos=${received}/4`,
                  );
                } else out("Resposta perdida.");
              },
            });
          },
        });
      });
  }
  exportLab() {
    if (
      this.state.devices.some((d) => !validIPv4(d.ip)) ||
      new Set(this.state.devices.map((d) => d.ip)).size !==
        this.state.devices.length
    )
      throw Error("Configure endereços IPv4 válidos e únicos antes de salvar.");
    return JSON.stringify(
      {
        version: 1,
        devices: this.state.devices,
        links: this.state.links,
        config: this.state.config,
      },
      null,
      2,
    );
  }
  importLab(raw: string) {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") throw Error("JSON inválido");
    const v = data as {
      version: number;
      devices: NetworkDevice[];
      links: NetworkLink[];
      config: Config;
    };
    if (
      v.version !== 1 ||
      !Array.isArray(v.devices) ||
      !Array.isArray(v.links) ||
      v.devices.length > 30 ||
      v.links.length > 100
    )
      throw Error("Formato ou limites inválidos");
    if (
      v.devices.some((d) => !d || typeof d.id !== "string") ||
      v.links.some((l) => !l || typeof l.id !== "string")
    )
      throw Error("Identificador inválido");
    const ids = new Set(v.devices.map((d) => d.id));
    if (ids.size !== v.devices.length || !ids.has("pc") || !ids.has("server"))
      throw Error("IDs únicos, pc e server são obrigatórios");
    if (
      new Set(v.devices.map((d) => d.ip)).size !== v.devices.length ||
      new Set(v.devices.map((d) => d.mac)).size !== v.devices.length
    )
      throw Error("Endereços IP e MAC devem ser únicos.");
    for (const d of v.devices) {
      if (
        typeof d.name !== "string" ||
        ![
          "pc",
          "switch",
          "router",
          "server",
          "firewall",
          "hub",
          "sensor",
          "controller",
        ].includes(d.type) ||
        !Array.isArray(d.position) ||
        d.position.length !== 3 ||
        !d.position.every((n) => Number.isFinite(n) && Math.abs(n) <= 20) ||
        typeof d.ip !== "string" ||
        !validIPv4(d.ip) ||
        typeof d.mac !== "string" ||
        !/^[0-9a-f]{2}(:[0-9a-f]{2}){5}$/i.test(d.mac) ||
        typeof d.active !== "boolean" ||
        typeof d.gateway !== "string" ||
        !Array.isArray(d.routes) ||
        !d.routes.every(
          (r) =>
            typeof r.network === "string" &&
            typeof r.nextHop === "string" &&
            typeof r.interface === "string",
        ) ||
        !d.macTable ||
        typeof d.macTable !== "object" ||
        !Object.values(d.macTable).every((p) => typeof p === "string")
      )
        throw Error("Equipamento inválido");
    }
    for (const l of v.links)
      if (
        !ids.has(l.from) ||
        !ids.has(l.to) ||
        !Number.isFinite(l.bandwidth) ||
        l.bandwidth <= 0 ||
        !Number.isFinite(l.latency) ||
        l.latency < 0 ||
        l.latency > 10000 ||
        l.bandwidth > 10000 ||
        !Number.isFinite(l.loss) ||
        l.loss < 0 ||
        l.loss > 100 ||
        !["fiber", "copper", "wifi"].includes(l.medium) ||
        typeof l.active !== "boolean" ||
        l.from === l.to
      )
        throw Error("Enlace inválido");
    if (new Set(v.links.map((l) => l.id)).size !== v.links.length)
      throw Error("Enlaces duplicados");
    const config = { ...defaults, ...v.config };
    for (const [key, value] of Object.entries(defaults)) {
      const actual = config[key as keyof Config];
      if (
        typeof actual !== typeof value ||
        (typeof actual === "number" && !Number.isFinite(actual))
      )
        throw Error("Configuração inválida");
    }
    if (
      config.bandwidth <= 0 ||
      config.bandwidth > 10000 ||
      config.latency < 0 ||
      config.latency > 10000 ||
      config.loss < 0 ||
      config.loss > 100 ||
      config.size < 1 ||
      config.size > 1e7 ||
      config.simultaneous < 1 ||
      config.simultaneous > 100 ||
      config.count < 2 ||
      config.count > 30 ||
      config.distance < 0 ||
      config.distance > 100000 ||
      config.interference < 0 ||
      config.interference > 100 ||
      config.port < 0 ||
      config.port > 65535 ||
      config.message.length > 1000 ||
      !["star", "bus", "ring", "mesh"].includes(config.topology) ||
      !["copper", "fiber", "wifi"].includes(config.medium) ||
      !["switch", "hub"].includes(config.central) ||
      !["cloud", "iot", "sdn"].includes(config.trend) ||
      !["IaaS", "PaaS", "SaaS"].includes(config.cloud) ||
      !["TCP", "UDP", "HTTP", "HTTPS", "ICMP", "DNS", "ARP", "SDN"].includes(
        config.protocol,
      ) ||
      !ids.has(config.source) ||
      !ids.has(config.target)
    )
      throw Error("Configuração fora dos limites");
    this.reset("lab", config);
    this.state.devices = v.devices;
    this.state.links = v.links.map((l) => ({ ...l, busyUntil: 0 }));
    this.log("LABORATÓRIO", "Topologia local carregada e validada.");
  }
  addDevice(d: NetworkDevice) {
    if (this.state.devices.length >= 30)
      throw Error("Limite de 30 equipamentos");
    this.state.devices.push(d);
    this.log("LABORATÓRIO", `${d.name} adicionado.`);
  }
  addLink(from: string, to: string) {
    if (
      from === to ||
      !this.state.devices.some((d) => d.id === from) ||
      !this.state.devices.some((d) => d.id === to) ||
      this.state.links.length >= 100 ||
      this.state.links.some(
        (l) => [l.from, l.to].includes(from) && [l.from, l.to].includes(to),
      )
    )
      return;
    this.state.links.push({
      id: `custom-${this.serial++}`,
      from,
      to,
      medium: this.state.config.medium,
      bandwidth: this.state.config.bandwidth,
      latency: this.state.config.latency,
      loss: 0,
      active: true,
      busyUntil: 0,
    });
    this.log("LABORATÓRIO", `${from} conectado a ${to}.`);
  }
}
