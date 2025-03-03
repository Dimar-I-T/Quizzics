'use client';
import React from 'react'
import { redirect, useRouter } from "next/navigation";

const buttons = () => {
  const router = useRouter();
  return (
    <>
        <button
            onClick={() => {router.push("/admin/subjects/new")}}
            className="relative left-1/2 transform -translate-x-1/2  text-[white] text-[2vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[8vw] mt-[6vw] w-[15vw]">
                Create Subject
        </button>
        <button
            onClick={() => {router.push("/admin")}}
            className="relative left-1/2 transform -translate-x-1/2  text-[white] text-[2vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[8vw] mt-[1vw] w-[15vw]">
                Back to Home 
        </button>
    </>
  )
}

export default buttons
