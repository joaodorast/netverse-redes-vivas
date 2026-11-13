import type { Config, NetworkDevice, NetworkLink, Scenario } from "./types";
export const defaults: Config = {
  latency: 80,
  bandwidth: 10,
  loss: 0,
  size: 1500,
  simultaneous: 8,
  cable: true,
  dns: true,
  gateway: true,
  route: true,
  destination: true,
  topology: "star",
  count: 5,
  central: "switch",
  medium: "fiber",
  distance: 50,
  interference: 0,
  message: "Olá, mundo!",
  domain: "www.exemplo.com.br",
  port: 443,
  protocol: "TCP",
  source: "pc",
  target: "server",
  ddos: false,
  encrypted: true,
  trend: "iot",
  cloud: "IaaS",
  sdnAllowed: true,
  seed: 42,
};
export function device(
  id: string,
  name: string,
  type: NetworkDevice["type"],
  position: NetworkDevice["position"],
  ip: string,
): NetworkDevice {
  return {
    id,
    name,
    type,
    position,
    ip,
    mac: `02:00:00:${(Array.from(id).reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0).toString(16).padStart(8, "0").slice(-6).match(/../g)!.join(":")}`,
    gateway: "192.168.10.1",
    active: true,
    macTable: {},
    routes:
      type === "router"
        ? [
            { network: "192.168.10.0/24", nextHop: "direto", interface: "LAN" },
            {
              network: "192.168.20.0/24",
              nextHop: "direto",
              interface: "LAN2",
            },
            { network: "203.0.113.0/24", nextHop: "direto", interface: "WAN" },
          ]
        : [],
  };
}
export function network(scenario: Scenario, c: Config) {
  let devices: NetworkDevice[] = [
    device("pc", "SEU COMPUTADOR", "pc", [-5, 0, 2], "192.168.10.2"),
    device("switch", "SWITCH LOCAL", "switch", [-2, 0, 0], "192.168.10.254"),
    device("router", "GATEWAY", "router", [1, 0, 0], "192.168.10.1"),
    device("server", "SERVIDOR WEB", "server", [5, 0, 0], "203.0.113.10"),
    device("dns", "SERVIDOR DNS", "server", [1, 0, -4], "192.168.10.53"),
    device("peer", "COMPUTADOR 02", "pc", [-5, 0, -2], "192.168.10.3"),
  ];
  let pairs = [
    ["pc", "switch"],
    ["peer", "switch"],
    ["switch", "router"],
    ["switch", "dns"],
    ["router", "server"],
  ];
  if (scenario === "security") {
    devices.push(
      device("firewall", "FIREWALL", "firewall", [3, 0, 0], "203.0.113.1"),
    );
    pairs = pairs.filter((p) => p[0] !== "router" || p[1] !== "server");
    pairs.push(["router", "firewall"], ["firewall", "server"]);
    devices.find((d) => d.id === "server")!.position = [6, 0, 0];
  }
  if (scenario === "routing") {
    devices.find((d) => d.id === "server")!.ip = "192.168.20.2";
    devices.find((d) => d.id === "server")!.name = "REDE 192.168.20.0/24";
  }
  if (scenario === "topology") {
    devices = Array.from({ length: c.count }, (_, i) =>
      device(
        i === 0 ? "pc" : i === c.count - 1 ? "server" : `node${i}`,
        `PC ${String(i + 1).padStart(2, "0")}`,
        "pc",
        [
          Math.cos((i / c.count) * Math.PI * 2) * 4.5,
          0,
          Math.sin((i / c.count) * Math.PI * 2) * 3.4,
        ],
        `192.168.10.${i + 2}`,
      ),
    );
    pairs = [];
    if (c.topology === "star" || c.topology === "bus") {
      devices.push(
        device(
          "center",
          c.topology === "bus" ? "MEIO COMPARTILHADO" : c.central.toUpperCase(),
          c.topology === "bus" ? "hub" : c.central,
          [0, 0, 0],
          "192.168.10.254",
        ),
      );
      pairs = devices
        .filter((d) => d.id !== "center")
        .map((d) => [d.id, "center"]);
      if (c.topology === "bus")
        devices.forEach((d, i) => {
          if (d.id !== "center")
            d.position = [(i - (c.count - 1) / 2) * 2, 0, i % 2 === 0 ? 2 : -2];
        });
    } else {
      for (let i = 0; i < c.count; i++)
        pairs.push([devices[i].id, devices[(i + 1) % c.count].id]);
      if (c.topology === "mesh")
        for (let i = 0; i < c.count; i++)
          for (let j = i + 2; j < c.count; j++)
            if (!(i === 0 && j === c.count - 1))
              pairs.push([devices[i].id, devices[j].id]);
    }
  }
  if (scenario === "trends") {
    devices = [
      device("pc", "TEMPERATURA", "sensor", [-4, 0, 3], "192.168.10.2"),
      device("presence", "PRESENÇA", "sensor", [-5, 0, 0], "192.168.10.3"),
      device("camera", "CÂMERA", "sensor", [-4, 0, -3], "192.168.10.4"),
      device("lamp", "LÂMPADA", "sensor", [0, 0, 3], "192.168.10.5"),
      device("switch", "PLANO DE DADOS", "switch", [0, 0, 0], "192.168.10.254"),
      device(
        "controller",
        "CONTROLADOR SDN",
        "controller",
        [0, 0, -3],
        "192.168.10.100",
      ),
      device("server", "NUVEM", "server", [5, 0, 0], "203.0.113.10"),
    ];
    pairs = [
      ["pc", "switch"],
      ["presence", "switch"],
      ["camera", "switch"],
      ["lamp", "switch"],
      ["controller", "switch"],
      ["switch", "server"],
    ];
  }
  const links: NetworkLink[] = pairs.map(([from, to], i) => ({
    id: `link-${i}`,
    from,
    to,
    medium: c.medium,
    bandwidth:
      scenario === "performance" && to === "server"
        ? c.bandwidth / 4
        : c.bandwidth,
    latency: c.latency,
    loss: c.loss,
    active: true,
    busyUntil: 0,
  }));
  return { devices, links };
}
export function findPath(
  devices: NetworkDevice[],
  links: NetworkLink[],
  source: string,
  destination: string,
): string[] {
  const queue = [[source]],
    seen = new Set<string>();
  while (queue.length) {
    const path = queue.shift()!;
    const last = path[path.length - 1];
    if (seen.has(last) || !devices.find((d) => d.id === last)?.active) continue;
    seen.add(last);
    if (last === destination) return path;
    for (const l of links.filter(
      (l) => l.active && (l.from === last || l.to === last),
    )) {
      const next = l.from === last ? l.to : l.from;
      if (!seen.has(next)) queue.push([...path, next]);
    }
  }
  return [];
}
export function validIPv4(ip: string) {
  const parts = ip.split(".");
  return (
    parts.length === 4 &&
    parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255)
  );
}
export function matchesNetwork(ip: string, cidr: string) {
  const [address, bitsText] = cidr.split("/"),
    bits = Number(bitsText);
  if (
    !validIPv4(ip) ||
    !validIPv4(address) ||
    bitsText === undefined ||
    !Number.isInteger(bits) ||
    bits < 0 ||
    bits > 32
  )
    return false;
  const numeric = (s: string) =>
    s.split(".").reduce((n, v) => (n << 8) | Number(v), 0) >>> 0;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (numeric(ip) & mask) === (numeric(address) & mask);
}
export function lookupRoute(d: NetworkDevice, ip: string) {
  return d.routes
    .filter((r) => matchesNetwork(ip, r.network))
    .sort(
      (a, b) =>
        Number(b.network.split("/")[1]) - Number(a.network.split("/")[1]),
    )[0];
}
