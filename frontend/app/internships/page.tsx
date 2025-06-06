"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  MapPin,
  Clock,
  Calendar,
  Building2,
  Filter,
  Bookmark,
  BookmarkCheck,
  Zap,
  ArrowLeft,
  Users,
  GraduationCap,
  Star,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

export default function InternshipsPage() {
  const [savedInternships, setSavedInternships] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const toggleSaveInternship = (internshipId: number) => {
    setSavedInternships((prev) =>
      prev.includes(internshipId) ? prev.filter((id) => id !== internshipId) : [...prev, internshipId],
    )
  }

  const internships = [
    {
      id: 1,
      title: "Software Engineering Intern",
      company: "Google",
      location: "Mountain View, CA",
      duration: "12 weeks",
      stipend: "$8,000/month",
      posted: "1 day ago",
      logo: "/placeholder.svg?height=48&width=48",
      tags: ["Python", "Machine Learning", "Backend"],
      description:
        "Work on cutting-edge projects with our engineering team and contribute to products used by billions.",
      applicants: 1247,
      rating: 4.9,
      featured: true,
      deadline: "March 15, 2024",
    },
    {
      id: 2,
      title: "Frontend Development Intern",
      company: "Meta",
      location: "Menlo Park, CA",
      duration: "10 weeks",
      stipend: "$7,500/month",
      posted: "2 days ago",
      logo: "/placeholder.svg?height=48&width=48",
      tags: ["React", "JavaScript", "UI/UX"],
      description: "Join our frontend team to build user interfaces for next-generation social platforms.",
      applicants: 892,
      rating: 4.8,
      featured: true,
      deadline: "March 20, 2024",
    },
    {
      id: 3,
      title: "Data Science Intern",
      company: "Netflix",
      location: "Los Gatos, CA",
      duration: "16 weeks",
      stipend: "$7,000/month",
      posted: "3 days ago",
      logo: "/placeholder.svg?height=48&width=48",
      tags: ["Python", "SQL", "Analytics"],
      description: "Analyze user behavior data and build recommendation algorithms for our streaming platform.",
      applicants: 634,
      rating: 4.7,
      featured: false,
      deadline: "March 25, 2024",
    },
    {
      id: 4,
      title: "Mobile App Development Intern",
      company: "Spotify",
      location: "New York, NY",
      duration: "12 weeks",
      stipend: "$6,500/month",
      posted: "4 days ago",
      logo: "/placeholder.svg?height=48&width=48",
      tags: ["React Native", "iOS", "Android"],
      description: "Develop features for our mobile music streaming application used by millions worldwide.",
      applicants: 456,
      rating: 4.6,
      featured: false,
      deadline: "April 1, 2024",
    },
    {
      id: 5,
      title: "Cloud Infrastructure Intern",
      company: "Amazon",
      location: "Seattle, WA",
      duration: "14 weeks",
      stipend: "$7,200/month",
      posted: "5 days ago",
      logo: "/placeholder.svg?height=48&width=48",
      tags: ["AWS", "Docker", "Kubernetes"],
      description: "Work with AWS services and help build scalable cloud infrastructure solutions.",
      applicants: 789,
      rating: 4.5,
      featured: true,
      deadline: "April 5, 2024",
    },
    {
      id: 6,
      title: "AI Research Intern",
      company: "OpenAI",
      location: "San Francisco, CA",
      duration: "20 weeks",
      stipend: "$9,000/month",
      posted: "1 week ago",
      logo: "/placeholder.svg?height=48&width=48",
      tags: ["Python", "TensorFlow", "Research"],
      description: "Contribute to groundbreaking AI research and help develop next-generation language models.",
      applicants: 2156,
      rating: 5.0,
      featured: true,
      deadline: "April 10, 2024",
    },
  ]

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                InternFlow
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/jobs" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Jobs
            </Link>
            <Link href="/internships" className="text-emerald-600 font-semibold border-b-2 border-emerald-600 pb-1">
              Internships
            </Link>
            <Link href="/competitions" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Competitions
            </Link>
            <Link href="/companies" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Companies
            </Link>
            <Link href="/profile" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Profile
            </Link>
          </nav>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div className="mb-8" {...fadeInUp}>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Amazing Internships</h1>
          <p className="text-xl text-gray-600">Launch your career with internships at top tech companies</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div className="mb-8" {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search internships, companies, or skills..."
                    className="pl-10 h-12 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <Select>
                    <SelectTrigger className="w-48 h-12">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="sf">San Francisco, CA</SelectItem>
                      <SelectItem value="ny">New York, NY</SelectItem>
                      <SelectItem value="seattle">Seattle, WA</SelectItem>
                      <SelectItem value="austin">Austin, TX</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-48 h-12">
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summer">Summer (10-12 weeks)</SelectItem>
                      <SelectItem value="fall">Fall (12-16 weeks)</SelectItem>
                      <SelectItem value="spring">Spring (12-16 weeks)</SelectItem>
                      <SelectItem value="year">Full Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="h-12 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div className="mb-8" {...fadeInUp} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-emerald-600">1,234</div>
              <div className="text-sm text-gray-600">Active Internships</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-teal-600">89</div>
              <div className="text-sm text-gray-600">New This Week</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-sm text-gray-600">Top Companies</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600">$7.2k</div>
              <div className="text-sm text-gray-600">Avg. Stipend</div>
            </Card>
          </div>
        </motion.div>

        {/* Internship Listings */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {internships.map((internship, index) => (
              <motion.div key={internship.id} {...fadeInUp} transition={{ delay: 0.1 * index }}>
                <Card
                  className={`hover:shadow-xl transition-all duration-300 border-0 shadow-lg ${
                    internship.featured
                      ? "ring-2 ring-emerald-200 bg-gradient-to-r from-emerald-50/50 to-teal-50/50"
                      : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-xl font-semibold text-gray-900">{internship.title}</h3>
                            {internship.featured && (
                              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-emerald-600 font-medium">{internship.company}</p>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{internship.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleSaveInternship(internship.id)}
                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        {savedInternships.includes(internship.id) ? (
                          <BookmarkCheck className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <Bookmark className="w-6 h-6" />
                        )}
                      </motion.button>
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed">{internship.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {internship.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-emerald-700 border-emerald-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{internship.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{internship.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GraduationCap className="w-4 h-4" />
                        <span>{internship.stipend}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {internship.deadline}</span>
                      </div>
                    </div>

                    <Separator className="mb-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{internship.posted}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{internship.applicants.toLocaleString()} applicants</span>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
                          Apply Now
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Tips */}
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                    <span>Application Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900 mb-1">✨ Stand out from the crowd</p>
                    <p>Customize your resume for each application and highlight relevant projects.</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900 mb-1">🎯 Apply early</p>
                    <p>Many internships are filled on a rolling basis. Don't wait until the deadline!</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900 mb-1">🤝 Network actively</p>
                    <p>Connect with current interns and employees on LinkedIn for insider tips.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Popular Companies */}
            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span>Popular Companies</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["Google", "Meta", "Apple", "Microsoft", "Amazon", "Netflix"].map((company) => (
                    <div key={company} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-gray-700">{company}</span>
                      </div>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                        Hiring
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Internship Calendar */}
            <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
              <Card className="shadow-lg border-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-emerald-100" />
                  <h3 className="text-lg font-semibold mb-2">Internship Calendar</h3>
                  <p className="text-emerald-100 mb-4 text-sm">Track application deadlines and important dates</p>
                  <Button className="bg-white text-emerald-600 hover:bg-gray-100 w-full">View Calendar</Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
