'use client';
import React from 'react'
import { redirect, useRouter } from "next/navigation";

const buttons = () => {
    const router = useRouter();
    return (
        <>
            <button
                onClick={() => router.push(`/login`)}
                className="absolute font-light text-[white] left-[5vw] top-[3vw] text-[1vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[3vw] w-[5vw]"
            >
                Log out
            </button>
        </>
    )
}

export default buttons
