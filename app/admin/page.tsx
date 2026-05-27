"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { questions } from "@/app/data/quizQuestions";

type QuizAnswer = {
  id: number;
  team: string;
  question_id: number;
  answer: string;
};

type DrinkAnswer = {
  id: number;
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

const teams = ["gul", "bla", "gron", "rod"];


const correctDrinks = {
  drink_1: "Öl",
  drink_2: "Sockerfri läsk",
  drink_3: "Alkoholfri öl",
  drink_4: "Läsk med socker",
};

export default function AdminPage() {
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [drinkAnswers, setDrinkAnswers] = useState<DrinkAnswer[]>([]);
  const [photos, setPhotos] = useState<PhotoSubmission[]>([]);
  const [statusMessage, setStatusMessage] = useState("");

  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function loadData() {
    const { data: answerData } = await supabase
      .from("quiz_answers")
      .select("*");

    const { data: drinkData } = await supabase
      .from("drink_answers")
      .select("*");

    const { data: photoData } = await supabase
      .from("photo_submissions")
      .select("*");

    if (answerData) setAnswers(answerData);
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
    return answers
      .filter((answer) => answer.team === team)
      .filter((answer) => {
        const question = questions.find(
          (q) => q.id === answer.question_id
        );

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

  function getTotalScore(team: string) {
    return (
      getQuizScore(team) +
      getDrinkScore(team) +
      getPhotoScore(team)
    );
  }

  async function savePhotoScore(
    photoId: number,
    score: number,
    team: string
  ) {
    const { error } = await supabase
      .from("photo_submissions")
      .update({ photo_score: score })
      .eq("id", photoId);

    if (error) {
      alert("Kunde inte spara poäng");
      return;
    }

    setPhotos((currentPhotos) =>
      currentPhotos.map((photo) =>
        photo.id === photoId
          ? { ...photo, photo_score: score }
          : photo
      )
    );

    setStatusMessage(
      `Fotopoäng sparad för lag ${team.toUpperCase()} ✅`
    );

    setTimeout(() => {
      setStatusMessage("");
    }, 2500);
  }

  async function resetCompetition() {
    const confirmed = confirm(
      "Är du säker på att du vill återställa hela tävlingen?"
    );

    if (!confirmed) return;

    await supabase
      .from("quiz_answers")
      .delete()
      .gte("id", 0);

    await supabase
      .from("drink_answers")
      .delete()
      .gte("id", 0);

    await supabase
      .from("photo_submissions")
      .delete()
      .gte("id", 0);

    localStorage.removeItem("team-access-gul");
localStorage.removeItem("team-access-bla");
localStorage.removeItem("team-access-gron");
localStorage.removeItem("team-access-rod");
setAnswers([]);
    setDrinkAnswers([]);
    setPhotos([]);

    setStatusMessage("Tävlingen återställd ✅");

    setTimeout(() => {
      setStatusMessage("");
    }, 2500);
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 p-8 rounded-3xl w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Riviera Games Admin
          </h1>

          <input
            type="password"
            placeholder="Ange PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full bg-zinc-800 p-4 rounded-xl mb-4 text-white"
          />

          <button
            onClick={() => {
              if (pin === "8890") {
                setIsAuthenticated(true);
              } else {
                alert("Fel PIN-kod");
              }
            }}
            className="w-full bg-yellow-400 text-black p-4 rounded-xl font-bold"
          >
            Logga in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="sticky top-0 z-10 bg-black pb-4">
        <h1 className="text-4xl font-bold mb-4">
          Riviera Games Control Center
        </h1>

        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="bg-yellow-400 text-black px-4 py-3 rounded-xl font-bold"
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

        {statusMessage && (
          <div className="mt-4 bg-green-500 text-white p-4 rounded-xl font-bold">
            {statusMessage}
          </div>
        )}
      </div>

      <div className="grid gap-6 mt-6">
        {teams.map((team) => {
          const teamAnswers = answers.filter(
            (answer) => answer.team === team
          );

          const quizScore = getQuizScore(team);
          const drinkScore = getDrinkScore(team);
          const photoScore = getPhotoScore(team);
          const totalScore = getTotalScore(team);

          const photo = photos.find(
            (p) => p.team === team
          );

          return (
            <section
              key={team}
              className="bg-zinc-900 p-5 rounded-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold uppercase">
                  Lag {team}
                </h2>

                <div className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-bold">
                  Totalt: {totalScore} p
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-zinc-800 p-3 rounded-xl text-center">
                  <p className="text-gray-400 text-sm">
                    Quiz
                  </p>
                  <p className="text-2xl font-bold">
                    {quizScore}
                  </p>
                </div>

                <div className="bg-zinc-800 p-3 rounded-xl text-center">
                  <p className="text-gray-400 text-sm">
                    Dryck
                  </p>
                  <p className="text-2xl font-bold">
                    {drinkScore}
                  </p>
                </div>

                <div className="bg-zinc-800 p-3 rounded-xl text-center">
                  <p className="text-gray-400 text-sm">
                    Bild
                  </p>
                  <p className="text-2xl font-bold">
                    {photoScore}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 mb-6">
                {questions.map((question) => {
                  const answer = teamAnswers.find(
                    (a) =>
                      a.question_id === question.id
                  );

                  const isCorrect =
                    answer?.answer ===
                    question.correctAnswer;

                  return (
                    <div
                      key={question.id}
                      className="bg-zinc-800 p-3 rounded-xl flex justify-between gap-4"
                    >
                      <span>
                        question.text
                      </span>

                      {answer ? (
                        <span className="font-bold whitespace-nowrap">
                          {answer.answer}{" "}
                          {isCorrect ? "✅" : "❌"}
                        </span>
                      ) : (
                        <span className="text-gray-400 whitespace-nowrap">
                          Ej svarat
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-zinc-700 pt-5">
                <h3 className="text-xl font-bold mb-3">
                  Gruppbild
                </h3>

                {photo ? (
                  <div className="grid gap-4">
                    <img
                      src={photo.image_url}
                      alt={`Gruppbild för lag ${team}`}
                      className="w-full rounded-2xl border border-zinc-700"
                    />

                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((score) => (
                        <button
                          key={score}
                          onClick={() =>
                            savePhotoScore(
                              photo.id,
                              score,
                              team
                            )
                          }
                          className={`p-3 rounded-xl font-bold ${
                            photo.photo_score === score
                              ? "bg-green-500"
                              : "bg-zinc-800"
                          }`}
                        >
                          {score} p
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">
                    Ingen bild uppladdad ännu.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}