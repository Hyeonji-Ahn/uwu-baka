"use client";

import Chat from "../components/openAI";

export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-black text-white">
      <div className="flex-grow overflow-hidden">
        <Chat />
      </div>
    </main>
  );
}
