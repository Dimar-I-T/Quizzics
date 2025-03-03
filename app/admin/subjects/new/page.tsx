'use client'
import React, { Suspense } from 'react';
import { addQuiz, addSubject, signUpAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { redirect, useRouter } from 'next/navigation';
import { useSearchParams } from "next/navigation";

function ErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;
  return (
    <h2 className="relative text-[1vw] text-[white] font-light">
      Subject name is already used!
    </h2>
  );
}

const page = () => {
  const router = useRouter();

  return (
    <div className="bg-cover justify-items-center bg-[black] min-h-full w-full">
      <div className="relative flex flex-col bg-transparent top-[5vw] min-h-auto w-[60vw] mt-[2vw]">
        <div className="relative bg-transparent h-[6vw] w-full top-0">
          <div className="relative justify-items-center bg-transparent h-[7vw] w-full">
            <button
              onClick={() => { router.push("/admin/subjects") }}
              className="absolute font-light text-[white] left-[3vw] top-[1.5vw] text-[1vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[3vw] w-[5vw]">
              Back
            </button>
            <h1 className="relative text-[4vw] top-0 mt-[0.5vw] text-[white] font-bold">
              Create Subject Page
            </h1>

          </div>
        </div>
        <form>
          <div className="relative flex flex-col bg-transparent min-h-auto w-[60vw] mt-[2vw]">
            <Label htmlFor="name" className="text-[1.5vw]">Subject Name</Label>
            <Input className="mb-[1vw] w-[20vw]" name="name" placeholder="Enter your subject name" required />
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <ErrorMessage />
          </Suspense>
          <SubmitButton className="absolute h-[8vw] w-[15vw] top-[17vw] left-1/2 transform -translate-x-1/2 rounded-[2vw] text-[1.5vw] font-bold" formAction={addSubject} pendingText="Adding subject...">
            CREATE SUBJECT!
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}

export default page;
