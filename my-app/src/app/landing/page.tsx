'use client';
import { useRouter } from 'next/navigation'


export default function Page() {
  const router = useRouter()

    return (
      <div>
        <div className="flex flex-col items-center justify-center pt-[66vh] space-y-4">
          <button 
            onClick={() => router.push("/goal_setting")}
            className="border-2 border-white rounded px-4 py-2">
              Log Goals
          </button>
          <button 
            onClick={() => router.push("/calendar")}
            className="border-2 border-white rounded px-4 py-2">Calendar</button>
        </div>
      </div>
    );
  }
