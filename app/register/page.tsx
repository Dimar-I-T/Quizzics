'use client';
import React, { useEffect } from 'react';
import { signUpAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const ErrorMessage = () => {
    const searchParams = useSearchParams();
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (!error) {
        return null
    } else {
        return (
            <>
                {success && <h1 className="relative text-[1.5vw] text-center text-[white]">
                    {success}
                </h1>}
                {error == `duplicate key value violates unique constraint "users_email_key"` && <h1 className="relative text-[1.5vw] text-center text-[white]">
                    Email is already used!
                </h1>}
                {error && error != `duplicate key value violates unique constraint "users_email_key"` && <h1 className="relative text-[1.5vw] text-center text-[white]">
                    {error}</h1>}
            </>)
    }
}

const page = () => {
    const router = useRouter();
    const [role, setRole] = useState(0);
    

    return (
        <div className="bg-cover bg-[black] min-h-full w-full justify-items-center">
            <div className="relative bg-transparent h-[40vw] w-[50vw] top-[2vw] justify-items-center">
                <h1 className="relative text-[5vw] font-bold text-[white]">
                    Sign Up
                </h1>
                <form>
                    <div className="relative bg-transparent top-[2vw] h-[30vw] w-[30vw]">
                        <Label htmlFor="username">Username</Label>
                        <Input className="mb-[1vw]" name="username" placeholder="Your username" required />
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

                        <div className="relative w-[13vw] left-1/2 transform -translate-x-1/2 h-[3vw] flex bg-transparent mt-[2vw]">
                            {role == 0 && <div className="relative ml-[0.2vw] mr-[1.5vw] left-0 bg-transparent flex h-[2vw] w-[5vw]">
                                <button
                                    onClick={() => { setRole(1) }}
                                    className="relative mx-[0.5vw] mt-[0.2vw] opacity-[80%] bg-[white] hover:opacity-[100%] border-[white] border-[0.2vw] rounded-full h-[1vw] w-[1vw]">
                                </button>
                                <h1 className="relative text-[1vw] font-light text-[white]">
                                    Admin
                                </h1>
                            </div>}

                            {role == 1 && <div className="relative ml-[0.2vw] mr-[1.5vw] left-0 bg-transparent flex h-[2vw] w-[5vw]">
                                <button
                                    onClick={() => { setRole(0) }}
                                    className="relative mx-[0.5vw] mt-[0.2vw] opacity-[80%] hover:opacity-[100%] bg-transparent border-[white] border-[0.2vw] rounded-full h-[1vw] w-[1vw]">
                                </button>
                                <h1 className="relative text-[1vw] font-light text-[white]">
                                    Admin
                                </h1>
                            </div>}

                            {role == 1 && <div className="relative right-0 bg-transparent flex h-[2vw] w-[10vw]">
                                <button
                                    onClick={() => { setRole(0) }}
                                    className="relative mx-[0.5vw] mt-[0.2vw] opacity-[80%] bg-[white] hover:opacity-[100%] border-[white] border-[0.2vw] rounded-full h-[1vw] w-[1vw]">
                                </button>
                                <h1 className="relative text-[1vw] font-light text-[white]">
                                    Student
                                </h1>
                            </div>}

                            {role == 0 && <div className="relative right-0 bg-transparent flex h-[2vw] w-[10vw]">
                                <button
                                    onClick={() => { setRole(1) }}
                                    className="relative mx-[0.5vw] mt-[0.2vw] opacity-[80%] hover:opacity-[100%] bg-transparent border-[white] border-[0.2vw] rounded-full h-[1vw] w-[1vw]">
                                </button>
                                <h1 className="relative text-[1vw] font-light text-[white]">
                                    Student
                                </h1>
                            </div>}
                        </div>

                        <Input type="hidden" name="role" value={role} required />

                        <Suspense>
                            <ErrorMessage/>
                        </Suspense>
                        <div className="relative left-1/2 transform -translate-x-1/2 justify-items-center mt-[1vw] w-[10vw] h-[5vw] bg-transparent">
                            <SubmitButton className="relative left-1/2 transform -translate-x-1/2" formAction={signUpAction} pendingText="Signing up...">
                                Sign up
                            </SubmitButton>
                            <button onClick={() => { router.push("/login") }} className="relative left-1/2 transform -translate-x-1/2 font-extralight opacity-[80%] hover:opacity-[100%] text-[#007bff] text-[1vw] h-[3vw] w-[5vw]">
                                Login
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default page
