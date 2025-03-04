"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const username = formData.get("username")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const role = Number(formData.get("role"));
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const roleString = (role == 0) ? "admin" : "student";

  console.log(`username: ${username}`);
  console.log(`email: ${email}`);
  console.log(`password: ${password}`);
  console.log(`role: ${role}`);

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/register",
      "Email and password are required",
    );
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?role=${roleString}`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/register", error.message);
  } else {
    const userId = authData?.user?.id;
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: userId,
        email: authData?.user?.email,
        name: username,
        role: roleString,
      }
    ])

    if (insertError) {
      console.error("Insert Error:", insertError.message);
      return encodedRedirect("error", "/register", insertError.message);
    }

    return encodedRedirect(
      "success",
      "/register",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  console.log(`email login: ${email}`);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/login", "Email or password is incorrect!");
  }

  const { data } = await supabase.from('users').select("role").eq('email', email).single();

  if (data?.role == "admin") {
    return redirect("/admin");
  } else {
    return redirect("/student");
  }
};

export const addSubject = async (formData: FormData) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subjectName = formData.get("name")?.toString();
  const { data: nama } = await supabase.from("subjects").select("*").eq("name", subjectName).single();
  console.log(nama);
  if (nama) {
    return encodedRedirect(
      "error",
      "/admin/subjects/new",
      "Subject Name already used"
    );
  }

  const { data, error } = await supabase.from("subjects").insert([
    {
      name: subjectName,
      admin_id: user?.id
    }
  ]).select("id").single();

  if (error) {
    return encodedRedirect(
      "error",
      "/admin/subjects/new",
      `${error}`,
    );
  } else {
    return redirect("/admin/subjects");
  }
}

export const addQuiz = async (formData: FormData) => {
  type OptionType = {
    question: string;
    opsi: string[];
    option: boolean[];
  };
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("User is not authenticated");
    return;
  }
  
  const opsi: OptionType[] = JSON.parse(formData.get("opsi") as string);
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const subject_id = formData.get("subject_id")?.toString();
  
  if (!subject_id) {
    console.error("Missing subject_id");
    return;
  }

  const [subjectResult, quizInsertResult] = await Promise.all([
    supabase.from("subjects").select("name").eq("id", subject_id).single(),
    supabase
      .from("quizzes")
      .insert([{ title, description, admin_id: user.id, subject_id }])
      .select("id")
      .single(),
  ]);
  
  const subjectData = subjectResult.data;
  const quizData = quizInsertResult.data;
  const insertError = quizInsertResult.error;
  
  if (insertError) {
    console.error("Error inserting quiz:", insertError);
    return;
  }
  
  const quizId = quizData?.id;
  if (!quizId) {
    console.error("Quiz insertion failed, no ID returned");
    return;
  }
  
  const questionsToInsert = opsi
    .filter((q) => q.question.trim() !== "")
    .map((q) => ({
      quiz_id: quizId,
      question_text: q.question,
    }));
  
  const { data: insertedQuestions, error: questionsError } = await supabase
    .from("questions")
    .insert(questionsToInsert)
    .select("id");
  
  if (questionsError) {
    console.error("Error inserting questions:", questionsError);
    return;
  }
  
  const answersToInsert = insertedQuestions.flatMap((question, index) =>
    opsi[index].opsi.map((choice, i) => ({
      question_id: question.id,
      choice_text: choice,
      is_correct: opsi[index].option[i],
    }))
  );
  
  const { error: answersError } = await supabase
    .from("answer_choices")
    .insert(answersToInsert);
  
  if (answersError) {
    console.error("Error inserting answer choices:", answersError);
    return;
  }
  
  return redirect(`/admin/subjects/${subjectData?.name}/quizzes`);
  
}

export const editQuiz = async (formData: FormData) => {
  type OptionType = {
    id: string;
    question_text: string;
    opsi: string[];
    option: boolean[];
  };
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("User is not authenticated");
    return;
  }
  
  const opsi: OptionType[] = JSON.parse(formData.get("opsi") as string);
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const quizId = formData.get("quizId")?.toString();
  const subject_id = formData.get("subject_id")?.toString();
  
  if (!quizId) {
    console.error("Missing quiz ID");
    return;
  }
  
  console.log(`subject_id = ${subject_id}`);
  console.log(`quiz_id = ${quizId}`);
  
  const [subjectResult, quizUpdateResult] = await Promise.all([
    supabase.from("subjects").select("name").eq("id", subject_id).single(),
    supabase
      .from("quizzes")
      .update({ title, description, admin_id: user.id })
      .eq("id", quizId),
  ]);
  
  const subjectData = subjectResult.data;
  const quizError = quizUpdateResult.error;
  
  if (quizError) {
    console.error("Error updating quiz:", quizError);
    return;
  }
  
  const { data: previousQuestions, error: questionsError } = await supabase
    .from("questions")
    .select("id")
    .eq("quiz_id", quizId);
  
  if (questionsError) {
    console.error("Error fetching previous questions:", questionsError);
    return;
  }
  
  if (previousQuestions?.length) {
    const questionIds = previousQuestions.map((q) => q.id);
    const { error: deleteError } = await supabase
      .from("questions")
      .delete()
      .in("id", questionIds);
  
    if (deleteError) {
      console.error("Error deleting previous questions:", deleteError);
      return;
    }
  }
  
  const newQuestions = opsi
    .filter((q) => q.question_text.trim() !== "")
    .map((q) => ({
      quiz_id: quizId,
      question_text: q.question_text,
    }));
  
  const { data: insertedQuestions, error: insertQuestionsError } = await supabase
    .from("questions")
    .insert(newQuestions)
    .select("id");
  
  if (insertQuestionsError) {
    console.error("Error inserting questions:", insertQuestionsError);
    return;
  }
  
  const newAnswers = insertedQuestions.flatMap((question, index) =>
    opsi[index].opsi.map((choice, i) => ({
      question_id: question.id,
      choice_text: choice,
      is_correct: opsi[index].option[i],
    }))
  );
  
  const { error: insertAnswersError } = await supabase
    .from("answer_choices")
    .insert(newAnswers);
  
  if (insertAnswersError) {
    console.error("Error inserting answer choices:", insertAnswersError);
    return;
  }
  
  return redirect(`/admin/subjects/${subjectData?.name}/quizzes`);
}

export const submitAnswer = async (formData: FormData) => {
  type OptionType = {
    question_id: string;
    question_text: string;
    opsi: string[];
    option: boolean[];
  };
  
  type AnswerType = {
    id: string;
    question_id: string;
    choice_text: string;
    is_correct: boolean;
  };
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user?.id) {
    console.error("User is not authenticated");
    return;
  }
  
  const opsi: OptionType[] = JSON.parse(formData.get("opsi") as string);
  const quizId = formData.get("quizId")?.toString();
  
  if (!quizId) {
    console.error("Missing quiz ID");
    return;
  }
  
  console.log(`quiz_id = ${quizId}`);
  console.log(`jawaban: `, JSON.stringify(opsi, null, 2));
  console.log("id: " + JSON.stringify(opsi, null, 2));
  const [{ data: questions }, { data: answers }] = await Promise.all([
    supabase.from("questions").select("id").eq("quiz_id", quizId),
    supabase.from("answer_choices").select("question_id, choice_text, is_correct").in("question_id", opsi.map(q => q.question_id)),
  ]);
  
  console.log("answer: " + JSON.stringify(answers, null, 2));

  if (!questions || !answers) {
    console.error("Failed to fetch quiz data.");
    return;
  }
  
  const answerMap: Record<string, boolean> = {};
  answers.forEach(({ question_id, choice_text, is_correct }) => {
    answerMap[`${question_id}-${choice_text.trim()}`] = is_correct;
  });
  
  let right_answers = 0;
  let wrong_answers = 0;
  
  for (const question of opsi) {
    console.log(`question: ` + JSON.stringify(question, null, 2));
    for (let i = 0; i < 4; i++) {
      console.log(question.option[i]);
      if (question.option[i] == true) {
        console.log(`benar: ` + answerMap[`${question.question_id}-${question.opsi[i].trim()}`]);
        console.log(`opsinya: `+question.option[i]);
        console.log(`textnya: ` + question.opsi[i]);
        if (answerMap[`${question.question_id}-${question.opsi[i].trim()}`]) {
          right_answers++;
        } else {
          wrong_answers++;
        }
        break;
      }
    }
  }
  
  const score = Math.round((100 * right_answers) / questions.length);
  
  console.log(`benar: ${right_answers}\nsalah: ${wrong_answers}\nscore: ${score}`);
  
  const { error } = await supabase.from("quiz_results").insert([
    {
      quiz_id: quizId,
      student_id: user.id,
      score,
      completed_at: new Date().toISOString(),
      right_answers,
      wrong_answers,
    },
  ]);
  
  if (error) {
    console.error("Error inserting quiz result:", error);
  }
  
  return redirect(`/student`);
}