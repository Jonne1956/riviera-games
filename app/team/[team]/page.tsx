"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";
import { questions } from "@/app/data/quizQuestions";

const teamNames: Record<string, string> = {
  gul: "Lag Gul",
  bla: "Lag Blå",
  gron: "Lag Grön",
  rod: "Lag Röd",
};

export default function TeamPage() {
  const params = useParams();
  const team = params.team as string;
  const teamName = teamNames[team] || `Lag ${team}`;

  const [quizDone, setQuizDone] = useState(false);
  const [drinksDone, setDrinksDone] = useState(false);
  const [photoDone, setPhotoDone] = useState(false);
  const [missionDone, setMissionDone] = useState(false);

  async function loadStatus() {
    const { data: quizData } = await supabase
      .from("quiz_answers")
      .select("question_id")
      .eq("team", team);

    const { data: drinkData } = await supabase
      .from("drink_answers")
      .select("id")
      .eq("team", team)
      .limit(1);

    const { data: photoData } = await supabase
      .from("photo_submissions")
      .select("id")
      .eq("team", team)
      .limit(1);

    const { data: missionVoteData } = await supabase
      .from("traitor_votes")
      .select("id")
      .eq("team", team)
      .limit(1);

    setQuizDone(
      Boolean(
        quizData &&
          new Set(quizData.map((answer) => answer.question_id)).size >=
            questions.length
      )
    );

    setDrinksDone(Boolean(drinkData && drinkData.length > 0));
    setPhotoDone(Boolean(photoData && photoData.length > 0));
    setMissionDone(Boolean(missionVoteData && missionVoteData.length > 0));
  }

  useEffect(() => {
    if (!team) return;

    loadStatus();

    const interval = setInterval(() => {
      loadStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [team]);

  const firstThreeDone = quizDone && drinksDone && photoDone;
  const allDone = firstThreeDone && missionDone;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-10">
        <RivieraHeader />

        <h1 className="text-4xl font-bold text-center mb-2 mt-8">
          {teamName}
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Välj vilket moment ni vill göra
        </p>

        <div className="grid gap-4">
          <Link
            href={`/team/${team}/quiz`}
            className="bg-yellow-400 text-black p-5 rounded-2xl font-bold text-xl text-center hover:scale-105 transition"
          >
            {quizDone ? "✅ Quiz klart" : "Moment 1: Quiz"}
          </Link>

          <Link
            href={`/team/${team}/drinks`}
            className="bg-blue-500 p-5 rounded-2xl font-bold text-xl text-center hover:scale-105 transition"
          >
            {drinksDone
              ? "✅ Dryckestest klart"
              : "Moment 2: Dryckestest"}
          </Link>

          <Link
            href={`/team/${team}/photo`}
            className="bg-green-500 p-5 rounded-2xl font-bold text-xl text-center hover:scale-105 transition"
          >
            {photoDone
              ? "✅ Gruppbild klar"
              : "Moment 3: Gruppbild"}
          </Link>

          {firstThreeDone && (
            <Link
              href={`/team/${team}/traitors`}
              className="bg-purple-600 p-5 rounded-2xl font-bold text-xl text-center hover:scale-105 transition"
            >
              {missionDone
                ? "✅ Hemligt Uppdrag klart"
                : "🎯 Moment 4: Hemligt Uppdrag"}
            </Link>
          )}
        </div>

        {firstThreeDone && !missionDone && (
          <div className="mt-8 bg-purple-600 text-white p-6 rounded-3xl text-center">
            <p className="text-4xl mb-3">🎯</p>

            <h2 className="text-2xl font-black mb-3">
              Ett moment återstår!
            </h2>

            <p className="font-bold text-lg">
              Diskutera vem som hade det hemliga uppdraget och vilket uppdrag personen hade.
            </p>
          </div>
        )}

        {allDone && (
          <div className="mt-8 bg-yellow-400 text-black p-6 rounded-3xl text-center animate-pulse">
            <p className="text-4xl mb-3">🥂</p>

            <h2 className="text-2xl font-black mb-3">
              Alla moment klara!
            </h2>

            <p className="font-bold text-lg">
              Resultatet avslöjas vid prisutdelningen 🏆
            </p>
          </div>
        )}
      </div>
    </main>
  );
}