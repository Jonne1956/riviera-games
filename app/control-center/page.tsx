export default function ControlCenterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-300 via-orange-200 to-cyan-300 text-black p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="text-center bg-white/80 rounded-3xl p-8 shadow-xl border-4 border-white">
          <p className="text-5xl mb-3">🌴</p>
          <h1 className="text-4xl font-black">Riviera Control Center</h1>

          <p className="text-lg font-bold mt-3">
            Gemensam kontrollpanel för Riviera Games och Riviera Music Quiz.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/85 rounded-3xl p-6 shadow-xl border-4 border-yellow-400">
            <h2 className="text-3xl font-black mb-3">🏆 Riviera Games</h2>

            <p className="font-bold mb-5">
              Lagtävling, gäster, foton, dryckestest och hemligt uppdrag.
            </p>

            <div className="grid gap-3">
              <a
                href="https://riviera-games.vercel.app/admin"
                className="bg-black text-yellow-300 font-black text-center p-4 rounded-2xl"
              >
                Admin
              </a>

              <a
                href="https://riviera-games.vercel.app"
                className="bg-yellow-400 text-black font-black text-center p-4 rounded-2xl"
              >
                Live / Startsida
              </a>

              <a
                href="https://riviera-games.vercel.app/photo-wall-live"
                className="bg-cyan-500 text-white font-black text-center p-4 rounded-2xl"
              >
                Photo Wall
              </a>
            </div>
          </div>

          <div className="bg-white/85 rounded-3xl p-6 shadow-xl border-4 border-pink-400">
            <h2 className="text-3xl font-black mb-3">🎵 Riviera Music Quiz</h2>

            <p className="font-bold mb-5">
              Musikquiz, generationskamp, frågebank och prisutdelning.
            </p>

            <div className="grid gap-3">
              <a
                href="https://riviera-music-quiz.vercel.app/admin"
                className="bg-black text-yellow-300 font-black text-center p-4 rounded-2xl"
              >
                Admin
              </a>

              <a
                href="https://riviera-music-quiz.vercel.app"
                className="bg-yellow-400 text-black font-black text-center p-4 rounded-2xl"
              >
                Live / Startsida
              </a>

              <a
                href="https://riviera-music-quiz.vercel.app/standings"
                className="bg-zinc-900 text-white font-black text-center p-4 rounded-2xl"
              >
                Ställning
              </a>

              <a
                href="https://riviera-music-quiz.vercel.app/results"
                className="bg-pink-500 text-white font-black text-center p-4 rounded-2xl"
              >
                Resultat
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}