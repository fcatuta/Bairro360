import { MapPin } from "lucide-react";

export default function Logo({ size = 30 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #F2902E 0%, #E8590C 60%)",
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
