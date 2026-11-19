export {};
self.onmessage = (
  event: MessageEvent<{
    nodes: { id: string; position: [number, number, number] }[];
    links: { from: string; to: string }[];
  }>,
) => {
  const { nodes, links } = event.data;
  const positions = nodes.map((n, i) => ({
    id: n.id,
    x: Math.cos(i * 2.399) * Math.sqrt(i + 1),
    z: Math.sin(i * 2.399) * Math.sqrt(i + 1),
  }));
  for (let step = 0; step < 160; step++) {
    const force = positions.map(() => ({ x: 0, z: 0 }));
    for (let a = 0; a < positions.length; a++)
      for (let b = a + 1; b < positions.length; b++) {
        const dx = positions[a].x - positions[b].x,
          dz = positions[a].z - positions[b].z,
          d2 = Math.max(0.2, dx * dx + dz * dz),
          f = 1.8 / d2;
        force[a].x += dx * f;
        force[a].z += dz * f;
        force[b].x -= dx * f;
        force[b].z -= dz * f;
      }
    for (const l of links) {
      const a = positions.findIndex((p) => p.id === l.from),
        b = positions.findIndex((p) => p.id === l.to);
      if (a < 0 || b < 0) continue;
      const dx = positions[b].x - positions[a].x,
        dz = positions[b].z - positions[a].z;
      force[a].x += dx * 0.13;
      force[a].z += dz * 0.13;
      force[b].x -= dx * 0.13;
      force[b].z -= dz * 0.13;
    }
    positions.forEach((p, i) => {
      p.x = Math.max(
        -8,
        Math.min(
          8,
          p.x + Math.max(-0.3, Math.min(0.3, force[i].x - p.x * 0.03)),
        ),
      );
      p.z = Math.max(
        -6,
        Math.min(
          6,
          p.z + Math.max(-0.3, Math.min(0.3, force[i].z - p.z * 0.03)),
        ),
      );
    });
  }
  self.postMessage(
    positions.map((p) => ({ id: p.id, position: [p.x, 0, p.z] })),
  );
};
