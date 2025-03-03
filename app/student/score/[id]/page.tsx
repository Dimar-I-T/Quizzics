"use client"
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import React from 'react';
import { useParams } from 'next/navigation';
import { addQuiz, signUpAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { data } from "autoprefixer";

const page = () => {
    const params = useParams();
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

    interface QuizType {
        quizid: string,
        quiztitle: string,
        quizscore: number,
        rightanswers: number,
        wronganswers: number,
    }

    const [user, setUser] = useState<any | null>(null);
    const [dataQuiz, setDataQuiz] = useState<QuizType[]>([]);
    const [subject, setSubject] = useState<SubjectType>();
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
        async function getSubject() {
            const { data: quizs } = await supabase.from("subjects").select("*").eq("id", params.id).single();
            if (quizs) {
                setSubject(quizs);
            }
        }

        getSubject();
    }, [user]);

    useEffect(() => {
        async function getDataQuiz() {
            if (!user) return;

            const { data, error } = await supabase.rpc('get_quizzes_with_score', {
                subjectid: subject?.id,
                studentid: user?.id,
            });

            if (error) {
                alert('Supabase RPC Error:' + JSON.stringify(error, null, 2));
            } else {
                setDataQuiz(data);
            }
        }

        getDataQuiz();
    }, [subject]);

    const dataa: QuizType[] = dataQuiz ?? [];
    const quizzes = Array.from({ length: dataa.length }, (_, i) => {
        return (
            <div key={i} className="relative justify-items-center">
                <div className="relative bg-transparent top-[-3vw] min-h-auto max-h-[9.5vw] w-[35vw]">
                    <div
                        className="relative flex flex-col items-center mt-[3vw] rounded-[2vw] min-h-auto max-h-[9.5vw] w-[35vw] bg-[grey]">
                        <h1 className="relative m-[0.5vw] text-[white] font-bold text-[2vw]">
                            {dataa[i].quiztitle}
                        </h1>
                    </div>

                    <div className="relative left-1/2 transform inline-flex flex-wrap -translate-x-1/2 bg-transparent h-[3vw] w-auto">
                        <h1 className="relative m-[0.5vw] text-[white] font-light text-[1.5vw]">
                            Score: {dataa[i].quizscore}
                        </h1>
                        <h1 className="relative m-[0.5vw] text-[white] font-light text-[1.5vw]">
                            Benar: {dataa[i].rightanswers}
                        </h1>
                        <h1 className="relative m-[0.5vw] text-[white] font-light text-[1.5vw]">
                            Salah: {dataa[i].wronganswers}
                        </h1>
                    </div>
                </div>
            </div>

        );
    });

    return (
        <div className="bg-cover justify-items-center bg-[black] min-h-full w-full">
            <button
                onClick={() => redirect(`/student/score/`)}
                className="absolute font-light text-[white] left-[5vw] top-[3vw] text-[1vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[3vw] w-[5vw]"
            >
                Back
            </button>
            <div className="relative bg-transparent top-[1vw] h-[40vw] w-[60vw] mt-[2vw]">
                <div className="relative bg-transparent h-[6vw] w-full top-0">
                    <div className="relative justify-items-center bg-transparent h-[7vw] w-full">
                        <h1 className="relative text-[3vw] top-0 mt-[0.5vw] text-[white] font-bold">
                            {subject?.name}
                        </h1>
                    </div>

                    <div className="relative mt-[1vw] flex bg-transparent w-full h-[30vw]">
                        <div className="relative border-[white] left-1/2 transform -translate-x-1/2 border-[0.5vw] flex flex-col mt-[1vw] h-[30vw] w-[40vw] bg-transparent">
                            <h1 className="sticky m-[0.5vw] text-[white] text-[2vw]">
                                Your Scores
                            </h1>

                            <div className="relative flex left-1/2 transform -translate-x-1/2 flex-col scroll-container h-[23vw] w-[36.5vw] bg-transparent">
                                {quizzes}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page
