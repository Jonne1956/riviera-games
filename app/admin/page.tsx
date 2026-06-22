"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";
import { questions } from "@/app/data/quizQuestions";

type QuizAnswer = {
  team: string;
  question_id: number;
  answer: string;
};

type DrinkAnswer = {
  team: string;
  drink_1: string;
  drink_2: string;
  drink_3: string;
  drink_4: string;
};

type PhotoSubmission = {
  id: number;
  team: string;
  image_url: string;
  photo_score: number | null;
};

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

type MusicGuest = {
  id: number;
  name: string;
  rivieragames_team: string | null;
  is_active: boolean | null;
};

type SectionKey =
  | "beforeParty"
  | "beforeCompetition"
  | "duringCompetition"
  | "final"
  | "reset";

const correctDrinks = {
  drink_1: "Öl",
  drink_2: "Sockerfri läsk",
  drink_3: "Alkoholfri öl",
  drink_4: "Läsk med socker",
};

const teamInfo = [
  { team: "gul", name: "Lag Gul", color: "bg-yellow-400 text-black" },
  { team: "bla", name: "Lag Blå", color: "bg-blue-500 text-white" },
  { team: "gron", name: "Lag Grön", color: "bg-green-500 text-white" },
  { team: "rod", name: "Lag Röd", color: "bg-red-500 text-white" },
];

