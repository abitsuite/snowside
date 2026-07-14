// packages/web/src/components/Nav.jsx

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="#" className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
          ❄️ Snowside
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
          <a href="#about">About</a>
          <a href="#tech">Tech</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#contact">Contact</a>
        </div>
        <a
          href="#proposal"
          className="hidden md:inline-block rounded-full px-5 py-2 text-sm font-semibold text-white bg-[#6B2D5B] hover:bg-[#562548] transition"
        >
          Read the Proposal
        </a>
      </div>
    </nav>
  )
}
