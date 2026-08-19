"use client";

import { useRouter } from "next/navigation";

export default function DashboardSignOut() {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/ai-systems/dashboard/logout", { method: "POST" });
    router.replace("/ai-systems/dashboard/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className="mono-label text-paper/70 underline-offset-4 hover:text-phosphor hover:underline"
    >
      Sign out
    </button>
  );
}
