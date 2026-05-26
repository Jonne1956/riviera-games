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
  team: string;
  photo_score: number | null;
};

const teams = ["gul", "bla", "gron", "rod"];

const teamNames: Record<string, string> = {
  gul: "Gul",
  bla: "Blå",
  gron: "Grön",
  rod: "Röd",
};


const correctDrinks = {
  drink_1: "Öl",
  drink_2: "Sockerfri läsk",
  drink_3: "Alkoholfri öl",
  drink_4: "Läsk med socker",
};

export default function FinalPage() {
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [drinkAnswers, setDrinkAnswers] = useState<DrinkAnswer[]>([]);
  const [photos, setPhotos] = useState<PhotoSubmission[]>([]);

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
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  function getQuizScore(team: string) {
    return quizAnswers
      .filter((answer) => answer.team === team)
      .filter((answer) => {
        const question = questions.find(
          (q) => q.id === answer.question_id
        );

        return question?.correctAnswer === answer.answer;
      }).length;
  }

  function getDrinkScore(team: string) {
    const drinks = drinkAnswers.find(
      (d) => d.team === team
    );

    if (!drinks) return 0;

    let score = 0;

    if (drinks.drink_1 === correctDrinks.drink_1) score++;
    if (drinks.drink_2 === correctDrinks.drink_2) score++;
    if (drinks.drink_3 === correctDrinks.drink_3) score++;
    if (drinks.drink_4 === correctDrinks.drink_4) score++;

    return score;
  }

  function getPhotoScore(team: string) {
    const photo = photos.find(
      (p) => p.team === team
    );

    return photo?.photo_score || 0;
  }

  const leaderboard = teams
    .map((team) => ({
      team,
      total:
        getQuizScore(team) +
        getDrinkScore(team) +
        getPhotoScore(team),
    }))
    .sort((a, b) => b.total - a.total);

  const winner = leaderboard[0];

  return (
    <main className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
      <div className="max-w-3xl w-full text-center">
        <RivieraHeader />

        <div className="text-7xl mb-6">
          🎉🏆🎉
        </div>

        <p className="text-yellow-400 font-bold uppercase tracking-widest mb-3">
          Riviera Games Champions
        </p>

        <h1 className="text-[70px] md:text-[120px] font-black uppercase leading-none text-yellow-400">
          Lag {teamNames[winner.team]}
        </h1>

        <p className="text-4xl font-bold mt-6">
          {winner.total} poäng
        </p>

        <p className="text-gray-400 text-xl mt-4">
          Stort grattis – ni är kvällens vinnare! 🌴🥂
        </p>

        <div className="grid gap-3 mt-10 max-w-md mx-auto">
          {leaderboard.map((row, index) => (
            <div
              key={row.team}
              className="bg-zinc-900 p-4 rounded-2xl flex justify-between items-center"
            >
              <span className="text-xl font-bold uppercase">
                {index + 1}. Lag {teamNames[row.team]}
              </span>

              <span className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-bold">
                {row.total} p
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}