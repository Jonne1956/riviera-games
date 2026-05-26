"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";
import { questions } from "@/app/data/quizQuestions";

type QuizAnswer = {
  question_id: number;
};

export default function QuizOverviewPage() {
  const params = useParams();
  const team = params.team as string;

  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);

  async function loadAnswers() {
    const { data } = await supabase
      .from("quiz_answers")
      .select("question_id")
      .eq("team", team);

    if (data) {
      setAnsweredQuestions(data.map((answer: QuizAnswer) => answer.question_id));
    }
  }

  useEffect(() => {
    loadAnswers();
  }, []);

  const allDone = answeredQuestions.length === questions.length;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-6">
        <RivieraHeader />

        <h1 className="text-4xl font-bold text-center mb-2 mt-8">
          Quiz
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Välj fråga. Ni kan ta frågorna i valfri ordning.
        </p>

        <div className="grid gap-3">
          {questions.map((question) => {
            const isAnswered = answeredQuestions.includes(question.id);

            return (
              <Link
                key={question.id}
                href={`/team/${team}/quiz/${question.id}`}
                className={`p-4 rounded-2xl font-bold text-lg flex justify-between items-center ${
                  isAnswered
                    ? "bg-green-500 text-black"
                    : "bg-zinc-900 text-white border border-zinc-800"
                }`}
              >
                <span>Fråga {question.id}</span>
                <span>{isAnswered ? "✅ Klar" : "Svara"}</span>
              </Link>
            );
          })}
        </div>

        {allDone && (
          <div className="mt-8 bg-yellow-400 text-black p-6 rounded-3xl text-center">
            <h2 className="text-2xl font-black mb-2">
              Quiz klart ✅
            </h2>
            <p className="font-bold">
              Alla quizfrågor är besvarade.
            </p>
          </div>
        )}

        <Link
          href={`/team/${team}`}
          className="block mt-8 text-center text-yellow-400 font-bold"
        >
          Tillbaka till momentmenyn
        </Link>
      </div>
    </main>
  );
}