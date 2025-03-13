"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import Button from "./buttons";
import LogoutButton from "./buttonslogout";
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { PatternBackground } from "@/components/pattern-background"
import Link from "next/link"
import { User } from "lucide-react"

const cards = [
  {
    id: 1,
    title: "Ready, Set, Quiz!",
    subtitle: "Test your knowledge!",
    color: "from-[#FFF8DC] via-[#FFEFD5] to-[#87CEEB]",
    buttonColor: "bg-[#87CEEB] hover:bg-[#75bcd6]",
    buttonText: "Take a quiz",
    imageSrc: "/gambs.png",
    imageAlt: "Quiz mascot",
    link: "/student/subjects/",
    description:
      "The 'Ready, Set, Quiz!' function takes users straight into a collection of fully published quizzes, all of which are multiple-choice. It's designed for quick, straightforward gameplay where users can test their knowledge and get instant results.",
    features: [
      "Fully Published Quizzes – Only completed and ready-to-play quizzes are available.",
      "Multiple-Choice Only – No written answers, just quick selections.",
      "Instant Feedback – Users get results immediately after answering.",
      "Fast & Fun – Jump right in without any setup or waiting.",
    ],
  },
  {
    id: 2,
    title: "Dive Into Review!",
    subtitle: "Refresh your memory",
    color: "from-[#E0FFFF] via-[#98FB98] to-[#90EE90]",
    buttonColor: "bg-[#98FB98] hover:bg-[#85e085]",
    buttonText: "Review & Master",
    link: "/student/review/",
    imageSrc: "/gambar.png",
    imageAlt: "Review mascot",
    description:
      "The 'Dive Into Review' function allows users to quickly check the correct answers after completing a quiz. Unlike detailed feedback or explanations, this feature simply reveals the right answers without any additional context.",
    features: [
      "Instant Answers – See which answers were correct.",
      "No Explanations – Only the correct choices are displayed.",
      "Quick & Simple – Ideal for users who just want to verify answers without deep analysis.",
    ],
  },
  {
    id: 3,
    title: "Check your scores!",
    subtitle: "See how you did",
    color: "from-[#98FB98] via-[#FAFAD2] to-[#FF6B6B]",
    buttonColor: "bg-[#F0E68C] hover:bg-[#dfd37e]",
    buttonText: "Find out",
    link: "/student/score/",
    imageSrc: "/image.png",
    imageAlt: "Scores mascot",
    description:
      "The 'Check Your Scores!' function allows users to quickly view their quiz results. It provides a simple way to see their final score without any breakdowns or answer reviews.",
    features: [
      "Instant Score Display – See your total score immediately.",
      "No Answer Review – Only shows the final result, not which answers were right or wrong.",
      "Quick & Simple – Ideal for users who just want to check their performance at a glance.",
    ],
  },
]

interface Subject {
  subyek_id: string;
  subyek_name: string;
}

export default function Page() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any | null>(null);
  const [dataSubject, setDataSubject] = useState<Subject[]>([]);

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

  const [activeIndex, setActiveIndex] = useState(0)

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1))
  }

  return (
    <main className="min-h-screen bg-white text-gray-800 overflow-x-hidden">
      <PatternBackground />
      <header className="fixed top-0 w-full z-50">
        <div className="h-16 bg-gradient-to-r from-blue-200 via-green-200 to-pink-300 rounded-b-xl shadow-md">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            {/* Logo dan Mascot */}
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12">
                <Image src="/buaya-darmuh.png" alt="Dinosaur mascot" fill className="object-contain" priority />
              </div>
            </div>

            {/* Navigation Icons */}
            <div className="flex items-center gap-6">
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                <Image src="/Bel.png" alt="Notifications" width={24} height={24} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                <Image src="/Buku-solawat.png" alt="Book" width={24} height={24} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                <Image src="/Pencil.png" alt="Pencil" width={24} height={24} />
              </button>
              <h1 className="text-3xl md:text-xl font-pixel leading-relaxed text-green-400">
                {user?.email}
              </h1>
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section with Carousel */}
      <section className="pt-16 px-4 max-w-7xl mx-auto relative">
        <div className="overflow-hidden py-12">
          <div className="relative h-[400px] flex items-center justify-center">
            {cards.map((card, index) => {
              const position = index - activeIndex

              return (
                <div
                  key={card.id}
                  className={`absolute w-[350px] md:w-[600px] transition-all duration-500 ease-in-out 
                  ${position === 0 ? "z-20 transform-none opacity-100" : ""}
                  ${position < 0 ? "-translate-x-[55%] opacity-40 blur-sm z-10" : ""}
                  ${position > 0 ? "translate-x-[55%] opacity-40 blur-sm z-10" : ""}`}
                >
                  <div
                    className={`p-8 bg-gradient-to-br ${card.color} rounded-[2rem] shadow-lg h-[300px] flex justify-between relative overflow-hidden`}
                  >
                    <div className="w-1/2 space-y-4 z-10">
                      <h2 className="text-3xl md:text-4xl font-pixel leading-relaxed">{card.title}</h2>
                      {card.subtitle && <p className="text-lg font-pixel text-gray-700">{card.subtitle}</p>}
                      <button
                        className={`px-6 py-3 ${card.buttonColor} text-black font-pixel rounded-xl border-2 border-black transition-colors`}
                        onClick={() => card.link ? router.push(card.link) : console.warn("No link provided")}
                      >
                        {card.buttonText}
                      </button>
                    </div>
                    <div className="absolute right-8 bottom-0 my-[1.5vw] w-[250px] h-[250px] flex items-end justify-center">
                      <div className="relative w-full h-full">
                        <Image
                          src={card.imageSrc || "/placeholder.svg"}
                          alt={card.imageAlt}
                          fill
                          className="object-contain object-bottom"
                          priority
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 z-30 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 z-30 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg"
              aria-label="Next slide"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="px-4 max-w-7xl mx-auto pb-20">
        <div className="space-y-16">
          {cards.map((card) => (
            <div key={card.id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 space-y-4">
              <h2 className="text-4xl font-pixel">{card.title}</h2>
              <p className="text-gray-800 font-description">{card.description}</p>
              <div className="space-y-2">
                <h3 className="font-pixel text-lg">Key Features:</h3>
                <ul className="space-y-1 font-description">
                  {card.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
              <button
                className={`px-8 py-3 ${card.buttonColor} text-black font-pixel rounded-xl border-2 border-black transition-colors`}
                onClick={() => card.link ? router.push(card.link) : console.warn("No link provided")}
              >
                {card.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}