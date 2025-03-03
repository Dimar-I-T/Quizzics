"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { error } from "console";

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
  const opsi: OptionType[] = JSON.parse(formData.get("opsi") as string);
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const subject_id = formData.get("subject_id")?.toString();
  console.log(subject_id);

  const { data: subjectData } = await supabase.from("subjects").select("*").eq("id", subject_id).single();

  let bisa = 0;
  
  for (let x of opsi){
    for (let y of x.option){
      if (y == true){
        bisa++;
      }
    }
  }

  if (bisa != opsi.length){
    return encodedRedirect(
      "error",
      `/admin/subjects/${subjectData?.name}/quizzes/new`,
      "Questions must have an answer!",
    );
  }

  const { data: quizData, error: insertError } = await supabase.from("quizzes").insert([
    {
      title: title,
      description: description,
      admin_id: user?.id,
      subject_id: subject_id,
    }
  ]).select("id").single();

  const quizId = quizData?.id;

  for (let ops of opsi) {
    if (ops.question == ''){
      continue;
    }
    
    const { data: questionData, error: erro } = await supabase
      .from("questions")
      .insert([{ quiz_id: quizId, question_text: ops.question }])
      .select("id")
      .single();

    if (erro) {
      console.error("Error inserting question:", erro);
    } else if (!questionData) {
      console.error("Question insert returned null");
    }

    const questionId = questionData?.id;

    if (!questionId) {
      console.error("Skipping answer choices due to missing question ID");
      continue;
    }

    for (let x = 0; x < 4; x++) {
      const { error: answerError } = await supabase
        .from("answer_choices")
        .insert([
          {
            question_id: questionId,
            choice_text: ops.opsi[x],
            is_correct: ops.option[x],
          },
        ]);

      if (answerError) {
        console.error("Error inserting answer choice:", answerError);
      }
    }
  }

  return redirect(`/admin/subjects/${subjectData.name}/quizzes`);
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

  let opsi: OptionType[] = JSON.parse(formData.get("opsi") as string);
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const quizId = formData.get("quizId")?.toString();
  let questionSebelumnya: OptionType[] = [];
  console.log(JSON.stringify(opsi, null, 2));
  const subject_id = formData.get("subject_id")?.toString();
  console.log(`subject_id = ${subject_id}`);
  console.log(`quiz_id = ${quizId}`);
  let bisa = 0;
  
  const { data: subjectData } = await supabase.from("subjects").select("*").eq("id", subject_id).single();
  
  for (let x of opsi){
    for (let y of x.option){
      if (y == true){
        bisa++;
      }
    }
  }

  for (let x = 0; x < opsi.length; x++){
    for (let y = 0; y < 4; y++){
      if (opsi[x].opsi[y] == ''){
        opsi[x].opsi[y] = 'x';
      }
    }
  }

  if (bisa != opsi.length){
    return encodedRedirect(
      "error",
      `/admin/subjects/${subjectData?.name}/quizzes/${quizId}`,
      "Questions must have an answer!",
    );
  }

  if (!quizId || !user?.id) {
    console.error("Missing quiz ID or user ID");
    return;
  }

  const { data: updatedQuiz, error: quizError } = await supabase
    .from("quizzes")
    .update({
      title: title,
      description: description,
      admin_id: user.id,
    })
    .eq("id", quizId)
  if (quizError) {
    console.error("Error updating quiz:", quizError);
    return;
  } else {
    console.log("Quiz updated successfully:", updatedQuiz);
  }

  const { data: quesSebelum } = await supabase.from("questions").select("*").eq("quiz_id", quizId);
  if (quesSebelum) {
    questionSebelumnya = quesSebelum;
    console.log(`sebelumnya: ${JSON.stringify(questionSebelumnya, null, 2)}`);
  }

  for (let x = 0; x < questionSebelumnya.length; x++) {
    console.log(`quesId: ${questionSebelumnya[x].id}`)
    const { data, error: deleteError } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionSebelumnya[x].id);

    if (data) {
      console.log(`deleted data: ${data}`);
    }

    if (deleteError) {
      console.log(`error delete: ${JSON.stringify(deleteError, null, 2)}`);
    }
  }

  for (let ops of opsi) {
    if (ops.question_text == ''){
      continue;
    }

    const { data: questionData, error: erro } = await supabase
      .from("questions")
      .insert([{ quiz_id: quizId, question_text: ops.question_text }])
      .select("id")
      .single();

    if (erro) {
      console.error("Error inserting question:", erro);
    } else if (!questionData) {
      console.error("Question insert returned null");
    }

    const questionId = questionData?.id;

    if (!questionId) {
      console.error("Skipping answer choices due to missing question ID");
      continue;
    }

    for (let x = 0; x < 4; x++) {
      const { error: answerError } = await supabase
        .from("answer_choices")
        .insert([
          {
            question_id: questionId,
            choice_text: ops.opsi[x],
            is_correct: ops.option[x],
          },
        ]);

      if (answerError) {
        console.error("Error inserting answer choice:", answerError);
      }
    }
  }

  return redirect(`/admin/subjects/${subjectData.name}/quizzes`);
}

export const submitAnswer = async (formData: FormData) => {
  type OptionType = {
    id: string,
    question_text: string,
    opsi: string[],
    option: boolean[],
  };

  type AnswerType = {
    id: string,
    question_id: string,
    choice_text: string,
    is_correct: boolean,
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let score = 0;
  let right_answers = 0;
  let wrong_answers = 0;
  const opsi: OptionType[] = JSON.parse(formData.get("opsi") as string);
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const quizId = formData.get("quizId")?.toString();
  let questionSebelumnya: OptionType[] = [];
  console.log(JSON.stringify(opsi, null, 2));
  const subject_id = formData.get("subject_id")?.toString();
  console.log(`subject_id = ${subject_id}`);
  console.log(`quiz_id = ${quizId}`);
  console.log(`jawaban: ` + JSON.stringify(opsi, null, 2));

  if (!quizId || !user?.id) {
    console.error("Missing quiz ID or user ID");
    return;
  }

  const { data: quesSebelum } = await supabase.from("questions").select("*").eq("quiz_id", quizId);
  if (quesSebelum) {
    questionSebelumnya = quesSebelum;
    console.log(`sebelumnya: ${JSON.stringify(questionSebelumnya, null, 2)}`);
  }
  
  for (let x = 0; x < questionSebelumnya.length; x++){
    let bisa: boolean = true;
    let map: Record<string, boolean> = {};
    let dataAnswer: AnswerType[];
    const {data, error} = await supabase.from("answer_choices").select("*").eq("question_id", questionSebelumnya[x].id);
    if (data){
      dataAnswer = data;
      for (let y = 0; y < 4; y++){
        map[dataAnswer[y].choice_text] = dataAnswer[y].is_correct;
      }

      for (let y = 0; y < 4; y++){
        if (opsi[x].option[y] == true){
          if (map[opsi[x].opsi[y]] == true){
            right_answers++;
          }else{
            wrong_answers++;
          }

          break;
        }
      }
    }else{
      console.log(error)
    }
  }

  score = Math.round(100*(right_answers / questionSebelumnya.length));
  console.log(`benar: ${right_answers}\nsalah: ${wrong_answers}\nscore: ${score}`);

  const {error} = await supabase.from("quiz_results").insert([{
    quiz_id: quizId,
    student_id: user.id,
    score: score,
    completed_at: new Date().toISOString(),
    right_answers: right_answers,
    wrong_answers: wrong_answers,
  }])

  if (error){
    console.log(error);
  }

  return redirect(`/student`);
}

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
