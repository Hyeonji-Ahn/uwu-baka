'use client';
import { useRouter } from 'next/navigation'
import Image from 'next/image'


export default function Page() {
  const router = useRouter()

    return (
      <div className="bg-black h-screen flex flex-col items-center justify-center text-white">
            <Image 
        src="/logo.png" 
        alt="LOGO" 
        width={300} 
        height={300}
      />
      <div className="flex flex-col items-center justify-center space-y-4 mt-6">
        <button 
          onClick={() => router.push("/goal_setting")}
          className="border-2 border-white px-4 py-2 text-white hover:animate-pulse rounded-lg">
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
