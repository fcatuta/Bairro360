import { ShieldAlert, Volume2, Dog, Wrench, Car, HelpCircle, Search } from "lucide-react";

// Categorias de ocorrência: precisam corresponder exatamente aos
// valores do enum "categoria_ocorrencia" criado no schema do Supabase.
export const CATEGORIAS = {
  seguranca: { label: "Segurança", icon: ShieldAlert, color: "#C13A2E", bg: "#FBE8E5" },
  barulho: { label: "Barulho", icon: Volume2, color: "#9A6B12", bg: "#FAEFD8" },
  animais: { label: "Animais", icon: Dog, color: "#3D6B4F", bg: "#E4F0E7" },
  zeladoria: { label: "Zeladoria", icon: Wrench, color: "#5B5550", bg: "#ECE8E2" },
  transito: { label: "Trânsito", icon: Car, color: "#2E5C8A", bg: "#E3EDF6" },
  achados_perdidos: { label: "Achados e perdidos", icon: Search, color: "#6B4F9A", bg: "#EEE8F6" },
  outros: { label: "Outros", icon: HelpCircle, color: "#5B5550", bg: "#ECE8E2" },
};

export const STATUS = {
  aberta: { label: "Aberta", color: "#C13A2E", bg: "#FBE8E5" },
  em_andamento: { label: "Em andamento", color: "#9A6B12", bg: "#FAEFD8" },
  resolvida: { label: "Resolvida", color: "#3D6B4F", bg: "#E4F0E7" },
  encerrada: { label: "Encerrada", color: "#5B5550", bg: "#ECE8E2" },
};

// Categorias de negócio: precisam corresponder ao enum "categoria_negocio".
export const CATEGORIAS_NEGOCIO = [
  { value: "padaria", label: "Padaria" },
  { value: "pizzaria", label: "Pizzaria" },
  { value: "restaurante", label: "Restaurante" },
  { value: "escola", label: "Escola" },
  { value: "academia", label: "Academia" },
  { value: "pet_shop", label: "Pet Shop" },
  { value: "clube", label: "Clube" },
  { value: "eletricista", label: "Eletricista" },
  { value: "encanador", label: "Encanador" },
  { value: "jardineiro", label: "Jardineiro" },
  { value: "pintor", label: "Pintor" },
  { value: "seguranca_empresa", label: "Empresa de Segurança" },
  { value: "diarista", label: "Diarista" },
  { value: "tecnico", label: "Técnico" },
  { value: "imobiliaria", label: "Imobiliária / Corretor" },
  { value: "outros", label: "Outros" },
];

export const PLANOS = {
  pago: { label: "Anunciante", color: "#8A6111", bg: "#FBEFD3", valorPadrao: 24.9 },
  gratuito: null,
};
