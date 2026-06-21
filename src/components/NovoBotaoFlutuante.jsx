"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export default function NovoBotaoFlutuante() {
  return (
    <Link
      href="/ocorrencias/nova"
      aria-label="Publicar nova ocorrência"
      style={{
        position: "fixed",
        bottom: 86,
        right: "calc(50% - 240px + 24px)",
        width: 62,
        height: 62,
        borderRadius: "50%",
        background: "var(--cor-laranja)",
        color: "#FFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 14px rgba(232,89,12,0.4)",
        textDecoration: "none",
        zIndex: 20,
      }}
    >
      <Plus size={28} />
    </Link>
  );
}
