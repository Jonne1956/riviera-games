"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";

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
  team: string;
  image_url: string;
  photo_score: number | null;
};

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [drinkAnswers, setDrinkAnswers] = useState<DrinkAnswer[]>([]);
  const [photos, setPhotos] = useState<PhotoSubmission[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("admin-access");

    if (saved === "granted") {
      setIsAuthenticated(true);
    }

    setHasCheckedAuth(true);
  }, []);

  async function loadData() {
    const { data: quizData } = await supabase
      .from("quiz_answers")
      .select("*");

    const { data: drinkData } = await supabase
      .from("drink_answers")
      .select("*");

    const { data: photoData } = await supabase
      .from("photo_submissions")
      .select("*");

    if (quizData) setQuizAnswers(quizData);
    if (drinkData) setDrinkAnswers(drinkData);
    if (photoData) setPhotos(photoData);
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  async function resetCompetition() {
    if (!confirm("Är du säker på att du vill återställa tävlingen?")) {
      return;
    }

    await supabase.from("quiz_answers").delete().neq("team", "");
    await supabase.from("drink_answers").delete().neq("team", "");
    await supabase.from("photo_submissions").delete().neq("team", "");

    localStorage.removeItem("team-access-gul");
    localStorage.removeItem("team-access-bla");
    localStorage.removeItem("team-access-gron");
    localStorage.removeItem("team-access-rod");

    setQuizAnswers([]);
    setDrinkAnswers([]);
    setPhotos([]);
  }

  function login() {
    if (pin === "8890") {
      localStorage.setItem("admin-access", "granted");
      setIsAuthenticated(true);
    } else {
      alert("Fel PIN");
    }
  }

  if (!hasCheckedAuth) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
  <h2 className="text-3xl font-black mb-6">
    🏆 LIVE LEADERBOARD
  </h2>

  <div className="grid gap-4">
    {[
      {
        team: "rod",
        name: "Lag Röd",
        color: "bg-red-500",
      },
      {
        team: "bla",
        name: "Lag Blå",
        color: "bg-blue-500",
      },
      {
        team: "gul",
        name: "Lag Gul",
        color: "bg-yellow-400 text-black",
      },
      {
        team: "gron",
        name: "Lag Grön",
        color: "bg-green-500",
      },
    ].map((teamData) => {
      const quizPoints = quizAnswers.filter(
        (q) => q.team === teamData.team
      ).length;

      const drinkDone = drinkAnswers.some(
        (d) => d.team === teamData.team
      );

      const photoDone = photos.some(
        (p) => p.team === teamData.team
      );

      const total =
        quizPoints +
        (drinkDone ? 1 : 0) +
        (photoDone ? 1 : 0);

      return (
        <div
          key={teamData.team}
          className="bg-zinc-800 rounded-2xl p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div
              className={`${teamData.color} w-5 h-5 rounded-full`}
            />

            <div>
              <p className="text-2xl font-black">
                {teamData.name}
              </p>

              <div className="flex gap-2 mt-1 text-sm">
                <span>
                  🧠 {quizPoints} quiz
                </span>

                <span>
                  🍹 {drinkDone ? "klart" : "-"}
                </span>

                <span>
                  📸 {photoDone ? "klart" : "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-4xl font-black text-yellow-400">
            {total} p
          </div>
        </div>
      );
    })}
  </div>
</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto pt-8">
        <RivieraHeader />

        <h1 className="text-5xl font-black text-center mt-8 mb-8">
          🎛 ADMIN CENTER
        </h1>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <a
            href="/leaderboard"
            className="bg-yellow-400 text-black px-4 py-3 rounded-xl font-bold text-center"
          >
            🏆 Leaderboard
          </a>

          <a
            href="/final"
            className="bg-yellow-400 text-black px-4 py-3 rounded-xl font-bold text-center"
          >
            🎉 Final
          </a>

          <a
            href="/photo-wall"
            className="bg-yellow-400 text-black px-4 py-3 rounded-xl font-bold text-center"
          >
            📸 Photo Wall
          </a>

          <a
            href="/drink-reveal"
            className="bg-yellow-400 text-black px-4 py-3 rounded-xl font-bold text-center"
          >
            🍹 Drink Reveal
          </a>

          <button
            onClick={loadData}
            className="bg-zinc-800 text-white px-4 py-3 rounded-xl font-bold"
          >
            Uppdatera
          </button>

          <button
            onClick={resetCompetition}
            className="bg-red-500 text-white px-4 py-3 rounded-xl font-bold"
          >
            Återställ tävling
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h2 className="text-3xl font-black mb-6">
            📊 Live Status
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-zinc-800 rounded-2xl p-5 text-center">
              <p className="text-gray-400 mb-2">Quizsvar</p>

              <p className="text-5xl font-black text-yellow-400">
                {quizAnswers.length}
              </p>
            </div>

            <div className="bg-zinc-800 rounded-2xl p-5 text-center">
              <p className="text-gray-400 mb-2">Drycksvar</p>

              <p className="text-5xl font-black text-yellow-400">
                {drinkAnswers.length}
              </p>
            </div>

            <div className="bg-zinc-800 rounded-2xl p-5 text-center">
              <p className="text-gray-400 mb-2">Uppladdade bilder</p>

              <p className="text-5xl font-black text-yellow-400">
                {photos.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}