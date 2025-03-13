"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { submitAnswer } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";

export default function Page() {
  const router = useRouter();

  interface SubjectType {
    id: string;
    name: string;
  }

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
  const [subject, setSubject] = useState<SubjectType>();
  const [opsi, setOpsi] = useState<OpsiType[]>([]);
  const [questionss, setQuestions] = useState<QuestionsType[]>([]);
  const [ans, setAns] = useState<answer_choicesType[]>([]);

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
  }, []);

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
  }, [user]);

  useEffect(() => {
    const getData = async () => {
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", params.quiz_id)
        .single();
      setQuiz_Data(quizData);
    };
    if (user) {
      getData();
    }
  }, [user]);

  useEffect(() => {
    const getData = async () => {
      if (!quiz_data?.id) return;
      const { data: questionsData } = await supabase
        .from("questions")
        .select("id, question_text")
        .eq("quiz_id", quiz_data.id);

      setQuestions(questionsData ?? []);
    };
    getData();
  }, [quiz_data]);

  useEffect(() => {
    const tempOpsi: OpsiType[] = [];
    for (let q of questionss) {
      tempOpsi.push({
        question_id: q.id,
        question_text: q.question_text,
        option: [0, 0, 0, 0],
        opsi: ["", "", "", ""],
      });
    }
    setOpsi(tempOpsi);
  }, [questionss]);

  useEffect(() => {
    const getData = async () => {
      const allAnswers: answer_choicesType[] = [];
      for (let q1 of questionss) {
        const { data: ansData } = await supabase
          .from("answer_choices")
          .select("*")
          .eq("question_id", q1.id);
        if (ansData) {
          allAnswers.push(...ansData);
        }
      }
      setAns(allAnswers);
    };
    getData();
  }, [questionss]);

  useEffect(() => {
    const newOpsi = [...opsi];
    let questionIndex = 0;

    for (let i = 0; i < ans.length; i++) {
      if (i % 4 === 0 && i > 0) {
        questionIndex++;
      }
      newOpsi[questionIndex].opsi[i % 4] = ans[i].choice_text;
      newOpsi[questionIndex].option[i % 4] = Number(ans[i].is_correct);
    }
    setOpsi(newOpsi);
  }, [ans]);

  const IsiOpsi = (questionIndex: number, choiceIndex: number) => {
    setOpsi((prev) => {
      const updated = [...prev];
      updated[questionIndex].option = updated[questionIndex].option.map(
        (_, idx) => (idx === choiceIndex ? 1 : 0)
      );
      return updated;
    });
  };

  const questions = opsi.map((q, i) => (
    <div key={q.question_id} className="w-full max-w-2xl mb-8">
      <div className="p-4 rounded-lg shadow-lg bg-gradient-to-r from-pink-300 to-purple-300 text-black">
        <h2 className="text-lg font-bold mb-2">Soal {i + 1}</h2>
        <p className="mb-4">{q.question_text}</p>
        <div>
          {q.opsi.map((choice, j) => (
            <label
              key={`${q.question_id}-option-${j}`}
              className="flex items-center mb-2"
            >
              <input
                type="radio"
                className="mr-2"
                name={`question-${q.question_id}`}
                onChange={() => IsiOpsi(i, j)}
              />
              <span>{choice}</span>
            </label>
          ))}
        </div>
      </div>
      {i < opsi.length - 1 && (
        <hr className="border-gray-200 border my-4 w-full max-w-2xl mx-auto" />
      )}
    </div>
  ));

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center pt-8 px-4"
      style={{
        backgroundColor: "#90AFF7",
        backgroundImage: "url('/Pattern.png')",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}
    >
      <button
        onClick={() => router.push(`/student/subjects/${subject?.id}`)}
        className="self-start mb-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Back
      </button>

      <div className="max-w-2xl w-full rounded-lg p-6">
        <h1 className="text-2xl font-bold text-black mb-4">
          {quiz_data?.title}
        </h1>

        {questions}

        <form>
          <Input
            type="hidden"
            name="opsi"
            defaultValue={JSON.stringify(opsi)}
            required
          />
          <Input
            type="hidden"
            name="quizId"
            defaultValue={params.quiz_id}
            required
          />
          <Input
            type="hidden"
            name="subject_id"
            defaultValue={subject?.id}
            required
          />

          <div className="flex justify-center mt-8">
            <SubmitButton
              className="bg-green-500 text-white py-2 px-6 rounded-md text-lg font-bold hover:bg-green-600"
              formAction={submitAnswer}
              pendingText="Submitting answers..."
            >
              Submit Answers!
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
