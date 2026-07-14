// packages/web/src/components/ECash.jsx

export default function ECash() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Built for Paul Sztorc’s eCash revival
        </h2>
        <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
          Paul Sztorc (creator of Drivechain, BIP 300) has long maintained multiple Bitcoin sidechains
          for experimentation. His upcoming eCash hard‑fork provides a new specification for an e‑cash
          system that preserves privacy and scalability. However, EthSide, his original EVM sidechain,
          was retired because standalone chain management was too time‑consuming.
        </p>
        <p className="mt-4 text-gray-700 leading-relaxed max-w-2xl mx-auto">
          Snowside fills that gap. We have coordinated with Paul to ensure the L1’s configuration meets
          the eCash specification. By leveraging Avalanche and NodeRunr, we give Paul and his community
          a chain that they can <strong>actually use</strong> – without babysitting.
        </p>
      </div>
    </section>
  )
}
