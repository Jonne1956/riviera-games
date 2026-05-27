"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { teamCodes } from "@/app/data/teamCodes";

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const team = params.team as string;

  const [authorized, setAuthorized] = useState(false);
  const [inputCode, setInputCode] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`team-access-${team}`);

    if (saved === "granted") {
      setAuthorized(true);
    }
  }, [team]);

  function checkCode() {
    if (inputCode === teamCodes[team]) {
      localStorage.setItem(`team-access-${team}`, "granted");
      setAuthorized(true);
    } else {
      alert("Fel lagkod");
    }
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm">
          <h1 className="text-3xl font-black text-center mb-6">
            Ange lagkod
          </h1>

          <input
            type="password"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Lagkod"
            className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-center text-2xl mb-4"
          />

          <button
            onClick={checkCode}
            className="w-full bg-yellow-400 text-black font-black p-4 rounded-2xl"
          >
            Gå vidare
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}