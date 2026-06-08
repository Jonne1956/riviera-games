"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";
import { teamMembers } from "@/app/data/teamMembers";

type TeamDisplayName = {
  team: string;
  display_name: string;
  icon: string;
};

type SecretMissionRow = {
  team_name: string;
  guessed_member: string | null;
};

const fallbackTeamNames: Record<string, TeamDisplayName> = {
  gul: { team: "gul", display_name: "Lag Gul", icon: "⛷️" },
  bla: { team: "bla", display_name: "Lag Blå", icon: "🔨" },
  gron: { team: "gron", display_name: "Lag Grön", icon: "🍺" },
  rod: { team: "rod", display_name: "Lag Röd", icon: "⛳" },
};

export default function SecretMissionPage() {
  const params = useParams();
  const router = useRouter();
  const team = params.team as string;

  const members = teamMembers[team] || [];

  const [selectedName, setSelectedName] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [teamDisplay, setTeamDisplay] = useState<TeamDisplayName | null>(null);

  const fallback = fallbackTeamNames[team] || {
    team,
    display_name: `Lag ${team}`,
    icon: "",
  };

  const display = teamDisplay || fallback;
const teamNameForDb = fallback.display_name;

  useEffect(() => {
    async function loadData() {
      const { data: missionData } = await supabase
        .from("secret_missions")
        .select("team_name, guessed_member")
        .eq("team_name", teamNameForDb)
        .maybeSingle<SecretMissionRow>();

      const { data: teamNameData } = await supabase
        .from("team_display_names")
        .select("*")
        .eq("team", team)
        .maybeSingle();

      if (missionData?.guessed_member) {
        setAlreadySubmitted(true);
        setSubmittedName(missionData.guessed_member);
      }

      if (teamNameData) {
        setTeamDisplay(teamNameData);
      }
    }

    loadData();
  }, [team, teamNameForDb]);

  async function submitVote() {
  if (!selectedName) {
    alert("Välj en lagmedlem först.");
    return;
  }

  setSubmitting(true);

  const { data, error } = await supabase
    .from("secret_missions")
    .update({
      guessed_member: selectedName,
    })
    .eq("team_name", teamNameForDb)
    .select("team_name, guessed_member")
    .single();

  setSubmitting(false);

  if (error) {
    console.error("Secret mission save error:", error);
    alert(`Det gick inte att spara svaret: ${error.message}`);
    return;
  }

  if (!data) {
    alert("Svaret sparades inte. Kontrollera att laget finns i secret_missions.");
    return;
  }

  setAlreadySubmitted(true);
  setSubmittedName(selectedName);

  setTimeout(() => {
    router.push(`/team/${team}`);
  }, 2000);
}
  if (alreadySubmitted) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="max-w-md mx-auto pt-6">
          <RivieraHeader />

          <div className="mt-10 bg-yellow-400 text-black p-8 rounded-3xl text-center">
            <p className="text-5xl mb-2">{display.icon}</p>

            <p className="font-black text-xl mb-1">{display.display_name}</p>

            <p className="font-bold opacity-80 mb-5">
              {fallback.display_name}
            </p>

            <p className="text-5xl mb-4">🎭</p>

            <h1 className="text-3xl font-black mb-3">Svar registrerat</h1>

            <p className="font-bold">
              Ni tror att den här lagmedlemmen har haft det hemliga uppdraget:
            </p>

            <p className="text-4xl font-black mt-3">{submittedName}</p>

            <p className="mt-5 font-bold">
              Resultatet avslöjas vid prisutdelningen.
            </p>
          </div>

          <button
            onClick={() => router.push(`/team/${team}`)}
            className="w-full mt-6 p-4 rounded-2xl bg-zinc-800 text-white font-bold"
          >
            Tillbaka till momentmenyn
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-6">
        <RivieraHeader />

        <div className="text-center mt-8 mb-8">
          <p className="text-5xl mb-2">{display.icon}</p>

          <p className="text-yellow-400 font-black uppercase tracking-wide">
            Moment 4
          </p>

          <h1 className="text-4xl font-black mt-2">Hemligt Uppdrag</h1>

          <p className="text-yellow-400 font-black mt-2">
            {display.display_name}
          </p>

          <p className="text-gray-500 font-bold mt-1">
            {fallback.display_name}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8 text-center">
          <p className="text-lg text-gray-300 font-bold leading-relaxed">
            Någon i ert lag har haft ett hemligt uppdrag under tävlingen.
          </p>

          <p className="text-2xl text-yellow-400 font-black mt-5 leading-snug">
            Vilken lagmedlem tror ni har haft det hemliga uppdraget?
          </p>

          <p className="text-gray-400 font-bold mt-5">
            Ni har bara ett försök.
          </p>
        </div>

        <div className="grid gap-3 mb-8">
          {members.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedName(name)}
              className={`p-4 rounded-2xl font-black text-xl border transition-all ${
                selectedName === name
                  ? "bg-yellow-400 text-black border-yellow-400 scale-105"
                  : "bg-zinc-900 text-white border-zinc-800"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <button
          onClick={submitVote}
          disabled={submitting}
          className="w-full mt-8 p-5 rounded-3xl bg-yellow-400 text-black font-black text-xl hover:scale-105 transition"
        >
          {submitting ? "Skickar..." : "🎭 Skicka gissning"}
        </button>

        <button
          onClick={() => router.push(`/team/${team}`)}
          className="w-full mt-4 p-4 rounded-2xl bg-zinc-800 text-white font-bold"
        >
          Tillbaka till momentmenyn
        </button>
      </div>
    </main>
  );
}