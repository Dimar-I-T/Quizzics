"use client";
import { createClient } from "@/utils/supabase/client";
import { redirect, useRouter } from "next/navigation";
import React from "react";
import { useParams } from "next/navigation";
import { editQuiz } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";

export default function Page() {
    const router = useRouter();
    type answer_choicesType = {
        id: string;
        question_id: string;
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

    const [user, setUser] = useState<any | null>(null);
    const [quiz_data, setQuiz_Data] = useState<QuizType>();
    const [loading, setLoading] = useState(true);
    const [banyakQuestion, setBanyakQuestion] = useState(0);
    const [opsi, setOpsi] = useState<OpsiType[]>([]);
    const [questionss, setQuestions] = useState<QuestionsType[]>([]);
    const [ans, setAns] = useState<answer_choicesType[]>([]);
    const [udhDitekan, setUdhDitekan] = useState<number[]>([]);

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
        const getData = async () => {
            const { data: quizData } = await supabase.from("quizzes").select("*").eq("id", params.name).single();
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
        for (let x = 0; x < ans.length; x++) {
            if (x % 4 == 0 && x > 0) {
                k++;
            }

            e[k].opsi[x % 4] = ans[x].choice_text;
            e[k].option[x % 4] = Number(ans[x].is_correct);
        }

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

    const AddQuestion = () => {
        const newQuestionId = `new-question-${Date.now()}`;
        setUdhDitekan((prev) => [...prev, 0]);
        setOpsi((prevOpsi) => [
            ...prevOpsi,
            { question_id: newQuestionId, question_text: "", option: [0, 0, 0, 0], opsi: ["", "", "", ""] },
        ]);
        setBanyakQuestion((prev) => prev + 1);
    };

    const DeleteQuestion = (indeks: number) => {
        setUdhDitekan((prev) => prev.filter((_, i) => i !== indeks));
        setOpsi((prevOpsi) => prevOpsi.filter((_, i) => i !== indeks));
        setBanyakQuestion((prev) => prev - 1);
    };

    const questions = opsi.map((q, i) => (
        <div key={q.question_id} className="relative flex bg-transparent min-h-auto w-[60vw] mt-[2vw]">
            <div className="relative bg-transparent h-full w-1/2">
                <Label htmlFor={`Question ${i + 1}`} className="text-[2vw]">
                    Question {i + 1}
                </Label>
                <button
                    onClick={() => {
                        DeleteQuestion(i)
                    }}
                    className="relative ml-[1vw] top-[-0.5vw] bg-[red] text-[white] text-[1vw] font-bold h-[2vw] w-[2vw]"
                >
                    X
                </button>
                <textarea
                    placeholder="Enter your question"
                    name="description"
                    value={q.question_text}
                    onChange={(e) => {
                        const newOpsi = [...opsi];
                        newOpsi[i].question_text = e.target.value;
                        setOpsi(newOpsi);
                    }}
                    className="relative p-[0.8vw] placeholder:text-muted-foreground placeholder:text-sm border h-[18.5vw] w-[30vw] focus:outline-none resize-none"
                />

                {q.opsi.map((choice, j) => (
                    <div key={`${q.question_id}-option-${j}`}>
                        <input
                            type="radio"
                            className="relative top-[-1.05vw] h-[2vw] w-[2vw]"
                            name={`question-${q.question_id}`}
                            checked={q.option[j] === 1}
                            onChange={() => IsiOpsi(i, j)}
                        />
                        <textarea
                            value={choice}
                            placeholder={`Option ${j + 1}`}
                            className="ml-[1vw] placeholder:text-sm rounded-[1vw] p-[0.2vw] placeholder:text-muted-foreground scroll-container focus:outline-none resize-none w-[16.7vw]"
                            onChange={(e) => {
                                const newOpsi = [...opsi];
                                newOpsi[i].opsi[j] = e.target.value;
                                setOpsi(newOpsi);
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    ));

    return (
        <div className="bg-cover justify-items-center bg-[black] min-h-full w-full">
            <div className="relative flex flex-col bg-transparent top-[1vw] min-h-auto w-[60vw] mt-[2vw]">
                <div className="relative bg-transparent h-[6vw] w-full top-0">
                    <div className="relative justify-items-center bg-transparent h-[7vw] w-full">
                        <button
                            onClick={() => router.push("/admin/quizzes")}
                            className="absolute font-light text-[white] left-[5vw] top-[1.5vw] text-[1vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[3vw] w-[5vw]"
                        >
                            Back
                        </button>
                        <h1 className="relative text-[4vw] top-0 mt-[0.5vw] text-[white] font-bold">
                            Edit {quiz_data?.title}
                        </h1>
                    </div>
                </div>
                <form>
                    <div className="relative flex flex-col bg-transparent min-h-auto w-[60vw] mt-[2vw]">
                        <Label htmlFor="title" className="text-[1.5vw]">
                            Title
                        </Label>
                        <Input
                            className="mb-[1vw] w-[20vw]"
                            name="title"
                            defaultValue={quiz_data?.title}
                            placeholder="Enter your quiz title"
                            required
                        />
                        <div className="relative flex flex-wrap w-[30vw] h-[17vw] bg-transparent">
                            <Label htmlFor="description" className="text-[1.5vw]">
                                Description
                            </Label>
                            <textarea
                                placeholder="Enter your description"
                                name="description"
                                defaultValue={quiz_data?.description}
                                className="absolute bottom-0 p-[0.8vw] placeholder:text-muted-foreground placeholder:text-sm top-[2.5vw] border h-[15vw] w-[30vw] focus:outline-none resize-none"
                            />
                        </div>
                    </div>

                    <Input type="hidden" name="opsi" value={JSON.stringify(opsi)} required />
                    <Input type="hidden" name="quizId" value={params.id} required />

                    <SubmitButton
                        className="absolute h-[8vw] w-[15vw] top-[15vw] left-[38vw] rounded-[2vw] text-[1.5vw] font-bold"
                        formAction={editQuiz}
                        pendingText="Updating quiz..."
                    >
                        EDIT QUIZ!
                    </SubmitButton>
                </form>
                <>{questions}</>
                <div className="relative left-1/2 transform -translate-x-1/2 justify-items-center bg-transparent mt-[2vw] h-[7vw] w-[23vw]">
                    <button
                        onClick={AddQuestion}
                        className="relative left-1/2 transform -translate-x-1/2 font-bold text-[white] text-[1vw] opacity-[90%] hover:opacity-[100%] rounded-[2vw] bg-[#007bff] h-[5vw] w-[10vw]"
                    >
                        + ADD QUESTION
                    </button>
                </div>
            </div>
        </div>
    );
}