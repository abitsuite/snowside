// packages/web/src/components/About.jsx

export default function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          A Bitcoin sidechain, powered by Avalanche
        </h2>
        <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto text-center">
          Snowside is a dedicated Avalanche Layer‑1 blockchain built to host Paul Sztorc's upcoming
          eCash hard‑fork. It runs as a clean EVM sidechain where the native gas token is BTC itself—no
          new minted tokens, no pre‑mine, just the same Bitcoin security via blind merged mining.
        </p>
        <p className="mt-4 text-gray-700 leading-relaxed max-w-3xl mx-auto text-center">
          Unlike Paul's previous EthSide chain (which was abandoned due to maintenance overhead), Snowside
          leverages Avalanche's subscription model and NodeRunr automation to remain lean, resilient, and
          trivially operable.
        </p>
        <p className="mt-4 text-gray-700 leading-relaxed max-w-3xl mx-auto text-center">
          The name <strong>Snowside</strong> reflects our commitment to the Avalanche ecosystem and our
          lineage within the family of Bitcoin sidechains that Paul already maintains.
        </p>
      </div>
    </section>
  )
}
