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

const REVEALED_TEAMS_STORAGE_KEY = "secret-mission-revealed-teams";

export default function SecretMissionRevealPage() {
  const [missions, setMissions] = useState<SecretMission[]>([]);
  const [teamDisplayNames, setTeamDisplayNames] = useState<TeamDisplayName[]>([]);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [showPrize, setShowPrize] = useState(false);
  const [revealedTeams, setRevealedTeams] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    const saved = localStorage.getItem(REVEALED_TEAMS_STORAGE_KEY);

    if (!saved) return;

    try {
      setRevealedTeams(JSON.parse(saved));
    } catch {
      localStorage.removeItem(REVEALED_TEAMS_STORAGE_KEY);
    }
  }, []);

  function markTeamAsRevealed(team: string) {
    setRevealedTeams((current) => {
      const updated = {
        ...current,
        [team]: true,
      };

      localStorage.setItem(REVEALED_TEAMS_STORAGE_KEY, JSON.stringify(updated));

      return updated;
    });
  }

  function getTeamDisplay(team: string) {
    return (
      teamDisplayNames.find((row) => row.team === team) ||
      fallbackTeamNames[team]
    );
  }

  function getMissionForTeam(teamName: string) {
    return missions.find((mission) => mission.team_name === teamName);
  }

  function missionWasIdentified(mission: SecretMission) {
    return (
      Boolean(mission.guessed_member) &&
      Boolean(mission.actual_member) &&
      mission.guessed_member === mission.actual_member
    );
  }

  async function setMissionCompleted(teamName: string, completed: boolean) {
    await supabase
      .from("secret_missions")
      .update({ mission_completed: completed })
      .eq("team_name", teamName);

    const team = teams.find((item) => item.name === teamName);

    if (team) {
      markTeamAsRevealed(team.team);
    }

    await loadData();
    setStep(6);
  }

  function openTeam(index: number) {
    setSelectedTeamIndex(index);
    setShowPrize(false);
    setStep(0);
  }

  function backToOverview() {
    if (selectedTeamIndex !== null) {
      const team = teams[selectedTeamIndex];

      markTeamAsRevealed(team.team);
    }

    setSelectedTeamIndex(null);
    setStep(0);
    setShowPrize(false);
  }

  function nextStep() {
    setStep((current) => Math.min(current + 1, 6));
  }

  const prizeMissions = missions.filter(
    (mission) =>
      mission.mission_completed === true &&
      Boolean(mission.actual_member) &&
      !missionWasIdentified(mission)
  );

  if (showPrize) {
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
            <p className="text-7xl mb-4">🎁</p>

            <h1 className="text-6xl font-black mb-6">
              KVÄLLENS HEMLIGA UPPDRAGSPRIS
            </h1>

            <p className="text-2xl font-black mb-8">
              Priset går till den eller de som genomförde sitt uppdrag utan att
              laget hittade rätt person.
            </p>

            {prizeMissions.length === 0 ? (
              <p className="text-4xl font-black">
                Ingen kvalificerade sig för priset denna gång.
              </p>
            ) : (
              <div className="grid gap-4">
                {prizeMissions.map((mission) => (
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

                    <p className="text-lg font-bold mt-3 opacity-80">
                      {mission.mission_text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 justify-center mt-10">
              <button
                onClick={() => setShowPrize(false)}
                className="bg-black text-white px-8 py-5 rounded-3xl font-black text-2xl hover:scale-105 transition-all"
              >
                Tillbaka till lagen
              </button>

              <a
                href="/final"
                className="bg-black text-white px-8 py-5 rounded-3xl font-black text-2xl hover:scale-105 transition-all"
              >
                Gå vidare till finalen
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (selectedTeamIndex === null) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <a
          href="/admin"
          className="fixed top-4 left-4 z-50 bg-zinc-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition-all"
        >
          ←
        </a>

        <div className="max-w-6xl mx-auto pt-8">
          <RivieraHeader />

          <div className="text-center mt-10 mb-10">
            <p className="text-yellow-400 font-black uppercase tracking-widest">
              Hemligt Uppdrag Reveal
            </p>

            <h1 className="text-6xl font-black mt-3">Välj lag</h1>

            <p className="text-gray-400 font-bold mt-4 text-xl">
              Gå igenom lagen i valfri ordning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {teams.map((team, index) => {
              const display = getTeamDisplay(team.team);
              const mission = getMissionForTeam(team.name);

              const isRevealed =
                Boolean(revealedTeams[team.team]) &&
                Boolean(mission?.actual_member) &&
                Boolean(mission?.mission_text);

              const isCorrect =
                Boolean(mission?.guessed_member) &&
                Boolean(mission?.actual_member) &&
                mission?.guessed_member === mission?.actual_member;

              const qualifiesForPrize =
                mission?.mission_completed === true &&
                Boolean(mission?.actual_member) &&
                !isCorrect;

              return (
                <button
                  key={team.team}
                  onClick={() => openTeam(index)}
                  className={`${team.color} rounded-3xl p-8 text-left hover:scale-105 transition-all shadow-2xl`}
                >
                  <p className="text-5xl mb-4">{display.icon}</p>

                  <h2 className="text-4xl font-black mb-4">
                    {display.display_name}
                  </h2>

                  <div className="bg-black/20 rounded-2xl p-4 font-black">
                    {isRevealed ? (
                      <>
                        <p>
                          Gissning:{" "}
                          {mission?.guessed_member || "Ej inskickad"}
                        </p>

                        <p>
                          Rätt person:{" "}
                          {mission?.actual_member || "Ej ifylld"}
                        </p>

                        <p>
                          Uppdrag:{" "}
                          {mission?.mission_text ? "Ifyllt" : "Ej ifyllt"}
                        </p>
                      </>
                    ) : (
                      <p>🎭 Redo för reveal</p>
                    )}
                  </div>

                  <div className="mt-5 text-xl font-black">
                    {isRevealed ? "✅ Genomgånget" : "▶️ Starta reveal"}
                  </div>

                  {isRevealed &&
                    mission?.actual_member &&
                    mission?.guessed_member && (
                      <div className="mt-3 font-black">
                        <p>
                          {isCorrect ? "🏆 Laget får 5 poäng" : "0 poäng"}
                        </p>

                        {qualifiesForPrize && (
                          <p className="mt-1">
                            🎁 Kvalificerad för uppdragspris
                          </p>
                        )}
                      </div>
                    )}
                </button>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => setShowPrize(true)}
              className="bg-yellow-400 text-black px-10 py-6 rounded-3xl font-black text-3xl hover:scale-105 transition-all"
            >
              🎁 Visa individuellt pris
            </button>
          </div>
        </div>
      </main>
    );
  }

  const currentTeam = teams[selectedTeamIndex];
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

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <a
        href="/admin"
        className="fixed top-4 left-4 z-50 bg-zinc-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition-all"
      >
        ←
      </a>

      <button
        onClick={backToOverview}
        className="fixed top-4 right-4 z-50 bg-yellow-400 text-black px-5 py-3 rounded-2xl font-black shadow-2xl hover:scale-105 transition-all"
      >
        Alla lag
      </button>

      <div className="max-w-5xl mx-auto pt-8">
        <RivieraHeader />

        <div className="text-center mt-10 mb-10">
          <p className="text-yellow-400 font-black uppercase tracking-widest">
            Hemligt Uppdrag Reveal
          </p>

          <h1 className="text-6xl font-black mt-3">
            {display.icon} {display.display_name}
          </h1>
        </div>

        <section className={`${currentTeam.color} rounded-3xl p-10 text-center`}>
          {step === 0 && (
            <>
              <p className="text-5xl mb-6">🎭</p>

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
                Ni gissar att lagmedlemmen med det hemliga uppdraget är
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
                Lagmedlemmen med det hemliga uppdraget är
              </p>

              <h2 className="text-8xl font-black mb-8">
                {actualMember || "Ej ifyllt"}
              </h2>

              <button
                onClick={nextStep}
                className="bg-black text-white px-8 py-5 rounded-3xl font-black text-2xl hover:scale-105 transition-all"
              >
                Visa lagets resultat
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-4xl font-black mb-6">
                {isCorrect
                  ? "Laget hittade rätt person"
                  : "Laget hittade inte rätt person"}
              </p>

              <h2 className="text-8xl font-black mb-8">{points} POÄNG</h2>

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
                {actualMember || "Lagmedlemmen"}, berätta!
              </p>

              <p className="text-2xl font-black opacity-80 mb-10">
                Vad har du försökt göra under tävlingen?
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
                {actualMember || "Lagmedlemmens"} hemliga uppdrag
              </p>

              <h2 className="text-5xl font-black leading-tight mb-10">
                {missionText || "Ej ifyllt"}
              </h2>

              <h3 className="text-4xl font-black mb-6">
                Har uppdraget genomförts?
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
                {missionCompleted ? "🎁" : "❌"}
              </p>

              <h2 className="text-6xl font-black mb-8">
                {missionCompleted
                  ? "Uppdraget genomfördes"
                  : "Uppdraget genomfördes inte"}
              </h2>

              <p className="text-3xl font-black opacity-80 mb-8">
                {missionCompleted && !isCorrect
                  ? `${actualMember} kvalificerar sig för kvällens hemliga uppdragspris.`
                  : missionCompleted && isCorrect
                    ? `${actualMember} genomförde uppdraget, men laget hittade rätt person.`
                    : `${actualMember} kvalificerar sig inte för priset denna gång.`}
              </p>

              <button
                onClick={backToOverview}
                className="bg-black text-white px-8 py-5 rounded-3xl font-black text-2xl hover:scale-105 transition-all"
              >
                Tillbaka till alla lag
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}