import { MapPin } from "lucide-react";

export default function Logo({ size = 30 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--gradiente-laranja, linear-gradient(135deg, #F2902E 0%, #E25608 65%, #C2440A 100%))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <MapPin size={size * 0.55} color="#FBF7F0" strokeWidth={2.5} fill="#C13A2E" />
    </div>
  );
}
