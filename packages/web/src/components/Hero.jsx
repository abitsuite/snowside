// packages/web/src/components/Hero.jsx

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#C8E6F7] via-white to-[#EDE0F0] dark:from-gray-900 dark:via-gray-950 dark:to-gray-900"></div>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
          Snowside<br />
          <span className="text-[#6B2D5B] dark:text-purple-300">The eCash Sidechain on Avalanche</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Native BTC gas. Instant USDC bridging. Bitcoin‑security, Avalanche speed.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <a href="#about" className="rounded-full px-8 py-3 text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            Learn More
          </a>
          <a href="#proposal" className="rounded-full px-8 py-3 text-sm font-semibold bg-[#6B2D5B] text-white hover:bg-[#562548] transition">
            Read the Proposal
          </a>
        </div>
      </div>
    </section>
  )
}
