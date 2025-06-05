"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Briefcase, Trophy, GraduationCap, Building2, Zap, User, LogOut, Code, Lightbulb, TrendingUp } from "lucide-react" // Added more icons for variety
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      console.log('Checking auth status with token:', token)
      if (!token) {
        setLoading(false)
        return
      }

      // Verify token and get user info
      const response = await fetch('http://127.0.0.1:8000/api/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      console.log('Auth status response:', response)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token might be expired, try to refresh
        await refreshToken()
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) return

      const response = await fetch('http://127.0.0.1:8000/api/auth/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('accessToken', data.access)
        // Try to get user info again
        await checkAuthStatus()
      } else {
        // Refresh failed, user needs to login again
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refresh_token')
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refresh_token')
    setUser(null)
    // Optionally redirect to home or login page
    window.location.reload()
  }

  // Framer Motion animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // Features data (updated icons for variety)
  const features = [
    {
      icon: Briefcase,
      title: "Job Opportunities",
      description: "Discover thousands of job openings from top companies worldwide, tailored to your skills.",
    },
    {
      icon: GraduationCap,
      title: "Internships",
      description: "Find the perfect internship to kickstart your career journey and gain real-world experience.",
    },
    {
      icon: Trophy,
      title: "Competitions",
      description: "Participate in coding challenges, innovation contests, and hackathons to showcase your talent.",
    },
    {
      icon: Building2,
      title: "Company Profiles",
      description: "Learn about company culture, values, and career paths before making your next move.",
    },
    // Adding two more features for a fuller section
    {
      icon: Code,
      title: "Skill Assessments",
      description: "Test your abilities and identify areas for growth with our comprehensive skill assessments.",
    },
    {
      icon: Lightbulb,
      title: "Career Guidance",
      description: "Receive personalized advice and resources to navigate your career path with confidence.",
    },
  ]

  // Stats data
  const stats = [
    { number: "10K+", label: "Active Jobs" },
    { number: "500+", label: "Companies" },
    { number: "50K+", label: "Students" },
    { number: "95%", label: "Success Rate" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 font-sans text-gray-900">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="border-b border-gray-100 bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
              InternFlow
            </span>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-emerald-700 transition-colors font-medium relative group">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="#companies" className="text-gray-600 hover:text-emerald-700 transition-colors font-medium relative group">
              Companies
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-emerald-700 transition-colors font-medium relative group">
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {loading ? (
              // Loading state
              <div className="flex items-center space-x-4">
                <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : user ? (
              // Authenticated user
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-emerald-700 transition-colors">
                  <User className="w-5 h-5" />
                  <span className="font-semibold">Welcome, {user.first_name || user.username || 'User'}</span>
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </motion.div>
              </div>
            ) : (
              // Non-authenticated user
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg transform active:scale-98 transition-all duration-200">
                      Get Started
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <Badge className="mb-6 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-sm px-4 py-2 rounded-full font-semibold">
              🚀 Launch Your Career Today
            </Badge>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Where Talent Meets
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Opportunity
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            Connect with top companies, discover amazing internships, and participate in exciting competitions. Your
            dream career starts here.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            {user ? (
              // Show different CTA for authenticated users
              <Link href="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-6 text-lg font-semibold shadow-xl transform active:scale-98 transition-all duration-200"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </Link>
            ) : (
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-6 text-lg font-semibold shadow-xl transform active:scale-98 transition-all duration-200"
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </Link>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all duration-200">
                Explore Opportunities
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto p-6 rounded-2xl bg-white/60 backdrop-blur-md shadow-xl border border-gray-100"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={fadeInUp} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-700 text-lg font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-white border-t border-gray-100">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 leading-tight">
              Everything You Need to
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                {" "}
                Succeed
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover opportunities, build connections, and accelerate your career growth with our powerful features.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-8 text-center flex flex-col items-center">
                    <motion.div
                      className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md"
                      whileHover={{ rotate: 15 }} // More subtle rotation
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-base">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 relative overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              {user ? "Continue Your Journey!" : "Ready to Transform Your Career?"}
            </h2>
            <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              {user
                ? "Explore new opportunities and take your career to the next level with personalized insights."
                : "Join thousands of students and professionals who have found their dream opportunities through InternFlow – your future starts now!"
              }
            </p>
            <Link href={user ? "/dashboard" : "/signup"}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-gray-100 px-10 py-6 text-xl font-bold shadow-xl transform active:scale-98 transition-all duration-200 rounded-full"
                >
                  {user ? "Go to Dashboard" : "Join InternFlow Today"}
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-3xl font-extrabold">InternFlow</span>
          </div>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
            Connecting talent with opportunity, one career at a time. Empowering the next generation of professionals.
          </p>
          <div className="flex flex-wrap justify-center space-x-6 text-md font-medium text-gray-300">
            <Link href="#" className="hover:text-emerald-400 transition-colors mb-2 sm:mb-0">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors mb-2 sm:mb-0">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors mb-2 sm:mb-0">
              Contact Us
            </Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors mb-2 sm:mb-0">
              FAQ
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-8">
            &copy; {new Date().getFullYear()} InternFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}