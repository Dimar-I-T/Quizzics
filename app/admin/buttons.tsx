'use client';
import React from 'react'
import { redirect, useRouter } from "next/navigation";

const buttons = () => {
  const router = useRouter();
  return (
    <div>
      <button
        onClick={() => router.push("/admin/subjects")}
        className="relative left-1/2 transform -translate-x-1/2 text-[white] text-[2vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[8vw] mt-[5vw] w-[15vw]">
         Your Quizzes
      </button>
    </div>
  )
}

export default buttons
