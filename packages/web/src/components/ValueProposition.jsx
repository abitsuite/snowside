// packages/web/src/components/ValueProposition.jsx

export default function ValueProposition() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Two native assets, zero friction
        </h2>
        <p className="text-xl text-gray-500 mb-8">
          Bridging Bitcoin and stablecoin economies in one network.
        </p>
        <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
          Snowside natively uses <strong>BTC</strong> for gas and transaction fees, preserving the
          economic model of Bitcoin. At the same time, a standard <strong>USDC bridge</strong> from
          Avalanche’s C‑Chain is integrated from day one, allowing users to bring in stable liquidity
          without exposure to volatile assets.
        </p>
        <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
          No competing token. No new consensus token. Just BTC &amp; USDC, secure and fast.
        </p>
      </div>
    </section>
  )
}
