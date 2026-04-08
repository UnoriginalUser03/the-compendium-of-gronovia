import * as Lucide from "lucide-react";

export function getIcon(name?: string) {
  if (!name) return null;
  return (Lucide as any)[name] ?? null;
}

export function SidebarIcon({name, size = 16, className}: {name?: string; size?: number; className?: string}) {
  const Icon = getIcon(name);
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}
