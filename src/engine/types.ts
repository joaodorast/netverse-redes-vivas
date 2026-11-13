export type DeviceType =
  | "pc"
  | "switch"
  | "router"
  | "server"
  | "firewall"
  | "hub"
  | "sensor"
  | "controller";
export type Protocol =
  "DNS" | "TCP" | "UDP" | "HTTP" | "HTTPS" | "ICMP" | "ARP" | "SDN";
export type Scenario =
  | "home"
  | "osi"
  | "tcp"
  | "web"
  | "routing"
  | "topology"
  | "media"
  | "diagnostics"
  | "security"
  | "performance"
  | "trends"
  | "glossary"
  | "lab";
export interface NetworkDevice {
  id: string;
  name: string;
  type: DeviceType;
  ip: string;
  mac: string;
  gateway: string;
  active: boolean;
  position: [number, number, number];
  macTable: Record<string, string>;
  routes: { network: string; nextHop: string; interface: string }[];
}
export interface NetworkLink {
  id: string;
  from: string;
  to: string;
  medium: "copper" | "fiber" | "wifi";
  bandwidth: number;
  latency: number;
  loss: number;
  active: boolean;
  busyUntil: number;
}
export interface NetworkPacket {
  id: string;
  protocol: Protocol;
  label: string;
  source: string;
  destination: string;
  sourceIP: string;
  destinationIP: string;
  sourceMAC: string;
  destinationMAC: string;
  sourcePort: number;
  destinationPort: number;
  payload: string;
  size: number;
  status: "queued" | "transit" | "delivered" | "lost" | "blocked";
  path: string[];
  history: string[];
  headers: Record<string, string>;
  from: string;
  to: string;
  createdAt: number;
  start: number;
  end: number;
  attempt: number;
}
export interface SimulationEvent {
  id: number;
  time: number;
  type: string;
  message: string;
  detail: string;
  packetId?: string;
  deviceId?: string;
}
export interface FirewallRule {
  id: string;
  action: "allow" | "deny";
  protocol: "any" | Protocol;
  port: number;
  source: string;
  destination: string;
}
export interface Config {
  latency: number;
  bandwidth: number;
  loss: number;
  size: number;
  simultaneous: number;
  cable: boolean;
  dns: boolean;
  gateway: boolean;
  route: boolean;
  destination: boolean;
  topology: "star" | "bus" | "ring" | "mesh";
  count: number;
  central: "switch" | "hub";
  medium: "copper" | "fiber" | "wifi";
  distance: number;
  interference: number;
  message: string;
  domain: string;
  port: number;
  protocol: Protocol;
  source: string;
  target: string;
  ddos: boolean;
  encrypted: boolean;
  trend: "cloud" | "iot" | "sdn";
  cloud: "IaaS" | "PaaS" | "SaaS";
  sdnAllowed: boolean;
  seed: number;
}
export interface Metrics {
  sent: number;
  delivered: number;
  lost: number;
  blocked: number;
  retransmitted: number;
  acknowledged: number;
  bytes: number;
  totalLatency: number;
}
export interface Sample {
  time: number;
  throughput: number;
  delivered: number;
  lost: number;
  latency: number;
  utilization: number;
}
export interface SimulationState {
  scenario: Scenario;
  time: number;
  running: boolean;
  speed: number;
  devices: NetworkDevice[];
  links: NetworkLink[];
  packets: NetworkPacket[];
  events: SimulationEvent[];
  metrics: Metrics;
  samples: Sample[];
  explanation: string;
  detail: string;
  phase: string;
  osiLayer: number;
  osiDirection: "down" | "up";
  pageReady: boolean;
  terminal: string[];
  rules: FirewallRule[];
  config: Config;
  complete: boolean;
}
