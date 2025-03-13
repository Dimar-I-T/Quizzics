"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Subject {
  subyek_id: string;
  subyek_name: string;
}

export default function Page() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any | null>(null);
  const [dataSubject, setDataSubject] = useState<Subject[]>([]);

  // 1. Check user & role
  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!user) {
        console.log(error);
        router.push("/login");
      } else {
        setUser(user);

        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single();

        if (userData?.role === "admin") {
          router.push("/login");
        }
      }
    }
    fetchUser();
  }, [router, supabase]);

  useEffect(() => {
    async function getDataQuiz() {
      if (!user) return;
      const { data: dataQ } = await supabase.rpc("get_subjects_available", {
        studentid: user.id,
      });
      setDataSubject(dataQ ?? []);
    }
    getDataQuiz();
  }, [user, supabase]);

  // 3. Map the subject list
  const subjectsList = dataSubject.map((subject) => (
    <div key={subject.subyek_id}>
      <button
        onClick={() => router.push(`/student/subjects/${subject.subyek_id}/`)}
        className="
          w-full flex items-center
          px-6 py-5
          hover:bg-green-200
          cursor-pointer
        "
      >
        <img src="/Pencil.png" alt="Subject Icon" className="w-12 h-12 mr-5" />
        <div className="flex flex-col text-left">
          <span className="font-bold text-2xl text-black">
            {subject.subyek_name}
          </span>
          <span className="text-xl text-black">Questions: () | Marks: ()</span>
        </div>
      </button>
      <hr className="border-t border-black mx-6" />
    </div>
  ));

  return (
    <div
      className="relative min-h-screen w-full bg-repeat bg-left-top"
      style={{
        backgroundImage: "url('/Pattern.png')",
        backgroundColor: "#ccff90",
      }}
    >
      {/* Top Bar */}
      <div className="relative flex items-center justify-between px-6 py-4">
        <img src="/buaya-darmuh.png" alt="Frog Icon" className="w-30 h-20" />

        {/* Center Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div className="flex items-center">
            <h1 className="text-4xl font-bold text-black mr-3">Available Quiz</h1>
            <img src="/Buku-solawat.png" alt="Edit Icon" className="w-6 h-6" />
          </div>
          <span className="text-xl text-gray-700 mt-1">Click To Proceed</span>
        </div>
      </div>

      {/* Centered Container for Subjects */}
      <div className="flex justify-center mt-2 mb-6">
        <div className="w-full max-w-2xl">
          {subjectsList.length > 0 ? (
            subjectsList
          ) : (
            <div className="text-center text-black mt-10 text-2xl">
              No subjects available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
