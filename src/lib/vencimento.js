// Calcula o status de vencimento de um plano de anunciante.
// Retorna { label, color, bg } para exibição, ou null se não há vencimento definido.
export function statusVencimento(plano, dataVencimento) {
  if (plano === "gratuito" || !dataVencimento) return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencimento = new Date(dataVencimento + "T00:00:00");
  const diffDias = Math.round((vencimento - hoje) / 86400000);

  if (diffDias < 0) {
    return { label: `Venceu há ${Math.abs(diffDias)} dia${Math.abs(diffDias) > 1 ? "s" : ""}`, color: "#C13A2E", bg: "#FBE8E5" };
  }
  if (diffDias === 0) {
    return { label: "Vence hoje", color: "#C13A2E", bg: "#FBE8E5" };
  }
  if (diffDias <= 7) {
    return { label: `Vence em ${diffDias} dia${diffDias > 1 ? "s" : ""}`, color: "#9A6B12", bg: "#FAEFD8" };
  }
  return { label: `Vence em ${formatarData(dataVencimento)}`, color: "#3D6B4F", bg: "#E4F0E7" };
}

export function formatarData(dataIso) {
  if (!dataIso) return "";
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Soma "meses" a uma data no formato YYYY-MM-DD e retorna no mesmo formato.
export function somarMeses(dataIso, meses) {
  const data = new Date(dataIso + "T00:00:00");
  data.setMonth(data.getMonth() + meses);
  return data.toISOString().split("T")[0];
}
