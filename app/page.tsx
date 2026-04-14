// app/page.tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Student Portal Demo
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A simple integrated web app using Supabase and Vercel.
          <br />
          Manage your learning journey with ease.
        </p>
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}