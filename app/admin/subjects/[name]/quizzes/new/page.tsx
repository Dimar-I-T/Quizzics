'use client'
import { createClient } from "@/utils/supabase/client";
import React, {Suspense} from 'react'
import { addQuiz, signUpAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { redirect, useRouter } from 'next/navigation';
import { useParams, useSearchParams } from "next/navigation";

const page = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    interface SubjectType {
        id: string,
        name: string
    }

    type OpsiType = {
        question: string;
        option: number[];
        opsi: string[];
    }

    const [banyakQuestion, setBanyakQuestion] = useState(0);
    const [udhDitekan, setUdhDitekan] = useState<number[]>([]);
    const [opsi, setOpsi] = useState<OpsiType[]>([]);
    const [user, setUser] = useState<any | null>(null);
    const [subject, setSubject] = useState<SubjectType>();
    const supabase = createClient();
    const error = searchParams.get("error");

    useEffect(() => {
        async function fetchUser() {
            const { data: { user }, error: err } = await supabase.auth.getUser();
            if (!user) {
                console.log(err);
                router.push("/login");
            } else {
                setUser(user);
                console.log(user);
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

    const IsiOpsi = (indeks1: number, indeks2: number) => {
        setUdhDitekan((prev) => {
            const newUdhDitekan = [...prev];
            newUdhDitekan[indeks1] = 1;
            return newUdhDitekan;
        });

        setOpsi((prev) => {
            const newOpsi = [...prev];
            newOpsi[indeks1] = { ...newOpsi[indeks1], option: [0, 0, 0, 0] };
            newOpsi[indeks1].option[indeks2] = 1;
            return newOpsi;
        });
    }

    const DeleteQuestion = (indeks: number) => {
        udhDitekan.splice(indeks, 1);
        opsi.splice(indeks, 1);
        setBanyakQuestion(banyakQuestion - 1);
    }

    const AddQuestion = () => {
        let ud = udhDitekan;
        ud.push(0);
        setUdhDitekan(ud);
        setOpsi(prevOpsi => [...prevOpsi, { question: ``, option: [0, 0, 0, 0], opsi: ["", "", "", ""] }]);
        setBanyakQuestion(banyakQuestion + 1);
    }

    const questions = Array.from({ length: banyakQuestion }, (_, i) => {
        return (
            <div key={i} className='relative flex bg-transparent min-h-auto w-[60vw] mt-[2vw]'>
                <div className='relative bg-transparetn h-full w-1/2'>
                    <Label htmlFor={`"Question ${i + 1}"`} className="text-[2vw]">Question {i + 1}</Label>
                    <button
                        onClick={() => DeleteQuestion(i)}
                        className="relative ml-[1vw] top-[-0.5vw] bg-[red] text-[white] text-[1vw] font-bold h-[2vw] w-[2vw]">
                        X
                    </button>
                    <textarea
                        placeholder="Enter your question"
                        name="description"
                        value={opsi[i].question}
                        onChange={(e) => {
                            const newOpsi = [...opsi];
                            newOpsi[i].question = e.target.value;
                            setOpsi(newOpsi);
                        }}
                        className="relative p-[0.8vw] placeholder:text-muted-foreground placeholder:text-sm border h-[18.5vw] w-[30vw] focus:outline-none resize-none" />
                </div>
                <div className='relative right-0 bg-transparent ml-[1vw] flex flex-col h-[16.5vw] mt-[3vw] w-[20vw]'>
                    <Label htmlFor="Options" className="ml-[0.5vw] text-[1.5vw]">Options</Label>
                    <div className="relative flex bg-transparent mt-[0.5vw] min-h-auto w-full">
                        <textarea className="ml-[4vw] placeholder:text-sm rounded-[1vw] p-[0.2vw] placeholder:text-muted-foreground focus:outline-none resize-none w-[16.7vw]" value={opsi[i].opsi[0]} placeholder="Option 1"
                            onChange={(e) => {
                                const newOpsi = [...opsi];
                                newOpsi[i].opsi[0] = e.target.value;
                                setOpsi(newOpsi);
                            }}
                            required />
                        <button
                            onClick={() => IsiOpsi(i, 0)}
                            className={`absolute h-[2.8vw] rounded-[1vw] ${udhDitekan[i] == 0 ? "bg-transparent border-[grey] border-[0.3vw]" : (opsi[i].option[0] == 1 ? "bg-[green]" : "bg-[red]")} opacity-[90%] hover:opacity-[100%] w-[3vw]`}>

                        </button>
                    </div>
                    <div className="relative flex bg-transparent mt-[0.5vw] min-h-auto w-full">
                        <textarea className="ml-[4vw] placeholder:text-sm rounded-[1vw] p-[0.2vw] placeholder:text-muted-foreground focus:outline-none resize-none w-[16.7vw]" value={opsi[i].opsi[1]} placeholder="Option 2" required
                            onChange={(e) => {
                                const newOpsi = [...opsi];
                                newOpsi[i].opsi[1] = e.target.value;
                                setOpsi(newOpsi);
                            }}
                        />
                        <button
                            onClick={() => IsiOpsi(i, 1)}
                            className={`absolute  h-[2.8vw] rounded-[1vw] ${udhDitekan[i] == 0 ? "bg-transparent border-[grey] border-[0.3vw]" : (opsi[i].option[1] == 1 ? "bg-[green]" : "bg-[red]")} opacity-[90%] hover:opacity-[100%] w-[3vw]`}>

                        </button>
                    </div>
                    <div className="relative flex bg-transparent mt-[0.5vw] min-h-auto w-full">
                        <textarea className="ml-[4vw] placeholder:text-sm rounded-[1vw] p-[0.2vw] placeholder:text-muted-foreground focus:outline-none resize-none w-[16.7vw]" value={opsi[i].opsi[2]} placeholder="Option 3"
                            onChange={(e) => {
                                const newOpsi = [...opsi];
                                newOpsi[i].opsi[2] = e.target.value;
                                setOpsi(newOpsi);
                            }}
                            required />
                        <button
                            onClick={() => IsiOpsi(i, 2)}
                            className={`absolute  h-[2.8vw] rounded-[1vw] ${udhDitekan[i] == 0 ? "bg-transparent border-[grey] border-[0.3vw]" : (opsi[i].option[2] == 1 ? "bg-[green]" : "bg-[red]")} opacity-[90%] hover:opacity-[100%] w-[3vw]`}>

                        </button>
                    </div>
                    <div className="relative flex bg-transparent mt-[0.5vw] min-h-auto w-full">
                        <textarea className="ml-[4vw] placeholder:text-sm rounded-[1vw] p-[0.2vw] placeholder:text-muted-foreground focus:outline-none resize-none w-[16.7vw]" value={opsi[i].opsi[3]} placeholder="Option 4"
                            onChange={(e) => {
                                const newOpsi = [...opsi];
                                newOpsi[i].opsi[3] = e.target.value;
                                setOpsi(newOpsi);
                            }}
                            required />
                        <button
                            onClick={() => IsiOpsi(i, 3)}
                            className={`absolute  h-[2.8vw] rounded-[1vw] ${udhDitekan[i] == 0 ? "bg-transparent border-[grey] border-[0.3vw]" : (opsi[i].option[3] == 1 ? "bg-[green]" : "bg-[red]")} opacity-[90%] hover:opacity-[100%] w-[3vw]`}>

                        </button>
                    </div>
                </div>
            </div>
        );
    });

    return (
        <div className="bg-cover justify-items-center bg-[black] min-h-full w-full">
            <div className="relative flex flex-col bg-transparent top-[1vw] min-h-auto w-[60vw] mt-[2vw]">
                <div className="relative bg-transparent h-[6vw] w-full top-0">
                    <div className="relative justify-items-center bg-transparent h-[7vw] w-full">
                        <button
                            onClick={() => { router.push(`/admin/subjects/${subject?.name}/quizzes`) }}
                            className="absolute font-light text-[white] left-[5vw] top-[1.5vw] text-[1vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[3vw] w-[5vw]">
                            Back
                        </button>
                        <h1 className="relative text-[4vw] top-0 mt-[0.5vw] text-[white] font-bold">
                            Create Quiz Page
                        </h1>
                    </div>
                </div>
                <Suspense>
                    {error && <h2 className="relative text-[1vw] text-[white] font-light">
                        Questions must have an answer!
                    </h2>}
                </Suspense>
                <form>
                    <div className="relative flex flex-col bg-transparent min-h-auto w-[60vw] mt-[2vw]">
                        <Label htmlFor="title" className="text-[1.5vw]">Title</Label>
                        <Input className="mb-[1vw] w-[20vw]" name="title" placeholder="Enter your quiz title" required />
                        <div className="relative flex flex-wrap w-[30vw] h-[17vw] bg-transparent">
                            <Label htmlFor="description" className="text-[1.5vw]">Description</Label>
                            <textarea
                                placeholder="Enter your description"
                                name="description"
                                className="absolute bottom-0 p-[0.8vw] placeholder:text-muted-foreground placeholder:text-sm top-[2.5vw] border h-[15vw] w-[30vw] focus:outline-none resize-none" />
                        </div>
                    </div>

                    <Input type="hidden" name="opsi" value={JSON.stringify(opsi)} required />
                    <Input type="hidden" name="subject_id" defaultValue={subject?.id} required />

                    <SubmitButton className="absolute h-[8vw] w-[15vw] top-[15vw] left-[38vw] rounded-[2vw] text-[1.5vw] font-bold" formAction={addQuiz} pendingText="Adding quiz...">
                        CREATE QUIZ!
                    </SubmitButton>

                </form>
                <>{questions}</>
                <div className="relative left-1/2 transorm -translate-x-1/2 justify-items-center bg-transparent mt-[2vw] h-[7vw] w-[23vw]">
                    <button
                        onClick={AddQuestion}
                        className="relative left-1/2 transorm -translate-x-1/2 font-bold text-[white] text-[1vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[5vw] w-[10vw]">
                        + ADD QUESTION
                    </button>
                </div>

            </div>
        </div>
    )
}

export default page;
