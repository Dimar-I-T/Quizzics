'use client';
import React from 'react'
import { signInAction, signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useSearchParams } from "next/navigation";

const page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  return (
    <div className="bg-cover bg-[black] min-h-full w-full justify-items-center">
      <form>
        <div className="relative bg-transparent h-[40vw] w-[50vw] top-[5vw] justify-items-center">
          <h1 className="relative text-[5vw] font-bold text-[white]">
            Log In
          </h1>
          <div className="relative bg-transparent top-[2vw] h-[30vw] w-[30vw]">
            <Label htmlFor="email">Email</Label>
            <Input className="mb-[1vw]" name="email" placeholder="you@example.com" required />
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="Your password"
              minLength={6}
              required
            />
            <SubmitButton className="relative mt-[3vw] left-1/2 transform -translate-x-1/2" formAction={signInAction} pendingText="Signing in...">
              Log In
            </SubmitButton>
            <button onClick={() => { router.push("/register") }} className="absolute mt-[6vw] left-1/2 transform -translate-x-1/2 font-extralight opacity-[80%] hover:opacity-[100%] text-[#007bff] text-[1vw] h-[3vw] w-[5vw]">
              Sign Up
            </button>
          </div>
        </div>
      </form>

      {error && <h1 className="relative text-[1.5vw] text-center text-[white]">
        {error}
      </h1>}
    </div>
  )
}

export default page
