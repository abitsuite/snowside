// packages/web/src/components/Team.jsx

export default function Team() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Who builds Snowside</h2>
        <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
          Snowside is a project by Shomari (creator of NodeRunr).
        </p>
        <ul className="mt-6 space-y-2 text-gray-600 text-sm list-none">
          <li>✅ Received a $10,000 retro9000 grant from the Avalanche Foundation</li>
          <li>✅ NodeRunr is open source and already used by multiple Avalanche L1 teams</li>
          <li>✅ Direct support from Paul Sztorc (informal collaboration)</li>
        </ul>
        <p className="mt-6 text-gray-500 text-sm">
          <strong>Current status:</strong> Applying for a Team1 Mini Grant to fund the final launch and
          community onboarding.
        </p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <span className="inline-block rounded-full px-4 py-1 bg-purple-100 text-purple-800 text-xs font-medium">
            Avalanche Foundation Grant Recipient
          </span>
        </div>
      </div>
    </section>
  )
}
