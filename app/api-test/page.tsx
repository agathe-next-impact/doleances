import { fetchFeaturedArticles } from "@/lib/wordpress"

export default async function ApiTestPage() {
  let apiResponse = null
  let error = null
  let articles = []

  try {
    articles = await fetchFeaturedArticles()
    apiResponse = { success: true, count: articles.length }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
    apiResponse = { success: false, error }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">WordPress API Test</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Environment Variable Status:</h2>
        <p className="mt-2">WORDPRESS_API_URL: {process.env.WORDPRESS_API_URL ? "✅ Set" : "❌ Not set"}</p>
        {process.env.WORDPRESS_API_URL && (
          <p className="mt-2 text-sm text-muted-foreground">Value: {process.env.WORDPRESS_API_URL}</p>
        )}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">API Response Status:</h2>
        <div className="mt-2 rounded-lg bg-gray-100 p-4">
          {apiResponse.success ? (
            <p className="text-green-600">✅ Success! Retrieved {apiResponse.count} articles.</p>
          ) : (
            <p className="text-red-600">❌ Error: {apiResponse.error}</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">API Response Data:</h2>
        <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-gray-100 p-4 text-sm">
          {JSON.stringify(articles, null, 2)}
        </pre>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Troubleshooting Tips:</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Make sure your WordPress API URL is correct and includes the full path to the REST API.</li>
          <li>
            The URL should typically end with <code>/wp-json/wp/v2</code>
          </li>
          <li>
            Check if you can access the API directly in your browser by visiting:{" "}
            <code>{process.env.WORDPRESS_API_URL}/posts</code>
          </li>
          <li>Ensure your WordPress site has REST API enabled.</li>
          <li>Check if your WordPress site has CORS properly configured to allow requests from your Next.js app.</li>
        </ul>
      </div>
    </div>
  )
}
