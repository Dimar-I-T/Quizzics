"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { PatternBackground } from "@/components/pattern-background"
import { useRouter } from "next/navigation"

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
    link: "/login",
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
    imageSrc: "/gambar.png", 
    link: "/login",
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
    link: "/login",
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

export default function Home() {
  const router = useRouter();
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
      <Header />
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
                    {/* Text and Button Column */}
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

                    {/* Image Container */}
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

