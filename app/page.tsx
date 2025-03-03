'use client'
import React from 'react'
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const page = () => {
  return (
    <div className="bg-cover justify-items-center bg-[black] min-h-full w-full">
      <h1 className="relative text-[5vw] font-bold mt-[4vw]">
        Quiz
      </h1>
      <div className="relative bg-transparent mt-[4vw] flex flex-col h-auto w-auto">
        <button
          onClick={() => redirect("/register/")}
          className="relative text-[white] text-[2vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[8vw] w-[15vw]">
          Sign Up
        </button>
        <button
          onClick={() => redirect("/login/")}
          className="relative text-[white] text-[2vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[8vw] mt-[2vw] w-[15vw]">
          Login
        </button>
      </div>
    </div>
  )
}

export default page
