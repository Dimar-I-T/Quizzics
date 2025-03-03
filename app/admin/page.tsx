import React from 'react'
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Buttons from './buttons';
import Buttons1 from './buttonslogout';

const page = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/login");
  }

  const {data: userData} = await supabase.from("users").select("*").eq("email", user.email).single();
  
  if (userData.role == "student"){
    return redirect("/login");
  }

  return (
    <div className="bg-cover justify-items-center bg-[black] min-h-full w-full">
      <Buttons1 />
      <div className="relative bg-transparent top-[4vw] h-[40vw] w-[60vw] mt-[2vw]">
        <div className="relative justify-items-center bg-transparent h-[6vw] w-full top-0">
          <h1 className="relative text-[2vw] top-0 mt-[0.5vw] text-[white] font-bold">
            Kamu Admin
          </h1>
        </div>

        <div className="relative bg-transparent h-[10vw] w-[40vw]">
          <h1 className="relative text-[2vw] ml-[1vw] font-light text-[white]">
            Username: {userData.name}
          </h1>
          <h1 className="relative text-[2vw] ml-[1vw] font-light text-[white]">
            Email: {user.email}
          </h1>
          <h1 className="relative text-[2vw] ml-[1vw] font-light text-[white]">
            Role: {userData.role}
          </h1>
        </div>

        <Buttons/>
      </div>
    </div>
  )
}

export default page
