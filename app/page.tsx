export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-6 pt-12">
  <div className="text-yellow-400 text-8xl mb-2">
    🌴
  </div>

  <div className="flex items-center gap-8 mb-4">
    <div className="h-[2px] w-32 bg-yellow-400" />

    <div className="h-[2px] w-32 bg-yellow-400" />
  </div>

  <h1 className="text-[80px] md:text-[140px] font-black uppercase text-yellow-400 leading-none text-center">
    Riviera Games
  </h1>

  <p className="text-2xl md:text-5xl font-bold mt-6 text-center">
    Riviera Pool Party – Lasse LXX
  </p>

  <p className="text-gray-400 text-xl md:text-3xl mt-6 text-center">
    Lag Gul • Lag Blå • Lag Grön • Lag Röd
  </p>

  <a
    href="/teams"
    className="mt-14 bg-yellow-400 text-black px-12 py-5 rounded-3xl text-3xl font-bold hover:scale-105 transition"
  >
    Starta tävlingen
  </a>
</main>
  )
}