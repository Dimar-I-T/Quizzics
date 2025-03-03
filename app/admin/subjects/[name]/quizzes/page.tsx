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
  const params = useParams();
  const router = useRouter();
  interface SubjectType {
    id: string,
    name: string
  }

  interface Quiz {
    id: string;
    subject_id: string;
    title: string;
    description: string;
    is_published: boolean;
    created_at: string;
  }

  const [user, setUser] = useState<any | null>(null);
  const [dataQuiz, setDataQuiz] = useState<Quiz[]>([]);
  const [subject, setSubject] = useState<SubjectType>();
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
          if (userData.role == "student") {
            router.push("/login");
          }
        }
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    let namaAwal: string | string[], nama: string = "";
    if (typeof params.name === "string") {
      namaAwal = params.name.split('%20');
      for (let n of namaAwal) {
        nama += " " + n;
      }
    }

    async function getSubject() {
      const { data: quizs } = await supabase.from("subjects").select("*").eq("name", nama.substring(1)).single();
      if (quizs) {
        setSubject(quizs);
      }
    }

    getSubject();
  }, [user]);

  useEffect(() => {
    async function getDataQuiz() {
      if (!user) return;

      const { data: dataQ } = await supabase.from("quizzes").select("*").eq("subject_id", subject?.id);
      if (dataQ) {
        setDataQuiz(dataQ ?? []);
      }
    }

    getDataQuiz();
  }, [subject]);

  const deleteQuiz = async (id: string) => {
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) {
      alert(JSON.stringify(error, null, 2));
    } else {
      const { data: dataQ } = await supabase.from("quizzes").select("*").eq("subject_id", subject?.id);
      setDataQuiz(dataQ ?? []);
    }
  }

  const dataa: Quiz[] = dataQuiz ?? [];

  const quizzes = Array.from({ length: dataa.length }, (_, i) => {
    return (
      <div key={i} className="justify-items-center">
        <div className="relative bg-transparent min-h-auto max-h-[9.5vw] w-[35vw]">
          <button
            onClick={() => router.push(`/admin/subjects/${subject?.name}/quizzes/${dataa[i].id}`)}
            className="relative left-1/2 transform -translate-x-1/2 flex flex-col mt-[1vw] rounded-[2vw] mih-h-auto max-h-[9.5vw] w-[35vw] bg-[grey] opacity-[90%] hover:opacity-[100%]">
            <h1 className="relative m-[0.5vw] text-[white] font-bold text-[2vw]">
              {dataa[i].title}
            </h1>
            <h2 className="relative text-left mx-[1vw] mb-[1vw] text-[1vw] scroll-container font-light text-[white]">
              {dataa[i].description}
            </h2>
          </button>
          <button
            onClick={() => {
              deleteQuiz(dataa[i].id)
            }}
            className="absolute right-0 mr-[1vw] opacity-[90%] hover:opacity-[100%] z-10 top-[1.9vw] rounded-[1vw] bg-[#861c1c] text-[white] text-[1vw] font-bold h-[2.5vw] w-[2.5vw]"
          >
            X
          </button>
        </div>
      </div>

    );
  });

  return (
    <div className="bg-cover justify-items-center bg-[black] min-h-full w-full">
      <div className="relative bg-transparent top-[1vw] h-[40vw] w-[60vw] mt-[2vw]">
        <div className="relative bg-transparent h-[6vw] w-full top-0">
          <div className="relative justify-items-center bg-transparent h-[7vw] w-full">
            <h1 className="relative text-[3vw] top-0 mt-[0.5vw] text-[white] font-bold">
              {subject?.name}
            </h1>
          </div>

          <div className="relative mt-[1vw] flex bg-transparent w-full h-[33vw]">
            <div className="relative border-[white] border-[0.5vw] flex flex-col  mt-[1vw] ml-[2vw] h-[30vw] w-[40vw] bg-transparent">
              <h1 className="sticky m-[0.5vw] text-[white] text-[2vw]">
                Your Quizzes
              </h1>

              <div className="relative flex flex-col scroll-container h-[23vw] w-[36.5vw] bg-transparent">
                {quizzes}
              </div>
            </div>

            <div className="relative justify-items-center m-[1vw] h-[30vw] w-[20vw] bg-transparent">
              <>
                <button
                  onClick={() => { router.push(`/admin/subjects/${subject?.name}/quizzes/new`) }}
                  className="relative left-1/2 transform -translate-x-1/2  text-[white] text-[2vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[8vw] mt-[6vw] w-[15vw]">
                  Create Quiz
                </button>
                <button
                  onClick={() => { router.push("/admin/subjects") }}
                  className="relative left-1/2 transform -translate-x-1/2  text-[white] text-[2vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[8vw] mt-[1vw] w-[15vw]">
                  Back to Subjects
                </button>
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
