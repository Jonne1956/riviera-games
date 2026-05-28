"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";

type DrinkAnswer = {
  team: string;
  drink_1: string;
  drink_2: string;
  drink_3: string;
  drink_4: string;
};

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

const correctAnswers = {
  drink_1: "Öl",
  drink_2: "Sockerfri läsk",
  drink_3: "Alkoholfri öl",
  drink_4: "Läsk med socker",
};

export default function DrinkRevealPage() {
  const [answers, setAnswers] = useState<DrinkAnswer[]>([]);

  async function loadAnswers() {
    const { data } = await supabase
      .from("drink_answers")
      .select("*");

    if (data) setAnswers(data);
  }

  useEffect(() => {
    loadAnswers();

    const interval = setInterval(loadAnswers, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto pt-8">
        <RivieraHeader />

        <h1 className="text-5xl font-black text-center mt-10 mb-10">
          🍹 DRINK REVEAL
        </h1>

        <div className="grid gap-6">
          {answers.map((team) => (
            <div
              key={team.team}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
            >
              <div
                className={`${teamColors[team.team]} rounded-2xl px-5 py-3 inline-block mb-6`}
              >
                <h2 className="text-3xl font-black uppercase">
                  Lag {teamNames[team.team]}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    label: "🥂 Drink 1",
                    answer: team.drink_1,
                    correct: correctAnswers.drink_1,
                  },
                  {
                    label: "🍺 Drink 2",
                    answer: team.drink_2,
                    correct: correctAnswers.drink_2,
                  },
                  {
                    label: "🍹 Drink 3",
                    answer: team.drink_3,
                    correct: correctAnswers.drink_3,
                  },
                  {
                    label: "🧃 Drink 4",
                    answer: team.drink_4,
                    correct: correctAnswers.drink_4,
                  },
                ].map((drink) => {
                  const isCorrect = drink.answer === drink.correct;

                  return (
                    <div
                      key={drink.label}
                      className={`p-5 rounded-2xl border text-xl font-bold ${
                        isCorrect
                          ? "bg-green-900 border-green-500 text-green-100"
                          : "bg-red-900 border-red-500 text-red-100"
                      }`}
                    >
                      <p className="text-sm uppercase opacity-70 mb-2">
                        {drink.label}
                      </p>

                      <p className="text-2xl">
                        {drink.answer}
                      </p>

                      <p className="mt-3 text-lg">
                        {isCorrect ? "✅ Rätt" : `❌ Rätt svar: ${drink.correct}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}