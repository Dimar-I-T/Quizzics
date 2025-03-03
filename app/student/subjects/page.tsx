"use client"
import { createClient } from "@/utils/supabase/client";
import { redirect, useRouter } from "next/navigation";
import React from 'react';
import { useParams } from 'next/navigation';
import { addQuiz, signUpAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import Buttons from './buttons'

const page = () => {
  const router = useRouter();
  interface Subject {
    subyek_id: string;
    subyek_name: string;
  }

  const [user, setUser] = useState<any | null>(null);
  const [dataSubject, setDataSubject] = useState<Subject[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error: err } = await supabase.auth.getUser();
      if (!user) {
        console.log(err);
        router.push("/login");
      } else {
        setUser(user);
        const { data: userData } = await supabase.from("users").select("*").eq("email", user?.email).single();
        if (userData) {
          if (userData.role == "admin") {
            router.push("/login");
          }
        }
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    async function getDataQuiz() {
      if (!user) return;

      const { data: dataQ } = await supabase.rpc('get_subjects_available', {
        studentid: user.id
      });
      setDataSubject(dataQ ?? []);
    }

    getDataQuiz();
  }, [user]);

  const dataa: Subject[] = dataSubject ?? [];

  const subjects = Array.from({ length: dataa.length }, (_, i) => {
    return (
      <div key={i} className="justify-items-center">
        <div className="relative bg-transparent min-h-auto max-h-[9.5vw] w-[35vw]">
          <button
            onClick={() => router.push(`/student/subjects/${dataa[i].subyek_id}/`)}
            className="relative ml-[1vw]flex flex-col mt-[1vw] rounded-[2vw] mih-h-auto max-h-[9.5vw] w-[35vw] bg-[grey] opacity-[90%] hover:opacity-[100%]">
            <h1 className="relative m-[0.5vw] text-[white] font-bold text-[2vw]">
              {dataa[i].subyek_name}
            </h1>
          </button>
        </div>
      </div>
    );
  });

  return (
    <div className="bg-cover justify-items-center bg-[black] min-h-full w-full">
      <button
        onClick={() => router.push(`/student/`)}
        className="absolute font-light text-[white] left-[5vw] top-[3vw] text-[1vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[3vw] w-[5vw]"
      >
        Back
      </button>
      <div className="relative bg-transparent top-[1vw] h-[40vw] w-[60vw] mt-[2vw]">
        <div className="relative bg-transparent h-[6vw] w-full top-0">
          <div className="relative justify-items-center bg-transparent h-[7vw] w-full">
            <h1 className="relative text-[4vw] top-0 mt-[0.5vw] text-[white] font-bold">
              Available Quizzes
            </h1>
          </div>

          <div className="relative mt-[1vw] flex bg-transparent w-full h-[33vw]">
            <div className="relative border-[white] left-1/2 transform -translate-x-1/2 border-[0.5vw] flex flex-col mt-[1vw] h-[30vw] w-[40vw] bg-transparent">
              <h1 className="sticky m-[0.5vw] text-[white] text-[2vw]">
                Available Subjects
              </h1>

              <div className="relative flex flex-col scroll-container h-[23vw] w-full bg-transparent">
                {subjects}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
