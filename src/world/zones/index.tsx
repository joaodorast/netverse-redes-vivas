import { lazy, Suspense } from "react";
const loaders = {
  home: () => import("./home"),
  osi: () => import("./osi"),
  tcp: () => import("./tcp"),
  web: () => import("./web"),
  routing: () => import("./routing"),
  topology: () => import("./topology"),
  media: () => import("./media"),
  diagnostics: () => import("./diagnostics"),
  security: () => import("./security"),
  performance: () => import("./performance"),
  trends: () => import("./trends"),
  glossary: () => import("./glossary"),
};
const components = Object.fromEntries(
  Object.entries(loaders).map(([id, load]) => [id, lazy(load)]),
);
export function preloadZone(id: string) {
  const load = loaders[id as keyof typeof loaders];
  if (load) void load();
}
export default function Zone({ id }: { id: string }) {
  const Component = components[id] ?? components.home;
  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
}
