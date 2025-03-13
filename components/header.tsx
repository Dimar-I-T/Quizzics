import Image from "next/image"
import Link from "next/link"
import { User } from "lucide-react"

export function Header() {
  return (
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

            {/* Profile Button */}
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

