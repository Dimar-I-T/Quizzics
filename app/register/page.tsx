"use client"

import { useState, Suspense } from "react"
import type React from "react"
import Link from "next/link"
import { signUpAction } from "@/app/actions";
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useSearchParams } from "next/navigation";

type Role = "admin" | "student"

const ErrorMessage = () => {
    const searchParams = useSearchParams();
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (!error && !success) {
        return null
    } else {
        return (
            <>
                {success && <h1 className="font-pixel ml-2 text-black">
                    {success}
                </h1>}
                {error == `duplicate key value violates unique constraint "users_email_key"` && <h1 className="font-pixel ml-2 text-black">
                    Email is already used!
                </h1>}
                {error && error != `duplicate key value violates unique constraint "users_email_key"` && <h1 className="font-pixel ml-2 text-black">
                    {error}</h1>}
            </>)
    }
}

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "student" as Role,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const form = new FormData()
        form.append("username", formData.username)
        form.append("email", formData.email)
        form.append("password", formData.password)
        form.append("role", formData.role)

        const response = await signUpAction(form);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5E6D3] p-4">
            <div className="w-full max-w-md">
                <div className="bg-gradient-to-br from-blue-200 via-green-200 to-purple-200 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
                    <div className="text-center space-y-2 mb-6">
                        <h1 className="text-4xl font-pixel text-black">Register</h1>
                        <h2 className="text-2xl font-pixel text-black">to start</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Username"
                            className="w-full px-4 py-3 bg-[#FFD1DC] border-none rounded-xl font-pixel text-lg placeholder:text-gray-600"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                        <Input
                            type="text"
                            placeholder="Email"
                            className="w-full px-4 py-3 bg-[#FFD1DC] border-none rounded-xl font-pixel text-lg placeholder:text-gray-600"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-3 bg-[#FFD1DC] border-none rounded-xl font-pixel text-lg placeholder:text-gray-600"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />

                        <RadioGroup
                            defaultValue="student"
                            className="flex justify-start space-x-4 mt-4"
                            onValueChange={(value: Role) => setFormData({ ...formData, role: value })}
                        >
                            <div className="flex items-center">
                                <RadioGroupItem value="admin" id="admin" className="radio-pixel border-black checked:bg-black" />
                                <Label htmlFor="admin" className="font-pixel ml-2 text-black">
                                    Admin
                                </Label>
                            </div>
                            <div className="flex items-center">
                                <RadioGroupItem value="student" id="student" className="radio-pixel border-black checked:bg-black" />
                                <Label htmlFor="student" className="font-pixel ml-2 text-black">
                                    Student
                                </Label>
                            </div>
                        </RadioGroup>
                        <Suspense>
                            <ErrorMessage/>
                        </Suspense>
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full px-6 py-3 font-pixel text-xl bg-[#FFD700] hover:bg-[#FFC000] transition-colors rounded-xl border-4 border-[#DAA520] hover:border-[#B8860B] active:translate-y-1 shadow-md"
                            >
                                Register
                            </button>
                        </div>

                        <div className="text-center mt-4">
                            <Link href="/login" className="font-pixel text-blue-600 hover:text-blue-800 transition-colors">
                                Already have an account?
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

