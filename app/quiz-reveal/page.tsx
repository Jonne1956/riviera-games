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

function getOptionText(question: any, answerKey: string | undefined) {
  if (!answerKey) return "Ej besvarad";

  const option = question.options.find((option: string) =>
    option.startsWith(`${answerKey} —`)
  );

  return option || answerKey;
}

export default function QuizRevealPage() {
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  async function loadAnswers() {
    const { data } = await supabase.from("quiz_answers").select("*");

    if (data) setAnswers(data);
  }

  useEffect(() => {
    loadAnswers();

    const interval = setInterval(loadAnswers, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <a
        href="/admin"
        className="fixed top-4 left-4 z-50 bg-zinc-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition-all"
      >
        ←
      </a>

      <div className="max-w-6xl mx-auto pt-8">
        <RivieraHeader />

        <h1 className="text-5xl font-black text-center mt-10 mb-10">
          🧠 QUIZ REVEAL
        </h1>

        <div className="grid gap-8">
          {Object.keys(teamNames).map((team) => {
            const teamAnswers = answers.filter(
              (answer) => answer.team === team
            );

            const score = teamAnswers.filter((answer) => {
              const question = questions.find(
                (q) => q.id === answer.question_id
              );

              return question?.correctAnswer === answer.answer;
            }).length;

            return (
              <section
                key={team}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
              >
                <div
                  className={`${teamColors[team]} rounded-2xl px-5 py-3 inline-block mb-6`}
                >
                  <h2 className="text-3xl font-black uppercase">
                    Lag {teamNames[team]} — {score}/{questions.length}
                  </h2>
                </div>

                <div className="grid gap-3">
                  {questions.map((question) => {
                    const answer = teamAnswers.find(
                      (a) => a.question_id === question.id
                    );

                    const isCorrect =
                      answer?.answer === question.correctAnswer;

                    const teamAnswerText = getOptionText(
                      question,
                      answer?.answer
                    );

                    const correctAnswerText = getOptionText(
                      question,
                      question.correctAnswer
                    );

                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-2xl border ${
                          !answer
                            ? "bg-zinc-800 border-zinc-700 text-gray-400"
                            : isCorrect
                            ? "bg-green-950 border-green-600 text-green-100"
                            : "bg-red-950 border-red-600 text-red-100"
                        }`}
                      >
                        <div className="flex justify-between gap-4 mb-2">
                          <p className="text-sm uppercase opacity-70 font-bold">
                            Fråga {question.id}
                          </p>

                          <p className="text-sm font-black">
                            {!answer
                              ? "Ej svarad"
                              : isCorrect
                              ? "✅ Rätt"
                              : "❌ Fel"}
                          </p>
                        </div>

                        <p className="text-base font-semibold mb-3">
                          {question.text}
                        </p>

                        <div className="text-sm space-y-1">
                          <p>
                            <span className="font-bold">
                              Lagets svar:
                            </span>{" "}
                            {teamAnswerText}
                          </p>

                          <p>
                            <span className="font-bold">
                              Rätt svar:
                            </span>{" "}
                            {correctAnswerText}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}