"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Trophy,
  Calendar,
  Users,
  DollarSign,
  Filter,
  Bookmark,
  BookmarkCheck,
  Zap,
  ArrowLeft,
  Clock,
  Target,
  Award,
  Code,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

export default function CompetitionsPage() {
  const [savedCompetitions, setSavedCompetitions] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const toggleSaveCompetition = (competitionId: number) => {
    setSavedCompetitions((prev) =>
      prev.includes(competitionId) ? prev.filter((id) => id !== competitionId) : [...prev, competitionId],
    )
  }

  const competitions = [
    {
      id: 1,
      title: "Global AI Challenge 2024",
      organizer: "TechCorp International",
      category: "Artificial Intelligence",
      prize: "$50,000",
      participants: 2847,
      deadline: "April 15, 2024",
      duration: "3 months",
      difficulty: "Advanced",
      tags: ["Machine Learning", "Python", "TensorFlow"],
      description:
        "Build innovative AI solutions to solve real-world problems in healthcare, education, or sustainability.",
      featured: true,
      status: "Open",
    },
    {
      id: 2,
      title: "Hackathon Supreme",
      organizer: "DevCommunity",
      category: "Web Development",
      prize: "$25,000",
      participants: 1456,
      deadline: "March 30, 2024",
      duration: "48 hours",
      difficulty: "Intermediate",
      tags: ["React", "Node.js", "API"],
      description: "48-hour hackathon to create innovative web applications that solve everyday problems.",
      featured: true,
      status: "Open",
    },
    {
      id: 3,
      title: "Cybersecurity CTF Championship",
      organizer: "SecureNet",
      category: "Cybersecurity",
      prize: "$30,000",
      participants: 892,
      deadline: "May 1, 2024",
      duration: "2 weeks",
      difficulty: "Expert",
      tags: ["Security", "Penetration Testing", "Cryptography"],
      description: "Capture The Flag competition testing your cybersecurity skills across multiple domains.",
      featured: false,
      status: "Open",
    },
    {
      id: 4,
      title: "Mobile App Innovation Contest",
      organizer: "AppStore Connect",
      category: "Mobile Development",
      prize: "$20,000",
      participants: 634,
      deadline: "April 20, 2024",
      duration: "6 weeks",
      difficulty: "Intermediate",
      tags: ["React Native", "Flutter", "iOS", "Android"],
      description: "Create innovative mobile applications that enhance user productivity and engagement.",
      featured: false,
      status: "Open",
    },
    {
      id: 5,
      title: "Data Science Olympics",
      organizer: "DataCorp Analytics",
      category: "Data Science",
      prize: "$40,000",
      participants: 1789,
      deadline: "March 25, 2024",
      duration: "1 month",
      difficulty: "Advanced",
      tags: ["Python", "R", "SQL", "Visualization"],
      description: "Analyze complex datasets and build predictive models to solve business challenges.",
      featured: true,
      status: "Closing Soon",
    },
    {
      id: 6,
      title: "Blockchain Innovation Challenge",
      organizer: "CryptoTech Foundation",
      category: "Blockchain",
      prize: "$35,000",
      participants: 567,
      deadline: "May 10, 2024",
      duration: "8 weeks",
      difficulty: "Advanced",
      tags: ["Solidity", "Web3", "Smart Contracts"],
      description: "Develop decentralized applications that showcase the potential of blockchain technology.",
      featured: false,
      status: "Open",
    },
  ]

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700"
      case "Advanced":
        return "bg-orange-100 text-orange-700"
      case "Expert":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-700"
      case "Closing Soon":
        return "bg-red-100 text-red-700"
      case "Closed":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-blue-100 text-blue-700"
    }
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
            <Link href="/internships" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Internships
            </Link>
            <Link href="/competitions" className="text-emerald-600 font-semibold border-b-2 border-emerald-600 pb-1">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Coding Competitions & Challenges</h1>
          <p className="text-xl text-gray-600">Showcase your skills and win amazing prizes</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div className="mb-8" {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search competitions, categories, or technologies..."
                    className="pl-10 h-12 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <Select>
                    <SelectTrigger className="w-48 h-12">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai">Artificial Intelligence</SelectItem>
                      <SelectItem value="web">Web Development</SelectItem>
                      <SelectItem value="mobile">Mobile Development</SelectItem>
                      <SelectItem value="data">Data Science</SelectItem>
                      <SelectItem value="security">Cybersecurity</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-48 h-12">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
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
              <div className="text-2xl font-bold text-emerald-600">156</div>
              <div className="text-sm text-gray-600">Active Competitions</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-teal-600">$2.5M</div>
              <div className="text-sm text-gray-600">Total Prize Pool</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600">45K</div>
              <div className="text-sm text-gray-600">Participants</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600">89%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </Card>
          </div>
        </motion.div>

        {/* Competition Listings */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {competitions.map((competition, index) => (
              <motion.div key={competition.id} {...fadeInUp} transition={{ delay: 0.1 * index }}>
                <Card
                  className={`hover:shadow-xl transition-all duration-300 border-0 shadow-lg ${
                    competition.featured
                      ? "ring-2 ring-emerald-200 bg-gradient-to-r from-emerald-50/50 to-teal-50/50"
                      : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-xl font-semibold text-gray-900">{competition.title}</h3>
                            {competition.featured && (
                              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-emerald-600 font-medium">{competition.organizer}</p>
                          <p className="text-sm text-gray-600">{competition.category}</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleSaveCompetition(competition.id)}
                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        {savedCompetitions.includes(competition.id) ? (
                          <BookmarkCheck className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <Bookmark className="w-6 h-6" />
                        )}
                      </motion.button>
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed">{competition.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {competition.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-emerald-700 border-emerald-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-medium text-gray-900">{competition.prize}</div>
                          <div className="text-gray-600">Prize Pool</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">{competition.participants.toLocaleString()}</div>
                          <div className="text-gray-600">Participants</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <div>
                          <div className="font-medium text-gray-900">{competition.duration}</div>
                          <div className="text-gray-600">Duration</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-red-600" />
                        <div>
                          <div className="font-medium text-gray-900">{competition.deadline}</div>
                          <div className="text-gray-600">Deadline</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Badge className={getDifficultyColor(competition.difficulty)}>{competition.difficulty}</Badge>
                        <Badge className={getStatusColor(competition.status)}>{competition.status}</Badge>
                      </div>
                    </div>

                    <Separator className="mb-4" />

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Registration closes in <span className="font-medium text-gray-900">12 days</span>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
                          Register Now
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
            {/* Competition Categories */}
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    <span>Popular Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "AI & Machine Learning", count: 45 },
                    { name: "Web Development", count: 38 },
                    { name: "Mobile Apps", count: 29 },
                    { name: "Data Science", count: 34 },
                    { name: "Cybersecurity", count: 22 },
                    { name: "Blockchain", count: 18 },
                  ].map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <span className="text-gray-700">{category.name}</span>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                        {category.count}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Leaderboard */}
            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <span>Top Performers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Alex Chen", points: 2847, rank: 1 },
                    { name: "Sarah Johnson", points: 2634, rank: 2 },
                    { name: "Mike Rodriguez", points: 2456, rank: 3 },
                    { name: "Emily Davis", points: 2289, rank: 4 },
                    { name: "David Kim", points: 2156, rank: 5 },
                  ].map((user) => (
                    <div key={user.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            user.rank === 1
                              ? "bg-yellow-100 text-yellow-700"
                              : user.rank === 2
                                ? "bg-gray-100 text-gray-700"
                                : user.rank === 3
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.rank}
                        </div>
                        <span className="text-gray-700">{user.name}</span>
                      </div>
                      <span className="text-sm font-medium text-emerald-600">{user.points.toLocaleString()}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Competition Tips */}
            <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
              <Card className="shadow-lg border-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <CardContent className="p-6 text-center">
                  <Code className="w-12 h-12 mx-auto mb-3 text-emerald-100" />
                  <h3 className="text-lg font-semibold mb-2">Competition Tips</h3>
                  <p className="text-emerald-100 mb-4 text-sm">
                    Get expert advice and strategies to excel in coding competitions
                  </p>
                  <Button className="bg-white text-emerald-600 hover:bg-gray-100 w-full">View Tips</Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
