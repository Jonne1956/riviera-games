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

type LeaderboardRow = {
  team: string;
  quiz: number;
  drinks: number;
  photo: number;
  total: number;
};

export default function PreTraitorsPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);

  async function loadData() {
    const { data: quizData } = await supabase.from("quiz_answers").select("*");
    const { data: drinkData } = await supabase.from("drink_answers").select("*");
    const { data: photoData } = await supabase.from("photo_submissions").select("*");

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

    const results = teams
      .map((team) => {
        const quiz = getQuizScore(team);
        const drinks = getDrinkScore(team);
        const photo = getPhotoScore(team);

        return {
          team,
          quiz,
          drinks,
          photo,
          total: quiz + drinks + photo,
        };
      })
      .sort((a, b) => b.total - a.total);

    setLeaderboard(results);
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 3000);

    return () => clearInterval(interval);
  }, []);

  const leader = leaderboard[0];
  const rest = leaderboard.slice(1);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <a
        href="/admin"
        className="fixed top-4 left-4 z-50 bg-zinc-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition-all"
      >
        ←
      </a>

      <div className="max-w-4xl mx-auto pt-8">
        <RivieraHeader />

        <p className="text-center text-yellow-400 font-black uppercase tracking-wide mt-10">
          Efter tre moment
        </p>

        <h1 className="text-5xl font-black text-center mt-3 mb-8">
          STÄLLNING FÖRE THE TRAITORS
        </h1>

        {leader && (
          <section
            className={`${teamColors[leader.team]} rounded-[2rem] p-8 text-center mb-8 shadow-2xl`}
          >
            <p className="text-5xl mb-4">🏆</p>

            <p className="uppercase font-black tracking-wide">
              Leder just nu
            </p>

            <h2 className="text-5xl font-black mt-3">
              LAG {teamNames[leader.team].toUpperCase()}
            </h2>

            <p className="text-5xl font-black mt-6">
              {leader.total} p
            </p>

            <div className="flex justify-center gap-5 mt-5 text-sm font-bold opacity-80">
              <span>🧠 Quiz: {leader.quiz}</span>
              <span>🍹 Dryck: {leader.drinks}</span>
              <span>📸 Bild: {leader.photo}</span>
            </div>
          </section>
        )}

        <div className="grid gap-4">
          {rest.map((row, index) => (
            <div
              key={row.team}
              className="bg-zinc-900 rounded-3xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-2xl font-black uppercase">
                  {index + 2}. Lag {teamNames[row.team]}
                </p>

                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                  <span>🧠 Quiz: {row.quiz}</span>
                  <span>🍹 Dryck: {row.drinks}</span>
                  <span>📸 Bild: {row.photo}</span>
                </div>
              </div>

              <div
                className={`${teamColors[row.team]} rounded-2xl px-5 py-3 text-2xl font-black`}
              >
                {row.total} p
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center">
          <p className="text-2xl font-black text-yellow-400">
            🕵️ Ett moment återstår...
          </p>

          <p className="text-gray-400 mt-2">
            The Traitors kan fortfarande förändra allt.
          </p>
        </div>
      </div>
    </main>
  );
}