const excludedFromRivieraGames = ["Ewa"];

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [drinkAnswers, setDrinkAnswers] = useState<DrinkAnswer[]>([]);
  const [photos, setPhotos] = useState<PhotoSubmission[]>([]);
  const [secretMissions, setSecretMissions] = useState<SecretMission[]>([]);
  const [teamDisplayNames, setTeamDisplayNames] = useState<TeamDisplayName[]>([]);
  const [guests, setGuests] = useState<MusicGuest[]>([]);
  const [showGuestEditor, setShowGuestEditor] = useState(false);

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    beforeParty: false,
    beforeCompetition: false,
    duringCompetition: false,
    final: false,
    reset: false,
  });

  function toggleSection(section: SectionKey) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  function SectionHeader({
    section,
    title,
    description,
  }: {
    section: SectionKey;
    title: string;
    description: string;
  }) {
    const isOpen = openSections[section];

    return (
      <button
        onClick={() => toggleSection(section)}
        className="w-full text-left flex items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-4xl font-black mb-2">
            {isOpen ? "▼" : "▶"} {title}
          </h2>
          <p className="text-gray-400">{description}</p>
        </div>

        <div className="text-4xl font-black text-yellow-400">
          {isOpen ? "−" : "+"}
        </div>
      </button>
    );
  }

  useEffect(() => {
    const saved = localStorage.getItem("admin-access");

    if (saved === "granted") {
      setIsAuthenticated(true);
    }

    setHasCheckedAuth(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();

      const interval = setInterval(loadData, 3000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  async function loadData() {
    const { data: quizData } = await supabase.from("quiz_answers").select("*");
    const { data: drinkData } = await supabase.from("drink_answers").select("*");

    const { data: photoData } = await supabase
      .from("photo_submissions")
      .select("*")
      .order("team");

    const { data: secretMissionData } = await supabase
      .from("secret_missions")
      .select("*")
      .order("team_name");

    const { data: teamNameData } = await supabase
      .from("team_display_names")
      .select("*");

    const { data: guestData } = await supabase
      .from("music_guests")
      .select("id, name, rivieragames_team, is_active")
      .order("name");

    if (quizData) setQuizAnswers(quizData);
    if (drinkData) setDrinkAnswers(drinkData);
    if (photoData) setPhotos(photoData);
    if (secretMissionData) setSecretMissions(secretMissionData);
    if (teamNameData) setTeamDisplayNames(teamNameData);

    if (guestData) {
      setGuests(
        guestData.filter(
          (guest) => !excludedFromRivieraGames.includes(guest.name)
        )
      );
    }
  }

  async function updateGuestTeam(guestId: number, team: string | null) {
    await supabase
      .from("music_guests")
      .update({ rivieragames_team: team })
      .eq("id", guestId);

    loadData();
  }

  async function updateGuestActive(guestId: number, isActive: boolean) {
    await supabase
      .from("music_guests")
      .update({ is_active: isActive })
      .eq("id", guestId);

    loadData();
  }

  async function setPhotoScore(id: number, score: number) {
    await supabase
      .from("photo_submissions")
      .update({ photo_score: score })
      .eq("id", id);

    loadData();
  }

  async function updateSecretMission(
    teamName: string,
    field: "actual_member" | "mission_text" | "mission_completed",
    value: string | boolean | null
  ) {
    await supabase
      .from("secret_missions")
      .update({ [field]: value })
      .eq("team_name", teamName);

    loadData();
  }

  async function resetQuiz() {
    if (!confirm("Återställa quizsvaren?")) return;

    await supabase.from("quiz_answers").delete().neq("team", "");
    setQuizAnswers([]);
    loadData();
  }

  async function resetDrinks() {
    if (!confirm("Återställa dryckestestet?")) return;

    await supabase.from("drink_answers").delete().neq("team", "");
    setDrinkAnswers([]);
    loadData();
  }

  async function resetPhotos() {
    if (!confirm("Återställa alla bilduppladdningar och bildpoäng?")) return;

    await supabase.from("photo_submissions").delete().neq("team", "");
    setPhotos([]);
    loadData();
  }

  async function resetTraitors() {
    if (!confirm("Återställa Hemligt Uppdrag?")) return;

    await supabase
      .from("secret_missions")
      .update({
        guessed_member: null,
        actual_member: null,
        mission_text: null,
        mission_completed: false,
      })
      .neq("team_name", "");

    setSecretMissions([]);
    loadData();
  }

  async function resetCompetition() {
    if (!confirm("Är du säker på att du vill återställa HELA tävlingen?")) {
      return;
    }

    await supabase.from("quiz_answers").delete().neq("team", "");
    await supabase.from("drink_answers").delete().neq("team", "");
    await supabase.from("photo_submissions").delete().neq("team", "");

    await supabase
      .from("secret_missions")
      .update({
        guessed_member: null,
        actual_member: null,
        mission_text: null,
        mission_completed: false,
      })
      .neq("team_name", "");

    await supabase
      .from("game_settings")
      .update({ value: "false" })
      .eq("key", "traitors_active");

    localStorage.removeItem("team-access-gul");
    localStorage.removeItem("team-access-bla");
    localStorage.removeItem("team-access-gron");
    localStorage.removeItem("team-access-rod");

    setQuizAnswers([]);
    setDrinkAnswers([]);
    setPhotos([]);
    setSecretMissions([]);

    loadData();
  }

  function login() {
    if (pin === "8890") {
      localStorage.setItem("admin-access", "granted");
      setIsAuthenticated(true);
    } else {
      alert("Fel PIN");
    }
  }

  function getQuizScore(team: string) {
    return quizAnswers
      .filter((answer) => answer.team === team)
      .filter((answer) => {
        const question = questions.find((q) => q.id === answer.question_id);
        return question?.correctAnswer === answer.answer;
      }).length;
  }

  function getDrinkScore(team: string) {
    const drinks = drinkAnswers.find((d) => d.team === team);

    if (!drinks) return 0;

    let score = 0;

    if (drinks.drink_1 === correctDrinks.drink_1) score++;
    if (drinks.drink_2 === correctDrinks.drink_2) score++;
    if (drinks.drink_3 === correctDrinks.drink_3) score++;
    if (drinks.drink_4 === correctDrinks.drink_4) score++;

    return score;
  }

  function getPhotoScore(team: string) {
    const photo = photos.find((p) => p.team === team);
    return photo?.photo_score || 0;
  }

  function getTraitorScore(team: string) {
    const teamRow = teamInfo.find((t) => t.team === team);
    const mission = secretMissions.find((m) => m.team_name === teamRow?.name);

    if (!mission) return 0;
    if (!mission.actual_member) return 0;
    if (!mission.guessed_member) return 0;

    return mission.guessed_member === mission.actual_member ? 5 : 0;
  }

  function getTeamDisplay(team: string) {
    const custom = teamDisplayNames.find((row) => row.team === team);
    const base = teamInfo.find((row) => row.team === team);

    return {
      displayName: custom?.display_name
        ? `${custom.display_name} (${base?.name})`
        : base?.name || team,
      icon: custom?.icon || "",
      baseName: base?.name || team,
    };
  }

  function getGuestsForTeam(team: string) {
    return guests.filter(
      (guest) =>
        guest.is_active !== false &&
        guest.rivieragames_team === team
    );
  }

  if (!hasCheckedAuth) return null;

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm">
          <h1 className="text-4xl font-black text-center mb-6">
            Admin Login
          </h1>

          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN-kod"
            className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-center text-2xl mb-4"
          />

          <button
            onClick={login}
            className="w-full bg-yellow-400 text-black font-black p-4 rounded-2xl"
          >
            Logga in
          </button>
        </div>
      </main>
    );
  }

  const judgedPhotos = photos.filter((photo) => photo.photo_score !== null).length;

  const guestsWithoutTeam = guests.filter(
    (guest) => guest.is_active !== false && !guest.rivieragames_team
  );

  const inactiveGuests = guests.filter((guest) => guest.is_active === false);

  const teamSizes = teamInfo.map((team) => getGuestsForTeam(team.team).length);
  const smallestTeam = Math.min(...teamSizes);
  const largestTeam = Math.max(...teamSizes);
  const teamSizeDifference = largestTeam - smallestTeam;

  const leaderboard = teamInfo
    .map((team) => {
      const quiz = getQuizScore(team.team);
      const drinks = getDrinkScore(team.team);
      const photo = getPhotoScore(team.team);
      const traitors = getTraitorScore(team.team);

      return {
        ...team,
        quiz,
        drinks,
        photo,
        traitors,
        total: quiz + drinks + photo + traitors,
      };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto pt-8">
        <RivieraHeader />

        <h1 className="text-5xl font-black text-center mt-8 mb-10">
          🎛 ADMIN CENTER
        </h1>

        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-5">
          <SectionHeader
            section="beforeParty"
            title="🌴 Före festen"
            description="Förbered gäster, lagindelning och Hemligt Uppdrag."
          />

          {openSections.beforeParty && (
            <div className="mt-6">
              <div className="bg-zinc-800 rounded-3xl p-5 mb-6">
                <h3 className="text-3xl font-black mb-4">👥 Gäster & lag</h3>

                <div
                  className={`rounded-2xl p-4 mb-6 border ${
                    teamSizeDifference <= 1
                      ? "bg-green-500/10 border-green-500 text-green-300"
                      : "bg-yellow-500/10 border-yellow-500 text-yellow-300"
                  }`}
                >
                  <p className="font-black text-xl mb-3">👥 Lagstorlek</p>

                  <div className="space-y-1 mb-3">
                    <p>Lag Gul: {getGuestsForTeam("gul").length}</p>
                    <p>Lag Blå: {getGuestsForTeam("bla").length}</p>
                    <p>Lag Grön: {getGuestsForTeam("gron").length}</p>
                    <p>Lag Röd: {getGuestsForTeam("rod").length}</p>
                  </div>

                  <p className="font-black">
                    {teamSizeDifference <= 1
                      ? `✅ Skillnad mellan största och minsta lag: ${teamSizeDifference} person`
                      : `⚠️ Skillnad mellan största och minsta lag: ${teamSizeDifference} personer`}
                  </p>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  {teamInfo.map((team) => {
                    const display = getTeamDisplay(team.team);
                    const teamGuests = getGuestsForTeam(team.team);

                    return (
                      <div key={team.team} className="bg-zinc-900 rounded-2xl p-4">
                        <h4 className="text-xl font-black mb-2">
                          {display.icon} {display.displayName}
                        </h4>

                        <p className="text-yellow-400 font-black text-3xl mb-3">
                          {teamGuests.length}
                        </p>

                        <div className="space-y-1 text-sm text-gray-300">
                          {teamGuests.map((guest) => (
                            <p key={guest.id}>{guest.name}</p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {guestsWithoutTeam.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500 rounded-2xl p-4 mb-6">
                    <p className="text-red-300 font-black mb-2">
                      ⚠️ Aktiva gäster utan Riviera Games-lag: {guestsWithoutTeam.length}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {guestsWithoutTeam.map((guest) => (
                        <span
                          key={guest.id}
                          className="bg-red-500 text-white px-3 py-1 rounded-full font-bold"
                        >
                          {guest.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {inactiveGuests.length > 0 && (
                  <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 mb-6">
                    <p className="text-gray-300 font-black mb-2">
                      💤 Inaktiva gäster: {inactiveGuests.length}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {inactiveGuests.map((guest) => (
                        <span
                          key={guest.id}
                          className="bg-zinc-700 text-gray-300 px-3 py-1 rounded-full font-bold line-through"
                        >
                          {guest.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
  onClick={() => setShowGuestEditor((current) => !current)}
  className="w-full bg-zinc-900 hover:bg-zinc-700 text-white font-black py-4 rounded-2xl mb-4 text-left px-5"
>
  {showGuestEditor ? "▼ Dölj gästredigering" : "▶ Redigera gäster"}
</button>

{showGuestEditor && (
  <div className="grid gap-3">
                  {guests.map((guest) => (
                    <div
                      key={guest.id}
                      className={`rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
                        guest.is_active === false
                          ? "bg-zinc-950 border border-zinc-800 opacity-70"
                          : "bg-zinc-900"
                      }`}
                    >
                      <p
                        className={`text-xl font-black ${
                          guest.is_active === false
                            ? "text-gray-500 line-through"
                            : "text-white"
                        }`}
                      >
                        {guest.name}
                      </p>

                      <div className="flex flex-col md:flex-row gap-3">
                        <select
                          value={guest.rivieragames_team || ""}
                          onChange={(e) =>
                            updateGuestTeam(guest.id, e.target.value || null)
                          }
                          disabled={guest.is_active === false}
                          className="p-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-white font-black disabled:opacity-40"
                        >
                          <option value="">Inget lag</option>
                          <option value="gul">Lag Gul</option>
                          <option value="bla">Lag Blå</option>
                          <option value="gron">Lag Grön</option>
                          <option value="rod">Lag Röd</option>
                        </select>

                        <button
                          onClick={() =>
                            updateGuestActive(
                              guest.id,
                              guest.is_active === false
                            )
                          }
                          className={`px-4 py-3 rounded-2xl font-black ${
                            guest.is_active === false
                              ? "bg-green-500 text-black"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {guest.is_active === false
                            ? "Återaktivera"
                            : "Inaktivera"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>

              <div className="bg-zinc-800 rounded-3xl p-5">
                <h3 className="text-3xl font-black mb-6">
                  🎯 Hemligt Uppdrag – Admin
                </h3>
                <div className="grid md:grid-cols-2 gap-3 mb-6">
  {teamInfo.map((team) => {
    const mission = secretMissions.find(
      (m) => m.team_name === team.name
    );

    const ready =
      mission?.actual_member &&
      mission?.mission_text &&
      mission?.mission_text.trim().length > 0;

    return (
      <div
        key={team.team}
        className={`rounded-2xl p-4 font-black ${
          ready
            ? "bg-green-500 text-black"
            : "bg-yellow-500 text-black"
        }`}
      >
        {team.name}:{" "}
{ready
  ? "✅ Klar"
  : !mission?.actual_member
    ? "⚠️ Saknar person"
    : "⚠️ Saknar uppdrag"}
      </div>
    );
  })}
</div>

                <div className="grid gap-5">
                  {teamInfo.map((team) => {
                    const display = getTeamDisplay(team.team);
                    const mission = secretMissions.find(
                      (m) => m.team_name === team.name
                    );

                    const guessedMember = mission?.guessed_member;
                    const actualMember = mission?.actual_member;
                    const missionText = mission?.mission_text;
                    const missionCompleted = mission?.mission_completed || false;

                    const hasGuessed = Boolean(guessedMember);
                    const hasActual = Boolean(actualMember);
                    const isCorrect =
                      Boolean(guessedMember) &&
                      Boolean(actualMember) &&
                      guessedMember === actualMember;

                    const points = isCorrect ? 5 : 0;
                    const qualifiesForPrize =
                      Boolean(missionCompleted) &&
                      Boolean(actualMember) &&
                      !isCorrect;

                    const members = getGuestsForTeam(team.team).map(
                      (guest) => guest.name
                    );

                    return (
                      <div key={team.team} className="bg-zinc-900 rounded-3xl p-5">
                        <h4 className="text-2xl font-black mb-5">
                          {display.icon} {display.displayName}
                        </h4>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-zinc-800 rounded-2xl p-4">
                            <p className="text-sm font-bold uppercase text-gray-400 mb-2">
                              Lagets gissning
                            </p>

                            <p className="text-3xl font-black text-yellow-400">
                              {guessedMember || "Ingen gissning ännu"}
                            </p>
                          </div>

                          <div className="bg-zinc-800 rounded-2xl p-4">
                            <label className="text-sm font-bold uppercase text-gray-400 mb-2 block">
                              Lagmedlem med hemligt uppdrag
                            </label>

                            <select
                              value={actualMember || ""}
                              onChange={(e) =>
                                updateSecretMission(
                                  team.name,
                                  "actual_member",
                                  e.target.value || null
                                )
                              }
                              className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white font-black text-xl"
                            >
                              <option value="">Välj person</option>

                              {members.map((member) => (
                                <option key={member} value={member}>
                                  {member}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="bg-zinc-800 rounded-2xl p-4 mb-4">
                          <label className="text-sm font-bold uppercase text-gray-400 mb-2 block">
                            Hemligt uppdrag
                          </label>

                          <textarea
                            value={missionText || ""}
                            onChange={(e) =>
                              updateSecretMission(
                                team.name,
                                "mission_text",
                                e.target.value
                              )
                            }
                            placeholder="Skriv vilket uppdrag lagmedlemmen har haft..."
                            className="w-full min-h-28 p-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white font-bold leading-relaxed"
                          />
                        </div>

                        <div className="bg-zinc-800 rounded-2xl p-4 mb-4">
                          <p className="text-sm font-bold uppercase text-gray-400 mb-3">
                            Har uppdraget genomförts?
                          </p>

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() =>
                                updateSecretMission(
                                  team.name,
                                  "mission_completed",
                                  true
                                )
                              }
                              className={`p-4 rounded-2xl font-black text-xl ${
                                missionCompleted
                                  ? "bg-green-500 text-black"
                                  : "bg-zinc-700 text-white"
                              }`}
                            >
                              ✅ Ja
                            </button>

                            <button
                              onClick={() =>
                                updateSecretMission(
                                  team.name,
                                  "mission_completed",
                                  false
                                )
                              }
                              className={`p-4 rounded-2xl font-black text-xl ${
                                !missionCompleted
                                  ? "bg-red-500 text-white"
                                  : "bg-zinc-700 text-white"
                              }`}
                            >
                              ❌ Nej
                            </button>
                          </div>
                        </div>

                        <div
                          className={`rounded-2xl p-5 text-center ${
                            !hasGuessed || !hasActual
                              ? "bg-zinc-700 text-white"
                              : isCorrect
                                ? "bg-green-500 text-black"
                                : "bg-red-500 text-white"
                          }`}
                        >
                          <p className="text-2xl font-black mb-2">
                            {!hasGuessed
                              ? "Inväntar lagets gissning"
                              : !hasActual
                                ? "Välj rätt person"
                                : isCorrect
                                  ? "✅ Laget hittade rätt person"
                                  : "❌ Laget hittade inte rätt person"}
                          </p>

                          <p className="text-5xl font-black">{points} poäng</p>

                          {qualifiesForPrize && (
                            <p className="mt-4 text-xl font-black">
                              🎁 Kvalificerad för kvällens hemliga uppdragspris
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-5">
          <SectionHeader
            section="beforeCompetition"
            title="🏷 Innan tävlingen startar"
            description="Lagen döper sitt lag och admin kan öppna lagnamns-sidan."
          />

          {openSections.beforeCompetition && (
            <div className="mt-6">
              <a
                href="/team-names"
                className="block bg-yellow-400 text-black font-black py-4 rounded-2xl text-center hover:scale-105 transition-all"
              >
                🏷️ Lagnamn
              </a>
            </div>
          )}
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-5">
          <SectionHeader
            section="duringCompetition"
            title="🎮 Under tävlingen"
            description="Här hanteras det som sker medan lagen tävlar."
          />

          {openSections.duringCompetition && (
            <div className="mt-6">
              <div className="bg-zinc-800 rounded-3xl p-5 mb-6">
                <h3 className="text-3xl font-black mb-3">
                  📸 Att göra: Bedöm lagbilder
                </h3>

                <p className="text-gray-400 mb-5">
                  {judgedPhotos === 4
                    ? "✅ Alla lagbilder är bedömda."
                    : `⚠️ ${judgedPhotos} av 4 lagbilder är bedömda.`}
                </p>

                {photos.length === 0 ? (
                  <p className="text-gray-400">Inga lagbilder uppladdade ännu.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {photos.map((photo) => {
                      const display = getTeamDisplay(photo.team);

                      return (
                        <div
                          key={photo.id}
                          className="bg-zinc-900 rounded-3xl overflow-hidden"
                        >
                          <img
                            src={photo.image_url}
                            alt={display.displayName}
                            className="w-full h-80 object-cover"
                          />

                          <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="text-3xl font-black uppercase">
                                  {display.icon} {display.displayName}
                                </p>

                                <p className="text-gray-400 font-bold mt-1">
                                  {display.baseName}
                                </p>
                              </div>

                              <p className="text-yellow-400 font-black text-xl">
                                {photo.photo_score ?? 0} p
                              </p>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                              {[1, 2, 3, 4].map((score) => {
                                const active = photo.photo_score === score;

                                return (
                                  <button
                                    key={score}
                                    onClick={() => setPhotoScore(photo.id, score)}
                                    className={`p-4 rounded-2xl font-black text-xl transition-all ${
                                      active
                                        ? "bg-green-500 text-black scale-105"
                                        : "bg-zinc-700 text-white hover:bg-zinc-600"
                                    }`}
                                  >
                                    {score}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-5">
          <SectionHeader
            section="final"
            title="🏆 Prisutdelning & final"
            description="Showlägen och totalställning inför finalen."
          />

          {openSections.final && (
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <a href="/photo-wall" className="bg-purple-600 text-white font-black py-4 rounded-2xl text-center hover:scale-105 transition-all">
                  📸 Lagbilder
                </a>
                <a
  href="/party-gallery"
  className="bg-pink-600 text-white font-black py-4 rounded-2xl text-center hover:scale-105 transition-all"
>
  🖼️ Festgalleri
</a>

                <a href="/quiz-reveal" className="bg-blue-600 text-white font-black py-4 rounded-2xl text-center hover:scale-105 transition-all">
                  🧠 Quizresultat
                </a>

                <a href="/drink-reveal" className="bg-green-600 text-white font-black py-4 rounded-2xl text-center hover:scale-105 transition-all">
                  🍹 Dryckesresultat
                </a>

                

                <a href="/traitors-reveal" className="bg-red-600 text-white font-black py-4 rounded-2xl text-center hover:scale-105 transition-all">
                  🎯 Hemligt Uppdrag-resultat
                </a>

                <a href="/final" className="bg-yellow-500 text-black font-black py-4 rounded-2xl text-center hover:scale-105 transition-all">
                  🎉 Final
                </a>
              </div>

              

              
            </div>
          )}
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
          <SectionHeader
            section="reset"
            title="🛠 Test & återställning"
            description="Återställ enskilda moment eller hela tävlingen."
          />

          {openSections.reset && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              <button onClick={resetQuiz} className="bg-zinc-700 text-white px-4 py-4 rounded-2xl font-black">
                Återställ quiz
              </button>

              <button onClick={resetDrinks} className="bg-zinc-700 text-white px-4 py-4 rounded-2xl font-black">
                Återställ dryckestest
              </button>

              <button onClick={resetPhotos} className="bg-zinc-700 text-white px-4 py-4 rounded-2xl font-black">
                Återställ bilder
              </button>

              <button onClick={resetTraitors} className="bg-zinc-700 text-white px-4 py-4 rounded-2xl font-black">
                Återställ Hemligt Uppdrag
              </button>

              <button onClick={loadData} className="bg-zinc-800 text-white px-4 py-4 rounded-2xl font-black">
                🔄 Uppdatera
              </button>

              <button onClick={resetCompetition} className="bg-red-500 text-white px-4 py-4 rounded-2xl font-black">
                🗑 Återställ hela tävlingen
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}