// packages/web/src/components/WhyAvalanche.jsx

export default function WhyAvalanche() {
  return (
    <section id="tech" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          The perfect substrate for Bitcoin sidechains
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sub‑second finality</h3>
            <p className="text-gray-600 text-sm">
              eCash transactions confirm instantly, dramatically improving user experience over existing
              Bitcoin‑adjacent chains.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sovereign validator set</h3>
            <p className="text-gray-600 text-sm">
              Snowside runs its own validators, ensuring dedicated throughput for eCash operations.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Native interoperability</h3>
            <p className="text-gray-600 text-sm">
              Avalanche Interchain Messaging (ICM) allows trust‑less bridging of USDC from the C‑Chain.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Low operational cost</h3>
            <p className="text-gray-600 text-sm">
              Avalanche9000’s subscription model makes community‑run validation cheap and feasible.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tooling maturity</h3>
            <p className="text-gray-600 text-sm">
              Full EVM compatibility—Remix, Hardhat, The Graph all work out‑of‑the‑box.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
