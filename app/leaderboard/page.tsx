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

export default function LeaderboardPage() {
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
      quiz: getQuizScore(team),
      drinks: getDrinkScore(team),
      photo: getPhotoScore(team),
      total:
        getQuizScore(team) +
        getDrinkScore(team) +
        getPhotoScore(team),
    }))
    .sort((a, b) => b.total - a.total);

  const medals = ["🥇", "🥈", "🥉", "4️⃣"];

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-10">
        <RivieraHeader />

        <h1 className="text-5xl font-bold text-center mb-2 mt-8">
          Leaderboard
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Riviera Pool Party – Aktuell ställning
        </p>

        <div className="grid gap-4">
          {leaderboard.map((row, index) => (
            <div
              key={row.team}
              className="bg-zinc-900 p-5 rounded-2xl flex items-center justify-between"
            >
              <div>
                <p className="text-3xl font-bold uppercase">
                  {medals[index]} Lag {teamNames[row.team]}
                </p>

                <p className="text-gray-400 mt-2">
                  Quiz {row.quiz}p • Dryck {row.drinks}p • Bild {row.photo}p
                </p>
              </div>

              <div className="bg-yellow-400 text-black px-4 py-3 rounded-xl font-bold text-2xl">
                {row.total}p
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}