'use client';
import { useRouter } from 'next/navigation'


export default function Page() {
  const router = useRouter()

    return (
      <div className="bg-black h-screen flex flex-col items-center justify-center text-white">
      <h1 className="text-center text-4xl font-bold">
        a BETTER life tomorrow
      </h1>
      <div className="flex flex-col items-center justify-center space-y-4 mt-6">
        <button 
          onClick={() => router.push("/goal_setting")}
          className="border-2 border-white rounded px-4 py-2 text-white hover:animate-pulse rounded-lg">
          Log Goals
        </button>
        <button 
          onClick={() => router.push("/calendar")}
          className="border-2 border-white px-4 py-2 text-white hover:animate-pulse rounded-lg">
          Calendar
        </button>
      </div>
    </div>
  );
  }
