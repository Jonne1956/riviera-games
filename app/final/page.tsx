"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";
import { questions } from "@/app/data/quizQuestions";

const teams = ["gul", "bla", "gron", "rod"];

const teamNames: Record<string, string> = {
  gul: "Gul",
  bla: "Blå",
  gron: "Grön",
  rod: "Röd",
};

const teamColors: Record<string, string> = {
  gul: "bg-yellow-400 text-black",
  bla: "bg-blue-500 text-white",
  gron: "bg-green-500 text-white",
  rod: "bg-red-500 text-white",
};

const correctDrinks = {
  drink_1: "Öl",
  drink_2: "Sockerfri läsk",
  drink_3: "Alkoholfri öl",
  drink_4: "Läsk med socker",
};

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
  photo_score: number | null;
};

type TraitorVote = {
  team: string;
  points: number;
};

type LeaderboardRow = {
  team: string;
  total: number;
};

export default function FinalPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [drinkAnswers, setDrinkAnswers] = useState<DrinkAnswer[]>([]);
  const [photos, setPhotos] = useState<PhotoSubmission[]>([]);
  const [traitorVotes, setTraitorVotes] = useState<TraitorVote[]>([]);

  async function loadData() {
    const { data: quizData } = await supabase.from("quiz_answers").select("*");
    const { data: drinkData } = await supabase.from("drink_answers").select("*");
    const { data: photoData } = await supabase.from("photo_submissions").select("*");
    const { data: traitorData } = await supabase.from("traitor_votes").select("*");

    if (quizData) setQuizAnswers(quizData);
    if (drinkData) setDrinkAnswers(drinkData);
    if (photoData) setPhotos(photoData);
    if (traitorData) setTraitorVotes(traitorData);

    function getQuizScore(team: string) {
      return (quizData || [])
        .filter((answer) => answer.team === team)
        .filter((answer) => {
          const question = questions.find((q) => q.id === answer.question_id);
          return question?.correctAnswer === answer.answer;
        }).length;
    }

    function getDrinkScore(team: string) {
      const drinks = (drinkData || []).find((d) => d.team === team);

      if (!drinks) return 0;

      let score = 0;

      if (drinks.drink_1 === correctDrinks.drink_1) score++;
      if (drinks.drink_2 === correctDrinks.drink_2) score++;
      if (drinks.drink_3 === correctDrinks.drink_3) score++;
      if (drinks.drink_4 === correctDrinks.drink_4) score++;

      return score;
    }

    function getPhotoScore(team: string) {
      const photo = (photoData || []).find((p) => p.team === team);
      return photo?.photo_score || 0;
    }

    function getTraitorScore(team: string) {
      const vote = (traitorData || []).find((v) => v.team === team);
      return vote?.points || 0;
    }

    const results = teams
      .map((team) => ({
        team,
        total:
          getQuizScore(team) +
          getDrinkScore(team) +
          getPhotoScore(team) +
          getTraitorScore(team),
      }))
      .sort((a, b) => b.total - a.total);

    setLeaderboard(results);
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 3000);

    return () => clearInterval(interval);
  }, []);

  const winner = leaderboard[0];
  const rest = leaderboard.slice(1);

  return (
    <main className="min-h-screen bg-black text-white p-6 overflow-hidden">
      <a
        href="/admin"
        className="fixed top-4 left-4 z-50 bg-zinc-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition-all"
      >
        ←
      </a>

      <button
        onClick={() => {
          const audio = new Audio("/sounds/winner.mp3");
          audio.volume = 0.7;
          audio.play();
        }}
        className="fixed top-4 right-4 z-50 bg-yellow-400 text-black w-12 h-12 rounded-full font-black text-xl shadow-2xl hover:scale-110 transition-all"
      >
        🔊
      </button>

      <div className="max-w-2xl mx-auto pt-8 relative z-10">
        <RivieraHeader />

        <h1 className="text-5xl font-black text-center mt-10">
          FINALRESULTAT
        </h1>

        {winner && (
          <section
            className={`${teamColors[winner.team]} p-8 rounded-[2rem] text-center mt-10 mb-8 shadow-2xl`}
          >
            <p className="text-6xl mb-4">🏆</p>

            <p className="uppercase font-black tracking-wide">
              Vinnare
            </p>

            <h2 className="text-5xl font-black mt-3">
              LAG {teamNames[winner.team].toUpperCase()}
            </h2>

            <p className="text-5xl font-black mt-6">
              {winner.total} p
            </p>
          </section>
        )}

        <div className="grid gap-4">
          {rest.map((row, index) => (
            <div
              key={row.team}
              className="bg-zinc-900 p-5 rounded-2xl flex justify-between items-center"
            >
              <span className="text-2xl font-black uppercase">
                {index + 2}. Lag {teamNames[row.team]}
              </span>

              <span
                className={`${teamColors[row.team]} px-4 py-3 rounded-xl font-black text-xl`}
              >
                {row.total} p
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}