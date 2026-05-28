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
  id: number;
  team: string;
  image_url: string;
  photo_score: number | null;
};

type TeamRow = {
  team: string;
  name: string;
  color: string;
  quizPoints: number;
  drinkPoints: number;
  photoPoints: number;
  total: number;
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

  useEffect(() => {
    if (isAuthenticated) {
      loadData();

      const interval = setInterval(loadData, 3000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

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

  const teams: TeamRow[] = [
    {
      team: "rod",
      name: "Lag Röd",
      color: "bg-red-500",
      quizPoints: quizAnswers.filter((q) => q.team === "rod").length,
      drinkPoints: drinkAnswers.some((d) => d.team === "rod") ? 1 : 0,
      photoPoints:
        photos.find((p) => p.team === "rod")?.photo_score || 0,
      total: 0,
    },
    {
      team: "bla",
      name: "Lag Blå",
      color: "bg-blue-500",
      quizPoints: quizAnswers.filter((q) => q.team === "bla").length,
      drinkPoints: drinkAnswers.some((d) => d.team === "bla") ? 1 : 0,
      photoPoints:
        photos.find((p) => p.team === "bla")?.photo_score || 0,
      total: 0,
    },
    {
      team: "gul",
      name: "Lag Gul",
      color: "bg-yellow-400",
      quizPoints: quizAnswers.filter((q) => q.team === "gul").length,
      drinkPoints: drinkAnswers.some((d) => d.team === "gul") ? 1 : 0,
      photoPoints:
        photos.find((p) => p.team === "gul")?.photo_score || 0,
      total: 0,
    },
    {
      team: "gron",
      name: "Lag Grön",
      color: "bg-green-500",
      quizPoints: quizAnswers.filter((q) => q.team === "gron").length,
      drinkPoints: drinkAnswers.some((d) => d.team === "gron") ? 1 : 0,
      photoPoints:
        photos.find((p) => p.team === "gron")?.photo_score || 0,
      total: 0,
    },
  ].map((team) => ({
    ...team,
    total:
      team.quizPoints +
      team.drinkPoints +
      team.photoPoints,
  }));

  teams.sort((a, b) => b.total - a.total);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto pt-8">
        <RivieraHeader />

        <h1 className="text-5xl font-black text-center mt-8 mb-10">
          🎛 ADMIN CENTER
        </h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
          <h2 className="text-3xl font-black mb-6">
            🎭 Showläge
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <a
              href="/final"
              className="bg-yellow-400 text-black px-4 py-4 rounded-2xl font-black text-center"
            >
              🎉 Final
            </a>

            <a
              href="/photo-wall"
              className="bg-yellow-400 text-black px-4 py-4 rounded-2xl font-black text-center"
            >
              📸 Photo Wall
            </a>

            <a
              href="/drink-reveal"
              className="bg-yellow-400 text-black px-4 py-4 rounded-2xl font-black text-center"
            >
              🍹 Drink Reveal
            </a>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black">
              📸 Bedöm lagbilder
            </h2>

            <button
              onClick={loadData}
              className="bg-zinc-700 px-4 py-2 rounded-xl font-bold"
            >
              Uppdatera
            </button>
          </div>

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
                      const active =
                        photo.photo_score === score;

                      return (
                        <button
                          key={score}
                          onClick={() =>
                            setPhotoScore(photo.id, score)
                          }
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
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
          <h2 className="text-3xl font-black mb-6">
            🏆 Totalställning
          </h2>

          <div className="grid gap-4">
            {teams.map((team, index) => (
              <div
                key={team.team}
                className={`rounded-3xl p-5 flex items-center justify-between ${
                  index === 0
                    ? "bg-yellow-400 text-black"
                    : "bg-zinc-800"
                }`}
              >
                <div>
                  <p className="text-3xl font-black">
                    {team.name}
                  </p>

                  <div className="flex gap-4 mt-2 text-sm opacity-80">
                    <span>
                      🧠 Quiz: {team.quizPoints}
                    </span>

                    <span>
                      🍹 Dryck: {team.drinkPoints}
                    </span>

                    <span>
                      📸 Bild: {team.photoPoints}
                    </span>
                  </div>
                </div>

                <div className="text-5xl font-black">
                  {team.total}
                </div>
              </div>
            ))}
          </div>
        </div>

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