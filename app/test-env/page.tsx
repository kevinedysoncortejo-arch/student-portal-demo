// app/test-env/page.tsx
'use client'

export default function TestEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isUsingFallback = !supabaseUrl || !supabaseKey

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Environment Variables Test</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NEXT_PUBLIC_SUPABASE_URL
            </label>
            <div className="text-sm text-gray-600 break-all bg-gray-100 p-2 rounded">
              {supabaseUrl || 'Using fallback: https://nmrzefqzvodzrpomhulo.supabase.co'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </label>
            <div className="text-sm text-gray-600 break-all bg-gray-100 p-2 rounded">
              {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Using fallback key'}
            </div>
          </div>

          {isUsingFallback ? (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Using fallback Supabase credentials. Authentication should work without configuring environment variables in Vercel.
              </p>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ Using environment variables from configuration.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}