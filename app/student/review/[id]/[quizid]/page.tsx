"use client";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import React from "react";
import { useParams } from "next/navigation";
import { submitAnswer } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import IconBook from "@/public/book";

export default function Page() {
    interface SubjectType {
        id: string,
        name: string
    }

    type answer_choicesType = {
        id: string;
        question_id: string;
        choice_text: string;
        is_correct: boolean;
    };

    type OptionOpsiType = {
        choice_text: string;
        is_correct: boolean;
    };

    type OpsiType = {
        question_id: string;
        question_text: string;
        option: number[];
        opsi: string[];
    };

    type QuizType = {
        id: string;
        title: string;
        description: string;
    };

    type QuestionsType = {
        id: string;
        question_text: string;
    };

    const supabase = createClient();
    const params = useParams();

    const [jawabanBenar, setJawabanBenar] = useState<number[]>([]);
    const abcd = ['A.', 'B.', 'C.', 'D.'];
    const [user, setUser] = useState<any | null>(null);
    const [quiz_data, setQuiz_Data] = useState<QuizType>();
    const [loading, setLoading] = useState(true);
    const [subject, setSubject] = useState<SubjectType>();
    const [banyakQuestion, setBanyakQuestion] = useState(0);
    const [opsi, setOpsi] = useState<OpsiType[]>([]);
    const [questionss, setQuestions] = useState<QuestionsType[]>([]);
    const [opsi_option, setOO] = useState<OptionOpsiType[]>([]);
    const [ans, setAns] = useState<answer_choicesType[]>([]);
    const [udhDitekan, setUdhDitekan] = useState<number[]>([]);


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
        let namaAwal: string | string[], nama: string = "";
        if (typeof params.name === "string") {
            namaAwal = params.name.split('%20');
            for (let n of namaAwal) {
                nama += " " + n;
            }
        }

        async function getSubject() {
            const { data: quizs } = await supabase.from("subjects").select("*").eq("id", params.id).single();
            if (quizs) {
                setSubject(quizs);
            }
        }

        getSubject();
    }, [user]);

    useEffect(() => {
        const getData = async () => {
            const { data: quizData } = await supabase.from("quizzes").select("*").eq("id", params.quizid).single();
            setQuiz_Data(quizData);
        };

        getData();
    }, [user]);


    useEffect(() => {
        const getData = async () => {
            if (!quiz_data?.id) return;
            const { data: questionsData, error } = await supabase.from("questions").select("id, question_text").eq("quiz_id", quiz_data.id);
            console.log("Raw Questions Data:", questionsData);

            const quesData: QuestionsType[] = questionsData ?? [];
            setQuestions(quesData);
        };

        getData();
    }, [quiz_data]);


    useEffect(() => {
        const e: OpsiType[] = [];
        const udh: number[] = [];
        for (let q of questionss) {
            e.push({ question_id: q.id, question_text: q.question_text, option: [0, 0, 0, 0], opsi: ["", "", "", ""] });
            udh.push(1);
        }

        setOpsi(e);
        setUdhDitekan(udh);
        setBanyakQuestion(questionss.length);
    }, [questionss]);

    useEffect(() => {
        const getData = async () => {
            const e: answer_choicesType[] = [];
            for (let q1 of questionss) {
                const { data: ansData, error } = await supabase.from("answer_choices").select("*").eq("question_id", q1.id);
                if (ansData) {
                    e.push(...ansData);
                }
            }

            setAns(e);
        };

        getData();
    }, [questionss]);

    useEffect(() => {
        const e: OpsiType[] = opsi;
        let k = 0;
        let idx: number[] = [];
        for (let x = 0; x < ans.length; x++) {
            if (x % 4 == 0 && x > 0) {
                k++;
            }

            if (e[k].option[x % 4] == 1){
                idx.push(x % 4);
            }

            setJawabanBenar(idx);
            e[k].opsi[x % 4] = ans[x].choice_text;
            e[k].option[x % 4] = Number(ans[x].is_correct);
        }

        setJawabanBenar(idx);
        setOpsi(e);
    }, [ans]);


    const IsiOpsi = (indeks1: number, indeks2: number) => {
        setOpsi((prev) => {
            const newOpsi = [...prev];
            newOpsi[indeks1].option = newOpsi[indeks1].option.map((_, index) =>
                index === indeks2 ? 1 : 0
            );
            return newOpsi;
        });
    };

    const questions = opsi.map((q, i, arr) => (
        <div key={q.question_id} className=" sm:mb-5 sm:mt-3 md:mb-7 md:mt-4 mb-3 mt-2">
            <div>

                {/* Question */}
                <div className="h-auto py-3 xs:py-5 sm:py-12 md:py-[40px] mx-auto w-[320px] xs:w-[420px] sm:w-[600px] md:w-[700px] relative">
                    <Image
                        src="/disc.png"
                        alt="Question background"
                        fill
                        className="object-contain z-0"
                    />
                    
                    <div className="mb-4 sm:mb-6 md:mb-8 w-full text-black relative z-10">
                        <div className="grid grid-cols-2 md:gap-1 gap-0 ml-[27px] xs:ml-[40px] sm:ml-[50px] md:ml-[70px]  mt-[4px] xs:mt-[0px]  md:mt-[10px] ">
                            <Label htmlFor={`Question ${i + 1}`} className="col-span-2 text-[13px] xs:text-[17px] sm:text-[20px] md:text-[25px] font-semibold">
                                Question {i + 1}
                            </Label>
                            <h1 className="text-[10px] xs:text-[12px] sm:text-[15px] md:text-[20px] col-span-2">{q.question_text}</h1>
                            
                            {q.opsi.map((choice, j) => (
                                <div key={`${q.question_id}-option-${j}`} className="sm:py-0 text-[10px] xs:text-[12px] sm:text-[15px] md:text-[20px]">
                                    <div className="flex">
                                        <span className="mr-2">{abcd[j]}</span>
                                        <span>{choice}</span>
                                    </div>
                                </div>
                            ))}    
                        </div>
                    </div>
     
                </div>
                
                <div className="p-1 sm:p-2 mx-auto flex items-center justify-center gap-3 xs:gap-4 sm:gap-5">
                        
                    <h1 className="text-[13px] xs:text-[17px] sm:text-[20px] md:text-[25px] text-black font-bold">
                        Jawaban Benar
                    </h1>

                    {/* Answer */}
                </div>         
                <div className="mb-6 h-auto py-[10px] xs:py-[20px] sm:py-[40px] mx-auto w-[140px] xs:w-[210px] sm:w-[320px] md:w-[500px] relative">
                    <Image
                        src="/answerpic.png"
                        alt="Answer background"
                        fill
                        className="object-contain z-0"
                    />
                    <h1 className="relative z-10 justify-self-center  text-black text-[10px] xs:text-[15px] sm:text-[23px] md:text-[25px]">
                        {abcd[jawabanBenar[i]]} &nbsp; {opsi[i].opsi[jawabanBenar[i]]}
                    </h1>    
                </div>       

                {i < arr.length - 1 && (
                    <div className="h-2 w-6/12 mx-auto bg-[#DB82DA] rounded-full  my-2 sm:my-4 md:my-9"></div>
                )}
            </div>
        </div>
    ));

    return (
        <div className="w-full min-h-screen bg-[#90AFF7]">
            <div className="justify-self-center w-[80%] mx-auto pt-10">
                <div className="grid grid-cols-4 h-full w-full">
                    <button
                    onClick={() => redirect(`/student/`)}
                    className="mr-[10px] sm:mr-[20px] justify-self-end p-2 transition-colors"
                    >
                    <svg 
                        className="w-6 h-6 sm:w-8 sm:h-8" 
                        fill="none" 
                        stroke="#870B6C"
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 6h16M4 12h16M4 18h16" 
                        />
                    </svg>
                    
                    </button>
                    
                    {/* TITLE PEMBAHASAN
                    
                    */}
                    <div className="col-span-2 border-2 p-2 sm:p-3 md:p-4 border-black justify-items-center bg-[#A7F386] rounded-[15px] sm:rounded-[20px] md:rounded-[25px] flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
                        <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center">
                            <IconBook className="w-full h-full" />
                        </div>
                        <h1 className="text-sm sm:text-xl md:text-2xl text-black font-bold flex items-center">
                            PEMBAHASAN
                        </h1>   
                    </div>
                
                </div>
            </div>
            
            <div className="justify-items-center w-full">
                <div className="pt-2 sm:pt-0 grid justify-items-center w-full pb-20 relative" 
                    style={{
                        backgroundImage: 'url("/pattern.png")',
                        backgroundRepeat: 'repeat',
                    }}
                >
                    <div className="mt-0 xs:mt-[10px] md:mt-[20px] w-[90%] max-w-[900px] h-auto sm:mb-[50px] md:mb-[40px] mb-[20px]">{questions}</div>
                </div>
            </div>
        </div>
        
    );
}