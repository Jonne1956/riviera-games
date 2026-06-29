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

type TeamDisplayName = {
  team: string;
  display_name: string;
  icon: string;
};

const fallbackTeamNames: Record<string, TeamDisplayName> = {
  gul: { team: "gul", display_name: "Lag Gul", icon: "⛷️" },
  bla: { team: "bla", display_name: "Lag Blå", icon: "🔨" },
  gron: { team: "gron", display_name: "Lag Grön", icon: "🍺" },
  rod: { team: "rod", display_name: "Lag Röd", icon: "⛳" },
};

export default function QuizOverviewPage() {
  const params = useParams();
  const team = params.team as string;

  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [teamDisplay, setTeamDisplay] = useState<TeamDisplayName | null>(null);

  const fallback = fallbackTeamNames[team] || {
    team,
    display_name: `Lag ${team}`,
    icon: "",
  };

  const display = teamDisplay || fallback;

  async function loadData() {
    const { data: answerData } = await supabase
      .from("quiz_answers")
      .select("question_id")
      .eq("team", team);

    const { data: teamNameData } = await supabase
      .from("team_display_names")
      .select("*")
      .eq("team", team)
      .maybeSingle();

    if (answerData) {
      setAnsweredQuestions(
        answerData.map((answer: QuizAnswer) => answer.question_id)
      );
    }

    if (teamNameData) {
      setTeamDisplay(teamNameData);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const allDone = answeredQuestions.length === questions.length;

  const unansweredQuestions = questions.filter(
    (question) => !answeredQuestions.includes(question.id)
  );

  const completedQuestions = questions.filter((question) =>
    answeredQuestions.includes(question.id)
  );

  const sortedQuestions = [...unansweredQuestions, ...completedQuestions];

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-6">
        <RivieraHeader />

        <div className="text-center mb-8 mt-8">
          <p className="text-5xl mb-2">{display.icon}</p>

          <p className="text-gray-500 font-bold">
            {fallback.display_name}
          </p>

          <h1 className="text-4xl font-black mt-2">
            Quiz
          </h1>

          <p className="text-yellow-400 font-black mt-1">
            {display.display_name}
          </p>
        </div>

        <p className="text-gray-400 text-center mb-8">
          Välj fråga. Obesvarade frågor visas överst.
        </p>

        <div className="grid gap-3">
          {sortedQuestions.map((question) => {
            const isAnswered = answeredQuestions.includes(question.id);

            return (
              <Link
                key={question.id}
                href={`/team/${team}/quiz/${question.id}`}
                className={`p-4 rounded-2xl font-bold text-lg flex justify-between items-center ${
                  isAnswered
                    ? "bg-green-500 text-black opacity-90"
                    : "bg-zinc-900 text-white border border-zinc-800"
                }`}
              >
                <span>Fråga {question.id}</span>
                <span>{isAnswered ? "✅ Klar" : "Svara"}</span>
              </Link>
            );
          })}
        </div>

        {completedQuestions.length > 0 && !allDone && (
          <p className="text-gray-500 text-center font-bold mt-5">
            Klara frågor flyttas längst ner i listan.
          </p>
        )}

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
