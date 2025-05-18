'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p className="text-center mt-10 text-lg">Loading...</p>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
        {session ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-semibold mb-4">
              Welcome, {session.user?.name} 👋
            </h1>
            <button
              onClick={() => signOut()}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-semibold mb-4">
              Welcome to <span className="text-blue-600">Collabify</span>!
            </h1>
            <button
              onClick={() => signIn('google')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Sign In with Google
            </button>
          </>
        )}
      </div>
    </main>
  );
}
