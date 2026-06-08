"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";

type SecretMission = {
  team_name: string;
  guessed_member: string | null;
  actual_member: string | null;
  mission_text: string | null;
  mission_completed: boolean | null;
};

type TeamDisplayName = {
  team: string;
  display_name: string;
  icon: string;
};

const teams = [
  { team: "gul", name: "Lag Gul", color: "bg-yellow-400 text-black" },
  { team: "bla", name: "Lag Blå", color: "bg-blue-500 text-white" },
  { team: "gron", name: "Lag Grön", color: "bg-green-500 text-white" },
  { team: "rod", name: "Lag Röd", color: "bg-red-500 text-white" },
];

const fallbackTeamNames: Record<string, TeamDisplayName> = {
  gul: { team: "gul", display_name: "Lag Gul", icon: "⛷️" },
  bla: { team: "bla", display_name: "Lag Blå", icon: "🔨" },
  gron: { team: "gron", display_name: "Lag Grön", icon: "🍺" },
  rod: { team: "rod", display_name: "Lag Röd", icon: "⛳" },
};

export default function SecretMissionRevealPage() {
  const [missions, setMissions] = useState<SecretMission[]>([]);
  const [teamDisplayNames, setTeamDisplayNames] = useState<TeamDisplayName[]>([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [step, setStep] = useState(0);

  async function loadData() {
    const { data: missionData } = await supabase
      .from("secret_missions")
      .select("*")
      .order("team_name");

    const { data: teamNameData } = await supabase
      .from("team_display_names")
      .select("*");

    if (missionData) setMissions(missionData);
    if (teamNameData) setTeamDisplayNames(teamNameData);
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 3000);

    return () => clearInterval(interval);
  }, []);

  function getTeamDisplay(team: string) {
    return (
      teamDisplayNames.find((row) => row.team === team) ||
      fallbackTeamNames[team]
    );
  }

  function getMissionForTeam(teamName: string) {
    return missions.find((mission) => mission.team_name === teamName);
  }

  async function setMissionCompleted(teamName: string, completed: boolean) {
    await supabase
      .from("secret_missions")
      .update({ mission_completed: completed })
      .eq("team_name", teamName);

    loadData();
    setStep(6);
  }

  function nextStep() {
    setStep((current) => Math.min(current + 1, 6));
  }

  function nextTeam() {
    if (currentTeamIndex < teams.length - 1) {
      setCurrentTeamIndex((current) => current + 1);
      setStep(0);
    } else {
      setStep(7);
    }
  }

  const currentTeam = teams[currentTeamIndex];
  const display = getTeamDisplay(currentTeam.team);
  const mission = getMissionForTeam(currentTeam.name);

  const guessedMember = mission?.guessed_member;
  const actualMember = mission?.actual_member;
  const missionText = mission?.mission_text;
  const missionCompleted = mission?.mission_completed;

  const isCorrect =
    Boolean(guessedMember) &&
    Boolean(actualMember) &&
    guessedMember === actualMember;

  const points = isCorrect ? 5 : 0;

  const completedMissions = missions.filter(
    (mission) => mission.mission_completed === true
  );

  if (step === 7) {
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

          <div className="mt-16 bg-yellow-400 text-black rounded-3xl p-10 text-center">
            <p className="text-7xl mb-4">🍾</p>

            <h1 className="text-6xl font-black mb-6">
              KVÄLLENS HEMLIGA UPPDRAGSTAGARE
            </h1>

            <p className="text-2xl font-black mb-8">
              Individpriset går till den eller de som lyckades med sitt uppdrag.
            </p>

            {completedMissions.length === 0 ? (
              <p className="text-4xl font-black">
                Inga uppdrag klarades denna gång.
              </p>
            ) : (
              <div className="grid gap-4">
                {completedMissions.map((mission) => (
                  <div
                    key={mission.team_name}
                    className="bg-black/10 rounded-3xl p-6"
                  >
                    <p className="text-5xl font-black">
                      🏆 {mission.actual_member}
                    </p>

                    <p className="text-xl font-bold mt-3">
                      {mission.team_name}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <a
              href="/final"
              className="inline-block mt-10 bg-black text-white px-8 py-5 rounded-3xl font-black text-2xl hover:scale-105 transition-all"
            >
              Gå vidare till finalen
            </a>
          </div>
        </div>
      </main>
    );
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

        <div className="text-center mt-10 mb-10">
          <p className="text-yellow-400 font-black uppercase tracking-widest">
            Hemligt Uppdrag Reveal
          </p>

          <h1 className="text-6xl font-black mt-3">
            {display.icon} {display.display_name}
          </h1>

          <p className="text-gray-400 font-bold mt-2">
            Lag {currentTeamIndex + 1} av {teams.length}
          </p>
        </div>

        <section className={`${currentTeam.color} rounded-3xl p-10 text-center`}>
          {step === 0 && (
            <>
              <p className="text-5xl mb-6">🎯</p>

              <h2 className="text-5xl font-black mb-6">
                Vem hade det hemliga uppdraget?
              </h2>

              <button
                onClick={nextStep}
                className="mt-10 bg-black text-white px-8 py-5 rounded-3xl font-black text-2xl hover:scale-105 transition-all"
              >
                Visa lagets gissning
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-3xl font-black uppercase opacity-80 mb-4">
                Lagets gissning
              </p>

              <h2 className="text-8xl font-black mb-8">
                {guessedMember || "Inget svar"}
              </h2>

              <button
                onClick={nextStep}
                className="bg-black text-white px-8 py-5 rounded-3xl font-black text-2xl hover:scale-105 transition-all"
              >
                Avslöja rätt person
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-3xl font-black uppercase opacity-80 mb-4">
                Den rätta personen var
              </p>

              <h2 className="text-8xl font-black mb-8">
                {actualMember || "Ej ifyllt"}
              </h2>

              <button
                onClick={nextStep}
                className="bg-black text-white px-8 py-5 rounded-3xl font-black text-2xl hover:scale-105 transition-all"
              >
                Visa poäng
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-4xl font-black mb-6">
                {isCorrect
                  ? "Ert lag lyckades avslöja rätt person 👍"
                  : "Ert lag lyckades tyvärr inte avslöja rätt person 👎"}
              </p>

              <h2 className="text-8xl font-black mb-8">
                {points} POÄNG
              </h2>

              <button
                onClick={nextStep}
                className="bg-black text-white px-8 py-5 rounded-3xl font-black text-2xl hover:scale-105 transition-all"
              >
                Visa uppdraget
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-4xl font-black uppercase opacity-80 mb-8">
                Men vad var egentligen uppdraget?
              </p>

              <button
                onClick={nextStep}
                className="bg-black text-white px-8 py-5 rounded-3xl font-black text-2xl hover:scale-105 transition-all"
              >
                Visa uppdraget
              </button>
            </>
          )}

          {step === 5 && (
            <>
              <p className="text-3xl font-black uppercase opacity-80 mb-4">
                Det hemliga uppdraget var
              </p>

              <h2 className="text-5xl font-black leading-tight mb-10">
                {missionText || "Ej ifyllt"}
              </h2>

              <h3 className="text-4xl font-black mb-6">
                Klarade {actualMember || "uppdragstagaren"} uppdraget?
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setMissionCompleted(currentTeam.name, true)}
                  className="bg-green-500 text-black px-8 py-6 rounded-3xl font-black text-3xl hover:scale-105 transition-all"
                >
                  ✅ Ja
                </button>

                <button
                  onClick={() => setMissionCompleted(currentTeam.name, false)}
                  className="bg-red-600 text-white px-8 py-6 rounded-3xl font-black text-3xl hover:scale-105 transition-all"
                >
                  ❌ Nej
                </button>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <p className="text-6xl mb-6">
                {missionCompleted ? "🍾" : "❌"}
              </p>

              <h2 className="text-6xl font-black mb-8">
                {missionCompleted
                  ? "Uppdraget lyckades!"
                  : "Uppdraget lyckades inte"}
              </h2>

              <p className="text-3xl font-black opacity-80 mb-8">
                {missionCompleted
                  ? `${actualMember} är med i kampen om skumpan.`
                  : `${actualMember} får tyvärr ingen skumpa denna gång.`}
              </p>

              <button
                onClick={nextTeam}
                className="bg-black text-white px-8 py-5 rounded-3xl font-black text-2xl hover:scale-105 transition-all"
              >
                {currentTeamIndex < teams.length - 1
                  ? "Nästa lag"
                  : "Visa individuellt pris"}
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}