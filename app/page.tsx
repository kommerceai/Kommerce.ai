import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Kommerce.ai</h1>
        <p className="text-xl text-gray-600 mb-8">
          E-commerce Agency Management Platform
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/api/clients"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            View API
          </Link>
        </div>

        <div className="mt-12 text-left max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Google Sheets Integration with OAuth 2.0</li>
            <li>Automated daily data syncing</li>
            <li>Client management and tracking</li>
            <li>Financial P&L reporting</li>
            <li>Multi-platform metrics (Shopify, Meta, TikTok)</li>
            <li>Conditional formatting and status indicators</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
