"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Store, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const TABS = [
  { href: "/", label: "Feed", icon: Home, notificavel: true },
  { href: "/moradores", label: "Moradores", icon: Users },
  { href: "/comercio", label: "Comércio", icon: Store },
  { href: "/mapa", label: "Mapa", icon: MapPin },
];

export default function TabBar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [temNovidade, setTemNovidade] = useState(false);

  useEffect(() => {
    async function verificarNotificacoes() {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

      const { count } = await supabase
        .from("notificacoes")
        .select("*", { count: "exact", head: true })
        .eq("morador_id", authData.user.id)
        .eq("lida", false);

      setTemNovidade((count ?? 0) > 0);
    }

    verificarNotificacoes();

    // Escuta novas notificações em tempo real
    const canal = supabase
      .channel("notificacoes-tabbar")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificacoes" },
        () => verificarNotificacoes()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notificacoes" },
        () => verificarNotificacoes()
      )
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, []);

  // Marca como lidas quando entra no Feed
  useEffect(() => {
    if (pathname !== "/") return;

    async function marcarLidas() {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

      await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("morador_id", authData.user.id)
        .eq("lida", false);

      setTemNovidade(false);
    }

    marcarLidas();
  }, [pathname]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#FFFFFF",
        borderTop: "1px solid #E2E8F0",
        display: "flex",
        padding: "8px 0 10px",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const isAtivo = pathname === t.href;
        const mostrarPonto = t.notificavel && temNovidade && !isAtivo;

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
              color: isAtivo ? "#F97316" : "#64748B",
              padding: "6px 0",
              minHeight: 52,
              position: "relative",
            }}
          >
            <div style={{ position: "relative" }}>
              <Icon size={22} strokeWidth={isAtivo ? 2.5 : 2} />
              {mostrarPonto && (
                <div style={{
                  position: "absolute",
                  top: -3,
                  right: -4,
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "#DC2626",
                  border: "2px solid #FFFFFF",
                }} />
              )}
            </div>
            <span style={{ fontSize: 11, fontWeight: isAtivo ? 700 : 500 }}>{t.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
