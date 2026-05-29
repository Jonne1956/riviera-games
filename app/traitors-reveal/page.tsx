"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";
import { traitors } from "@/app/data/traitors";

type TraitorVote = {
  team: string;
  suspect_name: string;
  is_correct: boolean;
  points: number;
};

const teamNames: Record<string, string> = {
  gul: "Lag Gul",
  bla: "Lag Blå",
  gron: "Lag Grön",
  rod: "Lag Röd",
};

const teamColors: Record<string, string> = {
  gul: "bg-yellow-400 text-black",
  bla: "bg-blue-500 text-white",
  gron: "bg-green-500 text-white",
  rod: "bg-red-500 text-white",
};

export default function TraitorsRevealPage() {
  const [votes, setVotes] = useState<TraitorVote[]>([]);

  async function loadVotes() {
    const { data } = await supabase.from("traitor_votes").select("*");

    if (data) setVotes(data);
  }

  useEffect(() => {
    loadVotes();

    const interval = setInterval(loadVotes, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <a
        href="/admin"
        className="fixed top-4 left-4 z-50 bg-zinc-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition-all"
      >
        ←
      </a>

      <div className="max-w-5xl mx-auto pt-8">
        <RivieraHeader />

        <h1 className="text-6xl font-black text-center mt-10 mb-4">
          🕵️ THE TRAITORS
        </h1>

        <p className="text-gray-400 text-center text-xl mb-10">
          Vilka lag hittade sin förrädare?
        </p>

        <div className="grid gap-6">
          {Object.keys(teamNames).map((team) => {
            const vote = votes.find((v) => v.team === team);
            const correctTraitor = traitors[team];
            const isCorrect = vote?.suspect_name === correctTraitor;

            return (
              <section
                key={team}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
              >
                <div
                  className={`${teamColors[team]} rounded-2xl px-5 py-3 inline-block mb-6`}
                >
                  <h2 className="text-3xl font-black uppercase">
                    {teamNames[team]}
                  </h2>
                </div>

                {!vote ? (
                  <div className="bg-zinc-800 rounded-2xl p-6">
                    <p className="text-2xl font-black text-gray-400">
                      Inget svar inskickat ännu
                    </p>
                  </div>
                ) : (
                  <div
                    className={`rounded-3xl p-8 text-center ${
                      isCorrect
                        ? "bg-green-500 text-black"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    <p className="text-lg font-bold uppercase mb-2">
                      Laget valde
                    </p>

                    <p className="text-5xl font-black mb-8">
                      {vote.suspect_name}
                    </p>

                    <p className="text-lg font-bold uppercase mb-2">
                      Förrädaren var
                    </p>

                    <p className="text-5xl font-black mb-8">
                      {correctTraitor}
                    </p>

                    <p className="text-4xl font-black">
                      {isCorrect ? "✅ RÄTT — +5 POÄNG" : "❌ FEL — 0 POÄNG"}
                    </p>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}