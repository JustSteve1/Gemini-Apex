// app/agent/page.tsx
import { ApexAgent } from "@/components/agents/google";

export default function AgentPage() {
  return (
    <main className="h-dvh bg-[#F3F3F7] dark:bg-[#08080D] transition-colors duration-300">
      <ApexAgent />
    </main>
  );
}
