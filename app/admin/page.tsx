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

type TraitorVote = {
  team: string;
  suspect_name: string;
  is_correct: boolean;
  points: number;
};

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

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [drinkAnswers, setDrinkAnswers] = useState<DrinkAnswer[]>([]);
  const [photos, setPhotos] = useState<PhotoSubmission[]>([]);
  const [traitorVotes, setTraitorVotes] = useState<TraitorVote[]>([]);
  const [traitorsActive, setTraitorsActive] = useState(false);

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

    const { data: drinkData } = await supabase
      .from("drink_answers")
      .select("*");

    const { data: photoData } = await supabase
      .from("photo_submissions")
      .select("*")
      .order("team");

    const { data: traitorData } = await supabase
      .from("traitor_votes")
      .select("*");

    const { data: settingData } = await supabase
      .from("game_settings")
      .select("value")
      .eq("key", "traitors_active")
      .single();

    if (quizData) setQuizAnswers(quizData);
    if (drinkData) setDrinkAnswers(drinkData);
    if (photoData) setPhotos(photoData);
    if (traitorData) setTraitorVotes(traitorData);
    if (settingData) setTraitorsActive(settingData.value === "true");
  }

  async function toggleTraitors() {
    const newValue = !traitorsActive;

    await supabase
      .from("game_settings")
      .update({ value: newValue ? "true" : "false" })
      .eq("key", "traitors_active");

    setTraitorsActive(newValue);
  }

  async function setPhotoScore(id: number, score: number) {
    await supabase
      .from("photo_submissions")
      .update({ photo_score: score })
      .eq("id", id);

    loadData();
  }

  async function resetCompetition() {
    if (!confirm("Är du säker på att du vill återställa tävlingen?")) {
      return;
    }

    await supabase.from("quiz_answers").delete().neq("team", "");
    await supabase.from("drink_answers").delete().neq("team", "");
    await supabase.from("photo_submissions").delete().neq("team", "");
    await supabase.from("traitor_votes").delete().neq("team", "");

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
    setTraitorVotes([]);
    setTraitorsActive(false);
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
    const vote = traitorVotes.find((v) => v.team === team);
    return vote?.points || 0;
  }

  if (!hasCheckedAuth) {
    return null;
  }

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

        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
          <h2 className="text-3xl font-black mb-6">🎭 Showläge</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">

  <a
    href="/photo-wall"
    className="bg-purple-600 text-white font-black py-4 rounded-2xl text-center hover:scale-105 transition-all"
  >
    📸 Photo Wall
  </a>

  <a
    href="/quiz-reveal"
    className="bg-blue-600 text-white font-black py-4 rounded-2xl text-center hover:scale-105 transition-all"
  >
    🧠 Quiz Reveal
  </a>

  <a
    href="/drink-reveal"
    className="bg-green-600 text-white font-black py-4 rounded-2xl text-center hover:scale-105 transition-all"
  >
    🍹 Drink Reveal
  </a>

  <a
    href="/pre-traitors"
    className="bg-yellow-400 text-black font-black py-4 rounded-2xl text-center hover:scale-105 transition-all"
  >
    🏆 Före Traitors
  </a>

  <a
    href="/traitors-reveal"
    className="bg-red-600 text-white font-black py-4 rounded-2xl text-center hover:scale-105 transition-all"
  >
    🕵️ The Traitors Reveal
  </a>

  <a
    href="/final"
    className="bg-yellow-500 text-black font-black py-4 rounded-2xl text-center hover:scale-105 transition-all"
  >
    🎉 Final
  </a>

</div>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
          <h2 className="text-3xl font-black mb-4">
            🕵️ The Traitors
          </h2>

          <p className="text-gray-400 mb-5">
            Momentet är {traitorsActive ? "aktivt" : "dolt"} för lagen.
          </p>

          <button
            onClick={toggleTraitors}
            className={`w-full p-5 rounded-3xl font-black text-xl ${
              traitorsActive
                ? "bg-red-500 text-white"
                : "bg-yellow-400 text-black"
            }`}
          >
            {traitorsActive
              ? "🕵️ Dölj The Traitors"
              : "🕵️ Aktivera The Traitors"}
          </button>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black">📸 Bedöm lagbilder</h2>

            <button
              onClick={loadData}
              className="bg-zinc-700 px-4 py-2 rounded-xl font-bold"
            >
              Uppdatera
            </button>
          </div>

          {photos.length === 0 ? (
            <p className="text-gray-400">Inga lagbilder uppladdade ännu.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-zinc-800 rounded-3xl overflow-hidden"
                >
                  <img
                    src={photo.image_url}
                    alt={photo.team}
                    className="w-full h-80 object-cover"
                  />

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-3xl font-black uppercase">
                        Lag {photo.team}
                      </p>

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
              ))}
            </div>
          )}
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
          <h2 className="text-3xl font-black mb-6">🏆 Totalställning</h2>

          <div className="grid gap-4">
            {leaderboard.map((team, index) => (
              <div
                key={team.team}
                className={`rounded-3xl p-5 flex items-center justify-between ${
                  index === 0 ? `${team.color}` : "bg-zinc-800 text-white"
                }`}
              >
                <div>
                  <p className="text-3xl font-black">{team.name}</p>

                  <div className="flex flex-wrap gap-4 mt-2 text-sm opacity-80">
                    <span>🧠 Quiz: {team.quiz}</span>
                    <span>🍹 Dryck: {team.drinks}</span>
                    <span>📸 Bild: {team.photo}</span>
                    <span>🕵️ Förrädare: {team.traitors}</span>
                  </div>
                </div>

                <div className="text-5xl font-black">{team.total}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={loadData}
            className="bg-zinc-800 text-white px-4 py-4 rounded-2xl font-black"
          >
            🔄 Uppdatera
          </button>

          <button
            onClick={resetCompetition}
            className="bg-red-500 text-white px-4 py-4 rounded-2xl font-black"
          >
            🗑 Återställ tävling
          </button>
        </div>
      </div>
    </main>
  );
}