"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";
import { traitors } from "@/app/data/traitors";
import { secretMissions } from "@/app/data/secretMissions";

type MissionVote = {
  team: string;
  suspect_name: string;
  mission_guess: string | null;
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

export default function SecretMissionRevealPage() {
  const [votes, setVotes] = useState<MissionVote[]>([]);
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
          🎯 HEMLIGT UPPDRAG
        </h1>

        <p className="text-gray-400 text-center text-xl mb-10">
          Vilka lag avslöjade personen med det hemliga uppdraget?
        </p>

        <div className="grid gap-8">
          {Object.keys(fallbackTeamNames).map((team) => {
            const vote = votes.find((v) => v.team === team);
            const correctPerson = traitors[team];
            const correctMission = secretMissions[team];
            const isRevealed = revealedTeams[team];

            const personIsCorrect = vote?.suspect_name === correctPerson;
            const missionIsCorrect = vote?.mission_guess === correctMission;
            const calculatedPoints =
              (personIsCorrect ? 3 : 0) + (missionIsCorrect ? 2 : 0);

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

                    <p className="text-6xl font-black mb-6 text-yellow-400">
                      {vote.suspect_name}
                    </p>

                    <p className="text-lg font-bold uppercase text-gray-400 mb-2">
                      Laget trodde att uppdraget var
                    </p>

                    <p className="text-2xl font-black mb-8 text-yellow-400">
                      {vote.mission_guess || "Inget uppdrag valt"}
                    </p>

                    {!isRevealed ? (
                      <button
                        onClick={() => revealTeam(team)}
                        className="bg-yellow-400 text-black px-8 py-5 rounded-3xl font-black text-2xl hover:scale-105 transition-all"
                      >
                        🎯 Avslöja uppdraget
                      </button>
                    ) : (
                      <div
                        className={`rounded-3xl p-8 ${
                          calculatedPoints > 0
                            ? "bg-green-500 text-black"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        <p className="text-lg font-bold uppercase mb-2">
                          Personen med uppdraget var
                        </p>

                        <p className="text-6xl font-black mb-8">
                          {correctPerson}
                        </p>

                        <p className="text-lg font-bold uppercase mb-2">
                          Det hemliga uppdraget var
                        </p>

                        <p className="text-3xl font-black mb-8">
                          {correctMission}
                        </p>

                        <div className="bg-black/20 rounded-3xl p-5">
                          <p className="text-3xl font-black mb-2">
                            {personIsCorrect
                              ? "✅ Rätt person: +3 p"
                              : "❌ Fel person: 0 p"}
                          </p>

                          <p className="text-3xl font-black mb-4">
                            {missionIsCorrect
                              ? "✅ Rätt uppdrag: +2 p"
                              : "❌ Fel uppdrag: 0 p"}
                          </p>

                          <p className="text-5xl font-black">
                            Totalt: {calculatedPoints} p
                          </p>
                        </div>
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