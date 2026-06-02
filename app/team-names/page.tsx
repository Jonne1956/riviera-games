"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";

type TeamName = {
  team: string;
  display_name: string;
  icon: string;
};

const teamOrder = ["gul", "bla", "gron", "rod"];

const fallbackNames: Record<string, TeamName> = {
  gul: { team: "gul", display_name: "Lag Gul", icon: "⛷️" },
  bla: { team: "bla", display_name: "Lag Blå", icon: "🔨" },
  gron: { team: "gron", display_name: "Lag Grön", icon: "🍺" },
  rod: { team: "rod", display_name: "Lag Röd", icon: "⛳" },
};

export default function TeamNamesPage() {
  const [teams, setTeams] = useState<TeamName[]>([]);
  const [saved, setSaved] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  async function loadTeams() {
    const { data } = await supabase.from("team_display_names").select("*");

    if (data && data.length > 0) {
      const sorted = teamOrder.map(
        (team) => data.find((row) => row.team === team) || fallbackNames[team]
      );

      setTeams(sorted);
    } else {
      setTeams(teamOrder.map((team) => fallbackNames[team]));
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  function updateName(team: string, name: string) {
    setTeams((current) =>
      current.map((row) =>
        row.team === team
          ? { ...row, display_name: name.slice(0, 24) }
          : row
      )
    );

    setSaved(false);
    setResetDone(false);
  }

  async function saveNames() {
    for (const team of teams) {
      await supabase
        .from("team_display_names")
        .update({
          display_name:
            team.display_name || fallbackNames[team.team].display_name,
          icon: team.icon,
        })
        .eq("team", team.team);
    }

    setSaved(true);
    setResetDone(false);
    loadTeams();
  }

  async function resetNames() {
    if (!confirm("Återställa till ursprungliga lagnamn?")) return;

    for (const team of teamOrder) {
      await supabase
        .from("team_display_names")
        .update({
          display_name: fallbackNames[team].display_name,
          icon: fallbackNames[team].icon,
        })
        .eq("team", team);
    }

    setSaved(false);
    setResetDone(true);
    loadTeams();
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <a
        href="/admin"
        className="fixed top-4 left-4 z-50 bg-zinc-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition-all"
      >
        ←
      </a>

      <div className="max-w-2xl mx-auto pt-8">
        <RivieraHeader />

        <h1 className="text-5xl font-black text-center mt-10 mb-4">
          🏷️ Lagnamn
        </h1>

        <p className="text-center text-gray-400 mb-10">
          Skriv in lagens egna namn. Max 24 tecken.
        </p>

        <div className="grid gap-5">
          {teams.map((team) => (
            <div
              key={team.team}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="text-5xl">{team.icon}</div>

                <div>
                  <p className="text-sm uppercase text-gray-400 font-bold">
                    {fallbackNames[team.team].display_name}
                  </p>

                  <p className="text-2xl font-black">{team.display_name}</p>
                </div>
              </div>

              <input
                value={team.display_name}
                onChange={(e) => updateName(team.team, e.target.value)}
                maxLength={24}
                className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-white font-bold text-xl"
                placeholder={fallbackNames[team.team].display_name}
              />

              <p className="text-right text-xs text-gray-500 mt-2">
                {team.display_name.length}/24
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={saveNames}
          className="w-full mt-8 bg-yellow-400 text-black p-5 rounded-3xl font-black text-xl hover:scale-105 transition-all"
        >
          Spara lagnamn
        </button>

        <button
          onClick={resetNames}
          className="w-full mt-4 bg-zinc-800 text-white p-5 rounded-3xl font-black text-xl hover:scale-105 transition-all"
        >
          Återställ ursprungliga lagnamn
        </button>

        {saved && (
          <div className="mt-6 bg-green-500 text-black p-5 rounded-3xl text-center">
            <p className="text-2xl font-black">✅ Lagnamn sparade</p>
          </div>
        )}

        {resetDone && (
          <div className="mt-6 bg-green-500 text-black p-5 rounded-3xl text-center">
            <p className="text-2xl font-black">
              ✅ Ursprungliga lagnamn återställda
            </p>
          </div>
        )}
      </div>
    </main>
  );
}