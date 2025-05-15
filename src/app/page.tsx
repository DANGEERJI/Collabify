'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      {session ? (
        <>
          <h1 className="text-2xl font-semibold mb-4">
            Welcome, {session.user?.name} 👋
          </h1>
          <button
            onClick={() => signOut()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold mb-4">
            Welcome to Collabify!
          </h1>
          <button
            onClick={() => signIn('google')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Sign In with Google
          </button>
        </>
      )}
    </main>
  );
}
