"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";
import { questions } from "@/app/data/quizQuestions";

export default function QuizQuestionPage() {
  const params = useParams();
  const router = useRouter();

  const team = params.team as string;
  const questionId = Number(params.questionId);

  const question = questions.find((q) => q.id === questionId);

  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function checkExistingAnswer() {
      const { data } = await supabase
        .from("quiz_answers")
        .select("id")
        .eq("team", team)
        .eq("question_id", questionId)
        .limit(1);

      setAlreadyAnswered(Boolean(data && data.length > 0));
    }

    checkExistingAnswer();
  }, [team, questionId]);

  if (!question) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <p>Frågan hittades inte.</p>
      </main>
    );
  }

  async function submitAnswer() {
    const answerToSave = selectedAnswer.charAt(0);

    const { error } = await supabase.from("quiz_answers").insert({
      team,
      question_id: question.id,
      answer: answerToSave,
    });

    if (error) {
      alert("Det gick inte att spara svaret. Frågan kan redan vara besvarad.");
      return;
    }

    router.push(`/team/${team}/quiz`);
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-6">
        <RivieraHeader />

        <p className="text-yellow-400 font-bold text-center uppercase tracking-wide mt-8">
          Fråga {question.id}
        </p>

        <h1 className="text-2xl font-bold text-center mt-4 mb-8">
          {question.text}
        </h1>

        {alreadyAnswered ? (
          <div className="bg-green-500 text-black p-6 rounded-3xl text-center">
            <h2 className="text-2xl font-black mb-2">
              Frågan är redan besvarad ✅
            </h2>

            <Link
              href={`/team/${team}/quiz`}
              className="block mt-4 font-bold underline"
            >
              Tillbaka till frågelistan
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSelectedAnswer(option);
                  setShowConfirm(true);
                }}
                className="bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-xl font-bold hover:bg-zinc-700 active:scale-95 transition"
              >
                {option}
              </button>
            ))}

            {showConfirm && (
              <div className="mt-4 bg-yellow-400 text-black p-5 rounded-2xl">
                <p className="font-bold text-xl mb-2">
                  Är ni säkra?
                </p>

                <p className="mb-4">
                  Ni har valt <strong>{selectedAnswer}</strong>. Svaret kan inte ändras.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={submitAnswer}
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
        )}
      </div>
    </main>
  );
}