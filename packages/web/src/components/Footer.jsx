// packages/web/src/components/Footer.jsx

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12 text-center text-sm text-gray-500">
      <div className="max-w-4xl mx-auto px-4">
        <p className="font-semibold text-gray-700 mb-2">Snowside</p>
        <p className="mb-4">Powered by Avalanche and NodeRunr</p>
        <div className="flex justify-center gap-6 mb-4">
          <a href="https://twitter.com/" className="hover:text-gray-800 transition">Twitter</a>
          <a href="https://github.com/abitsuite/snowside" className="hover:text-gray-800 transition">GitHub</a>
          <a href="/" className="hover:text-gray-800 transition">Documentation</a>
        </div>
        <p>&copy; 2026 Snowside. All rights reserved.</p>
      </div>
    </footer>
  )
}
