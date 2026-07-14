// packages/web/src/components/CTA.jsx

export default function CTA() {
  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Join the Snowside movement</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="#" className="rounded-full px-6 py-3 text-sm font-semibold bg-[#6B2D5B] text-white hover:bg-[#562548] transition">
            Run a Validator
          </a>
          <a href="#" className="rounded-full px-6 py-3 text-sm font-semibold bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 transition">
            Join our Discord
          </a>
          <a href="#proposal" className="rounded-full px-6 py-3 text-sm font-semibold bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 transition">
            Read our Team1 Proposal
          </a>
        </div>
      </div>
    </section>
  )
}
