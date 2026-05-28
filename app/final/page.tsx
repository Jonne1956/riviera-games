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

export default function FinalPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  async function loadData() {
    const { data: quizAnswers } = await supabase
      .from("quiz_answers")
      .select("*");

    const { data: drinkAnswers } = await supabase
      .from("drink_answers")
      .select("*");

    const { data: photos } = await supabase
      .from("photo_submissions")
      .select("*");

    function getQuizScore(team: string) {
      return (
        quizAnswers
          ?.filter((a) => a.team === team)
          .filter((a) => {
            const question = questions.find(
              (q) => q.id === a.question_id
            );

            return question?.correctAnswer === a.answer;
          }).length || 0
      );
    }

    function getDrinkScore(team: string) {
      const drinks = drinkAnswers?.find((d) => d.team === team);

      if (!drinks) return 0;

      let score = 0;

      if (drinks.drink_1 === correctDrinks.drink_1) score++;
      if (drinks.drink_2 === correctDrinks.drink_2) score++;
      if (drinks.drink_3 === correctDrinks.drink_3) score++;
      if (drinks.drink_4 === correctDrinks.drink_4) score++;

      return score;
    }

    function getPhotoScore(team: string) {
      const photo = photos?.find((p) => p.team === team);

      return photo?.photo_score || 0;
    }

    const results = teams
      .map((team) => ({
        team,
        total:
          getQuizScore(team) +
          getDrinkScore(team) +
          getPhotoScore(team),
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
      

      <div className="max-w-2xl mx-auto pt-8 relative z-10">
        <RivieraHeader />
        <a
  href="/admin"
  className="fixed top-4 left-4 z-50 bg-zinc-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition-all"
>
  ←
</a>

        <h1 className="text-5xl font-black text-center mt-10">
          FINALRESULTAT
        </h1>
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

        
        {winner && (
          <section
            className={`${teamColors[winner.team]} p-8 rounded-[2rem] text-center mt-10 mb-8 shadow-2xl`}
          >
            <p className="text-6xl mb-3">🏆</p>

            <p className="uppercase font-black tracking-widest text-sm">
              Vinnare
            </p>

            <h2 className="text-5xl font-black uppercase mt-2">
              Lag {teamNames[winner.team]}
            </h2>

            <p className="text-5xl font-black mt-4">
              {winner.total} p
            </p>
          </section>
        )}

        <div className="grid gap-3 mt-8 max-w-md mx-auto">
          {rest.map((row, index) => (
            <div
              key={row.team}
              className="bg-zinc-900 p-4 rounded-2xl flex justify-between items-center"
            >
              <span className="text-xl font-bold uppercase">
                {index + 2}. Lag {teamNames[row.team]}
              </span>

              <span
                className={`${teamColors[row.team]} px-4 py-2 rounded-xl font-bold`}
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