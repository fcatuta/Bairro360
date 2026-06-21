"use client";

import { useState } from "react";
import { ChevronLeft, MapPin, PhoneCall, Users, CheckCircle2, X } from "lucide-react";
import Logo from "./Logo";

function EmergencyButton({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      aria-label="Emergência: ligar para a polícia"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "var(--cor-vermelho)",
        border: "none",
        borderRadius: 22,
        padding: "9px 16px",
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <PhoneCall size={17} />
      Emergência
    </button>
  );
}

function EmergencyModal({ onClose }) {
  const [avisado, setAvisado] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(43,38,34,0.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#FFFFFF",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px 32px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontFamily: "var(--fonte-titulo)", fontSize: 20, fontWeight: 700, color: "var(--cor-texto)", margin: 0 }}>
            Pedir ajuda agora
          </h2>
          <button onClick={onClose} aria-label="Fechar" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={22} color="var(--cor-texto-fraco)" />
          </button>
        </div>

        <a
          href="tel:190"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            padding: "16px 18px",
            borderRadius: 14,
            background: "var(--cor-vermelho)",
            color: "#FFFFFF",
            textDecoration: "none",
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        >
          <PhoneCall size={24} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>Ligar para a Polícia · 190</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Toque para chamar agora</div>
          </div>
        </a>

        <button
          onClick={() => setAvisado(true)}
          disabled={avisado}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            padding: "16px 18px",
            borderRadius: 14,
            background: avisado ? "var(--cor-verde-bg)" : "var(--cor-texto)",
            color: avisado ? "var(--cor-verde)" : "#FFFFFF",
            border: "none",
            cursor: avisado ? "default" : "pointer",
            marginBottom: 16,
            boxSizing: "border-box",
            textAlign: "left",
          }}
        >
          {avisado ? <CheckCircle2 size={24} /> : <Users size={24} />}
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>
              {avisado ? "Vizinhança avisada" : "Avisar a vizinhança"}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              {avisado
                ? "Sua localização foi enviada aos moderadores"
                : "Envia sua localização aos moderadores do bairro"}
            </div>
          </div>
        </button>

        <p style={{ fontSize: 13, color: "var(--cor-texto-fraco)", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
          Em perigo imediato, ligue para a polícia primeiro.
        </p>
      </div>
    </div>
  );
}

export default function TopBar({ bairroNome, onBack, title }) {
  const [emergenciaAberta, setEmergenciaAberta] = useState(false);

  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--cor-fundo)",
          borderBottom: "1px solid var(--cor-borda)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="Voltar"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}
          >
            <ChevronLeft size={26} color="var(--cor-texto)" />
          </button>
        ) : (
          <Logo />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {title ? (
            <div style={{ fontFamily: "var(--fonte-titulo)", fontSize: 18, fontWeight: 700, color: "var(--cor-texto)" }}>
              {title}
            </div>
          ) : (
            <>
              <div style={{ fontFamily: "var(--fonte-titulo)", fontSize: 17, fontWeight: 700, color: "var(--cor-texto)", lineHeight: 1.1 }}>
                Bairro360
              </div>
              {bairroNome && (
                <div style={{ fontSize: 13, color: "var(--cor-texto-fraco)", display: "flex", alignItems: "center", gap: 3 }}>
                  <MapPin size={12} /> {bairroNome}
                </div>
              )}
            </>
          )}
        </div>
        {!onBack && <EmergencyButton onOpen={() => setEmergenciaAberta(true)} />}
      </div>

      {emergenciaAberta && <EmergencyModal onClose={() => setEmergenciaAberta(false)} />}
    </>
  );
}
