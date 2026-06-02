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

type TeamDisplayName = {
  team: string;
  display_name: string;
  icon: string;
};

const fallbackTeamNames: Record<string, TeamDisplayName> = {
  gul: { team: "gul", display_name: "Lag Gul", icon: "⛷️" },
  bla: { team: "bla", display_name: "Lag Blå", icon: "🔨" },
  gron: { team: "gron", display_name: "Lag Grön", icon: "🍺" },
  rod: { team: "rod", display_name: "Lag Röd", icon: "⛳" },
};

const teamColors: Record<string, string> = {
  gul: "bg-yellow-400 text-black",
  bla: "bg-blue-500 text-white",
  gron: "bg-green-500 text-white",
  rod: "bg-red-500 text-white",
};

export default function TraitorsRevealPage() {
  const [votes, setVotes] = useState<TraitorVote[]>([]);
  const [teamDisplayNames, setTeamDisplayNames] = useState<TeamDisplayName[]>([]);
  const [revealedTeams, setRevealedTeams] = useState<Record<string, boolean>>(
    {}
  );

  async function loadVotes() {
    const { data: voteData } = await supabase.from("traitor_votes").select("*");

    const { data: teamNameData } = await supabase
      .from("team_display_names")
      .select("*");

    if (voteData) setVotes(voteData);
    if (teamNameData) setTeamDisplayNames(teamNameData);
  }

  useEffect(() => {
    loadVotes();

    const interval = setInterval(loadVotes, 3000);

    return () => clearInterval(interval);
  }, []);

  function getTeamDisplay(team: string) {
    return (
      teamDisplayNames.find((row) => row.team === team) ||
      fallbackTeamNames[team]
    );
  }

  function revealTeam(team: string) {
    setRevealedTeams((current) => ({
      ...current,
      [team]: true,
    }));
  }

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

        <div className="grid gap-8">
          {Object.keys(fallbackTeamNames).map((team) => {
            const vote = votes.find((v) => v.team === team);
            const correctTraitor = traitors[team];
            const isRevealed = revealedTeams[team];
            const isCorrect = vote?.suspect_name === correctTraitor;
            const display = getTeamDisplay(team);

            return (
              <section
                key={team}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
              >
                <div
                  className={`${teamColors[team]} rounded-2xl px-5 py-3 inline-block mb-6`}
                >
                  <h2 className="text-3xl font-black uppercase">
                    {display.icon} {display.display_name}
                  </h2>

                  <p className="font-bold opacity-80 mt-1">
                    {fallbackTeamNames[team].display_name}
                  </p>
                </div>

                {!vote ? (
                  <div className="bg-zinc-800 rounded-2xl p-6">
                    <p className="text-2xl font-black text-gray-400">
                      Inget svar inskickat ännu
                    </p>
                  </div>
                ) : (
                  <div className="bg-zinc-800 rounded-3xl p-8 text-center">
                    <p className="text-lg font-bold uppercase text-gray-400 mb-2">
                      Laget misstänkte
                    </p>

                    <p className="text-6xl font-black mb-8 text-yellow-400">
                      {vote.suspect_name}
                    </p>

                    {!isRevealed ? (
                      <button
                        onClick={() => revealTeam(team)}
                        className="bg-yellow-400 text-black px-8 py-5 rounded-3xl font-black text-2xl hover:scale-105 transition-all"
                      >
                        🕵️ Avslöja förrädaren
                      </button>
                    ) : (
                      <div
                        className={`rounded-3xl p-8 ${
                          isCorrect
                            ? "bg-green-500 text-black"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        <p className="text-lg font-bold uppercase mb-2">
                          Den riktiga förrädaren var
                        </p>

                        <p className="text-6xl font-black mb-8">
                          {correctTraitor}
                        </p>

                        <p className="text-4xl font-black">
                          {isCorrect
                            ? "✅ RÄTT — +5 POÄNG"
                            : "❌ FEL — 0 POÄNG"}
                        </p>
                      </div>
                    )}
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