"use client";

import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import RivieraHeader from "@/app/components/RivieraHeader";

const questions = [
  {
    id: 1,
    text: "Vilken stad är Sveriges huvudstad?",
    options: [
      "1 — Stockholm",
      "X — Göteborg",
      "2 — Malmö",
    ],
    correctAnswer: "1",
  },
  {
    id: 2,
    text: "Vilket tal kommer efter 1?",
    options: [
      "1 — 3",
      "X — 7",
      "2 — 2",
    ],
    correctAnswer: "2",
  },
];

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const team = params.team as string;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  function chooseAnswer(answer: string) {
    setSelectedAnswer(answer);
    setShowConfirm(true);
  }

  async function confirmAnswer() {
    const answerToSave = selectedAnswer.charAt(0);

    const { error } = await supabase.from("quiz_answers").insert({
      team,
      question_id: currentQuestion.id,
      answer: answerToSave,
    });

    if (error) {
      alert("Supabase-fel: " + error.message);
      return;
    }

    setAnswers({
      ...answers,
      [currentQuestion.id]: answerToSave,
    });

    setSelectedAnswer("");
    setShowConfirm(false);

    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      router.push(`/team/${team}`);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-10">
        <RivieraHeader />
        <div className="mb-6 text-center">
          <p className="text-yellow-400 font-bold uppercase tracking-wide">
            Moment 1
          </p>

          <h1 className="text-4xl font-bold mt-2">Quiz</h1>

          <p className="text-gray-400 mt-2">
            Fråga {currentQuestionIndex + 1} av {questions.length}
          </p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-800">
          <h2 className="text-3xl font-bold text-center mb-8">
            {currentQuestion.text}
          </h2>

          <div className="grid gap-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => chooseAnswer(option)}
                className="bg-zinc-800 border border-zinc-700 p-6 rounded-2xl text-3xl font-bold hover:bg-zinc-700 active:scale-95 transition"
              >
                {option}
              </button>
            ))}
          </div>

          {showConfirm && (
            <div className="mt-6 bg-yellow-400 text-black p-5 rounded-2xl">
              <p className="font-bold text-xl mb-2">Är ni säkra?</p>

              <p className="mb-4">
                Ni har valt <strong>{selectedAnswer}</strong>. Svaret kan inte
                ändras efter att ni skickat in.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={confirmAnswer}
                  className="bg-black text-white px-4 py-4 rounded-xl font-bold"
                >
                  Skicka
                </button>

                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-white text-black px-4 py-4 rounded-xl font-bold"
                >
                  Ändra
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}