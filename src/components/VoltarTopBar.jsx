"use client";

import { useRouter } from "next/navigation";
import TopBar from "./TopBar";

export default function VoltarTopBar({ title }) {
  const router = useRouter();
  return <TopBar title={title} onBack={() => router.back()} />;
}
