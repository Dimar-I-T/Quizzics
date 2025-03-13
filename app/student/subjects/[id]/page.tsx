"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface SubjectType {
  id: string;
  name: string;
}

interface Quiz {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  is_published: boolean;
  created_at: string;
}

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any | null>(null);
  const [dataQuiz, setDataQuiz] = useState<Quiz[]>([]);
  const [subject, setSubject] = useState<SubjectType>();

  // 1. Check user & role
  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
        error: err,
      } = await supabase.auth.getUser();
      if (!user) {
        console.log(err);
        router.push("/login");
      } else {
        setUser(user);
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("email", user?.email)
          .single();
        if (userData && userData.role === "admin") {
          router.push("/login");
        }
      }
    }
    fetchUser();
  }, [router, supabase]);

  // 2. Get subject data
  useEffect(() => {
    async function getSubject() {
      const { data: quizs } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", params.id)
        .single();
      if (quizs) {
        setSubject(quizs);
      }
    }
    if (user) {
      getSubject();
    }
  }, [user, params.id, supabase]);

  // 3. Fetch quizzes via RPC
  useEffect(() => {
    async function getDataQuiz() {
      if (!user || !subject?.id) return;

      const { data, error } = await supabase.rpc("get_quizzes", {
        subjectid: subject.id,
        studentid: user.id,
      });

      if (error) {
        alert("Supabase RPC Error:" + JSON.stringify(error, null, 2));
      } else {
        setDataQuiz(data);
      }
    }
    getDataQuiz();
  }, [subject, user, supabase]);

  return (
    <div
      // A playful gradient background; swap for your own pattern if you like
      className="
        relative 
        min-h-screen 
        w-full 
        bg-gradient-to-b 
        from-[#C2E8FF]  /* Light/pastel blue top */
        to-[#A7D2FF]    /* Slightly darker pastel blue bottom */
        overflow-hidden
        flex 
        flex-col
      "
    >
      {/* Decorative images (like the shark, dino, lizard) in corners */}
      <img
        src="/Pencil.png" 
        alt="Pencil"
        className="absolute top-0 left-0 w-[10vw] h-auto"
      />
      <img
        src="/buaya-darmuh.png"
        alt="Dinosaur"
        className="absolute top-0 right-0 w-[10vw] h-auto"
      />
      <img
        src="/img/lizard.png"
        alt="Lizard"
        className="absolute bottom-0 right-0 w-[8vw] h-auto"
      />

      <div
        className="
          relative
          flex
          items-center
          justify-center
          mt-[2vw]
          mx-auto
          bg-pink-400
          w-[25vw]
          h-[4vw]
          rounded-[1vw]
          shadow-md
        "
      >
        <h1 className="text-white font-bold text-[2vw]">Subject Chooser</h1>
      </div>

      <button
        onClick={() => router.push(`/student/subjects/`)}
        className="
          absolute 
          top-[3vw] 
          left-[5vw] 
          bg-[#007bff] 
          text-white 
          text-[1vw] 
          px-[1.5vw] 
          py-[0.5vw] 
          rounded-[0.8vw] 
          shadow-md
          hover:opacity-90
        "
      >
        Back
      </button>

      <div
        className="
          relative
          flex
          flex-col
          mx-auto
          mt-[6vw]
          w-[60vw]
          min-h-[35vw]
          p-[2vw]
        "
      >
        <h2 className="text-[2vw] text-[black] font-bold text-center mb-[1vw]">
          {subject?.name}
        </h2>

        <h3 className="text-[1.5vw] text-[black] font-semibold text-left mb-[1vw]">
          Available Quizzes
        </h3>

        {/* Quiz list */}
        <div className="flex flex-col gap-[1vw] max-h-[25vw] overflow-auto">
          {dataQuiz?.map((quizItem) => (
            <button
              key={quizItem.id}
              onClick={() =>
                router.push(`/student/subjects/${subject?.id}/${quizItem.id}`)
              }
              className="
                bg-[#E0F7FA]
                hover:bg-[#B2EBF2]
                text-left
                px-[1.5vw]
                py-[1vw]
                rounded-[1vw]
                shadow-md
                transition
                duration-200
              "
            >
              <h4 className="text-[1.2vw] text-[black] font-bold">{quizItem.title}</h4>
              <p className="text-[0.9vw] text-gray-600">{quizItem.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
