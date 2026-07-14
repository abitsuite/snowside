// packages/web/src/components/NodeRunr.jsx

export default function NodeRunr() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Automated node management, from launch to maintenance
        </h2>
        <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
          Snowside is born from <strong>NodeRunr</strong>, the lightweight daemon that won a retro9000
          grant from the Avalanche Foundation for simplifying Layer‑1 operations. NodeRunr handles
          one‑click deployment, custom precompile integration, 24/7 monitoring, and automatic updates.
        </p>
        <p className="mt-4 text-gray-600 text-sm max-w-md mx-auto">
          (Screenshot of the NodeRunr dashboard or terminal launch will go here)
        </p>
        <div className="mt-8">
          <a
            href="https://layer1.run"
            className="inline-block rounded-full px-6 py-3 text-sm font-semibold bg-[#6B2D5B] text-white hover:bg-[#562548] transition"
          >
            Explore NodeRunr
          </a>
        </div>
      </div>
    </section>
  )
}
