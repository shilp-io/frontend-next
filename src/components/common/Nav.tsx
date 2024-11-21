'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { User, LayoutDashboard, LogOut, Settings, UserCircle, Atom } from 'lucide-react'

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Contact', href: '/contact' },
]

const userMenuItems = [
  { name: 'Profile', href: '#', icon: UserCircle },
  { name: 'Settings', href: '#', icon: Settings },
  { name: 'Logout', href: '#', icon: LogOut },
]

export default function Nav() {
  const [activeItem, setActiveItem] = useState('Home')
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center">
      <div className="w-full max-w-6xl mx-auto px-4 flex items-center">
        {/* Brand Section */}
        <div className="flex items-center mr-12">
          <Link href="/" className="flex items-center space-x-2 text-gray-900">
            <Atom className="w-5 h-5" />
            <span className="font-semibold text-lg">Atoms</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <ul className="flex justify-center space-x-6">
          {navItems.map((item) => (
            <motion.li
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: navItems.indexOf(item) * 0.1 }}
            >
              <Link
                href={item.href}
                className="text-gray-800 text-sm font-medium relative py-1 px-2 transition-colors duration-200 ease-in-out hover:text-black"
                onClick={() => setActiveItem(item.name)}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span className="relative z-10">{item.name}</span>
                <motion.div
                  className="absolute inset-0 bg-black"
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: hoveredItem === item.name || activeItem === item.name ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{
                    originX: hoveredItem === item.name ? 0 : 1,
                    opacity: 0.05,  // Darkened from 0.03 to 0.05
                  }}
                />
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4 ml-auto">
          <Link
            href="/dashboard"
            className="p-1 hover:bg-black/5 rounded-full transition-colors duration-200"
          >
            <LayoutDashboard className="w-5 h-5 text-gray-700" />
          </Link>

          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="p-1 hover:bg-black/5 rounded-full transition-colors duration-200"
            >
              <User className="w-5 h-5 text-gray-700" />
            </button>

            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-sm rounded-md shadow-lg py-1 ring-1 ring-black/5"
              >
                {userMenuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-black/5 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Link>
                  )
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}