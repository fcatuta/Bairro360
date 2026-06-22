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
        left: "50%",
        transform: "translateX(-50%)",
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "#F97316",
        color: "#FFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 25px rgba(249,115,22,0.25)",
        textDecoration: "none",
        zIndex: 20,
      }}
    >
      <Plus size={28} strokeWidth={2.5} />
    </Link>
  );
}
