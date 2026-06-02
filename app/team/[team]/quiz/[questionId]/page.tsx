"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { questions } from "@/app/data/quizQuestions";

export default function QuizQuestionPage() {
  const params = useParams();
  const router = useRouter();

  const team = params.team as string;
  const questionId = Number(params.questionId);
  const question = questions.find((q) => q.id === questionId);

  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [savedAnswer, setSavedAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadAnswer() {
      const { data } = await supabase
        .from("quiz_answers")
        .select("answer")
        .eq("team", team)
        .eq("question_id", questionId)
        .limit(1);

      if (data && data.length > 0) {
        setSavedAnswer(data[0].answer);
        setSelectedAnswer(data[0].answer);
      }
    }

    loadAnswer();
  }, [team, questionId]);

  async function submitAnswer() {
    if (!selectedAnswer || savedAnswer) return;

    setSaving(true);

    const { error } = await supabase.from("quiz_answers").insert({
      team,
      question_id: questionId,
      answer: selectedAnswer,
    });

    setSaving(false);

    if (error) {
      alert("Det gick inte att spara svaret.");
      return;
    }

    setSavedAnswer(selectedAnswer);

    setTimeout(() => {
      router.push(`/team/${team}/quiz`);
    }, 800);
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-5xl font-black text-center text-yellow-400 mb-4">
          Fråga {questionId}
        </h1>

        <h2 className="text-3xl font-black text-center mb-8">
          {question?.text}
        </h2>

        <div className="grid gap-4">
          {["1", "X", "2"].map((answer) => {
            const active = selectedAnswer === answer;

            return (
              <button
                key={answer}
                onClick={() => !savedAnswer && setSelectedAnswer(answer)}
                disabled={Boolean(savedAnswer)}
                className={`p-6 rounded-3xl font-black text-4xl transition-all ${
                  active
                    ? "bg-green-500 text-black scale-105"
                    : "bg-yellow-400 text-black"
                }`}
              >
                {answer}
              </button>
            );
          })}
        </div>

        {savedAnswer ? (
          <div className="mt-8 bg-green-500 text-black p-5 rounded-3xl text-center">
            <p className="text-2xl font-black">✅ Svar sparat</p>
            <p className="font-bold mt-2">Ni svarade: {savedAnswer}</p>
          </div>
        ) : (
          <button
            onClick={submitAnswer}
            disabled={!selectedAnswer || saving}
            className="w-full mt-8 bg-yellow-400 text-black p-5 rounded-3xl font-black text-xl disabled:opacity-40"
          >
            {saving ? "Sparar..." : "Skicka svar"}
          </button>
        )}

        <button
          onClick={() => router.push(`/team/${team}/quiz`)}
          className="w-full mt-4 bg-zinc-800 text-white p-4 rounded-2xl font-bold"
        >
          Tillbaka till frågelistan
        </button>
      </div>
    </main>
  );
}