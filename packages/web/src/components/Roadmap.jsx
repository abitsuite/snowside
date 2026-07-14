// packages/web/src/components/Roadmap.jsx

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          From testnet to mainnet
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 pr-4 font-semibold text-gray-600">Month</th>
                <th className="py-2 font-semibold text-gray-600">Milestone</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium">Month 1</td>
                <td className="py-3">Fuji testnet launch with NodeRunr template; automated validator setup</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium">Month 2</td>
                <td className="py-3">Security audit of eCash smart contracts; integration with C‑Chain USDC bridge</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium">Month 3</td>
                <td className="py-3">Mainnet launch with at least 3 community validators; public RPC and block explorer</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium">Month 4</td>
                <td className="py-3">Community AMA with Paul Sztorc; onboarding documentation released</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Ongoing</td>
                <td className="py-3">Validator growth, protocol maintenance via NodeRunr</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
