"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Store } from "lucide-react";

const TABS = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/mapa", label: "Mapa", icon: MapPin },
  { href: "/comercio", label: "Comércio", icon: Store },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#FFFFFF",
        borderTop: "1px solid var(--cor-borda)",
        display: "flex",
        padding: "8px 0 10px",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const isAtivo = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-label={t.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              textDecoration: "none",
              color: isAtivo ? "var(--cor-laranja)" : "var(--cor-texto-fraco)",
              padding: "6px 0",
              minHeight: 52,
            }}
          >
            <Icon size={22} strokeWidth={isAtivo ? 2.5 : 2} />
            <span style={{ fontSize: 12, fontWeight: isAtivo ? 700 : 500 }}>{t.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
