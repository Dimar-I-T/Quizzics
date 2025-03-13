"use client"
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import React from 'react';
import { useState, useEffect } from "react";
import IconMail from '@/public/mail';
import Image from 'next/image';

const page = () => {
  interface Subject {
    subjectid: string;
    subjectname: string;
    adminname: string;
  }

  const [user, setUser] = useState<any | null>(null);
  const [dataSubject, setDataSubject] = useState<Subject[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error: err } = await supabase.auth.getUser();
      if (!user) {
        console.log(err);
        redirect("/login");
      } else {
        setUser(user);
        const { data: userData } = await supabase.from("users").select("*").eq("email", user?.email).single();
        if (userData) {
          if (userData.role == "admin") {
            redirect("/login");
          }
        }
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    async function getDataQuiz() {
      if (!user) return;

      const { data, error } = await supabase.rpc('get_subjects_unique', {
        studentid: user?.id,
      });

      if (data) {
        setDataSubject(data ?? []);
      }
    }

    getDataQuiz();
  }, [user]);

  const dataa: Subject[] = dataSubject ?? [];

  const subjects = Array.from({ length: dataa.length }, (_, i) => {
    return (
      <div key={i} className="justify-items-center z-10">
        <div className="relative bg-transparent min-h-auto max-h-[9.5vw] w-[35vw] z-10">
          <button
            onClick={() => redirect(`/student/review/${dataa[i].subjectid}/`)}
            className="relative ml-[1vw] flex items-center mt-[1vw] rounded-[2vw] mih-h-auto max-h-[9.5vw] w-[35vw] bg-[#3F8CFD] opacity-[90%] hover:opacity-[100%]">
            <IconMail className="w-[4vw] h-[4vw] ml-[1vw]" />
            <div className="flex flex-col ml-[1vw]">
              <h1 className="relative m-[0.5vw] text-[white] font-bold text-[2vw]">
                {dataa[i].subjectname}
              </h1>
              <h1 className="relative m-[0.5vw] text-[white] font-light text-[1vw]">
                Creator: {dataa[i].adminname}
              </h1>
            </div>
          </button>
        </div>
      </div>
    );
  });

  return (
    <div className="relative bg-cover justify-items-center bg-[#CCB5FB] min-h-screen w-full overflow-hidden">
      <Image
        src="/Pattern.png"
        alt="Pattern background"
        fill
        className="object-contain repeat-x repeat-y z-0"
        priority
      />
      <button
        onClick={() => redirect(`/student/`)}
        className="absolute font-light text-[white] left-[5vw] top-[3vw] text-[1vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[3vw] w-[5vw]"
      >
        Back
      </button>
      <div className="relative bg-transparent top-[1vw] h-[40vw] w-[60vw]">
        <div className="relative bg-transparent h-[6vw] w-full top-0">
          <div className="relative justify-items-center bg-transparent h-[7vw] w-full">
            <h1 className="relative text-[4vw] top-0 mt-[0.5vw] text-[black] font-bold">
              Review Quizzes
            </h1>
          </div>

          <div className="relative mt-[1vw] flex bg-transparent w-full h-[33vw]">
            <div className="relative border-[#DB82DA] left-1/2 transform -translate-x-1/2 border-[0.5vw] flex flex-col mt-[1vw] h-[30vw] w-[40vw] bg-transparent">
              <h1 className="sticky m-[0.5vw] text-[black] text-[2vw]">
                Review Subjects
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
