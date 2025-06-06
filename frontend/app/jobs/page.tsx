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
  DollarSign,
  Building2,
  Filter,
  Bookmark,
  BookmarkCheck,
  Zap,
  ArrowLeft,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

export default function JobsPage() {
  const [savedJobs, setSavedJobs] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
  }

  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120k - $160k",
      posted: "2 days ago",
      logo: "/placeholder.svg?height=48&width=48",
      tags: ["React", "TypeScript", "Next.js"],
      description: "Join our dynamic team to build cutting-edge web applications using modern technologies.",
      applicants: 45,
      featured: true,
    },
    {
      id: 2,
      title: "Backend Engineer",
      company: "StartupXYZ",
      location: "New York, NY",
      type: "Full-time",
      salary: "$100k - $140k",
      posted: "1 day ago",
      logo: "/placeholder.svg?height=48&width=48",
      tags: ["Node.js", "Python", "AWS"],
      description: "Build scalable backend systems and APIs for our growing platform.",
      applicants: 32,
      featured: false,
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "InnovateLab",
      location: "Remote",
      type: "Full-time",
      salary: "$90k - $130k",
      posted: "3 days ago",
      logo: "/placeholder.svg?height=48&width=48",
      tags: ["React", "Node.js", "MongoDB"],
      description: "Work on exciting projects from concept to deployment in a collaborative environment.",
      applicants: 67,
      featured: false,
    },
    {
      id: 4,
      title: "DevOps Engineer",
      company: "CloudTech Solutions",
      location: "Austin, TX",
      type: "Full-time",
      salary: "$110k - $150k",
      posted: "4 days ago",
      logo: "/placeholder.svg?height=48&width=48",
      tags: ["Docker", "Kubernetes", "AWS"],
      description: "Manage and optimize our cloud infrastructure and deployment pipelines.",
      applicants: 28,
      featured: true,
    },
    {
      id: 5,
      title: "UI/UX Designer",
      company: "DesignStudio Pro",
      location: "Los Angeles, CA",
      type: "Full-time",
      salary: "$80k - $110k",
      posted: "5 days ago",
      logo: "/placeholder.svg?height=48&width=48",
      tags: ["Figma", "Adobe XD", "Prototyping"],
      description: "Create beautiful and intuitive user experiences for web and mobile applications.",
      applicants: 89,
      featured: false,
    },
    {
      id: 6,
      title: "Data Scientist",
      company: "DataInsights Corp",
      location: "Seattle, WA",
      type: "Full-time",
      salary: "$130k - $170k",
      posted: "1 week ago",
      logo: "/placeholder.svg?height=48&width=48",
      tags: ["Python", "Machine Learning", "SQL"],
      description: "Analyze complex datasets and build predictive models to drive business decisions.",
      applicants: 156,
      featured: true,
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
            <Link href="/jobs" className="text-emerald-600 font-semibold border-b-2 border-emerald-600 pb-1">
              Jobs
            </Link>
            <Link href="/internships" className="text-gray-600 hover:text-emerald-600 transition-colors">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Dream Job</h1>
          <p className="text-xl text-gray-600">Discover amazing opportunities from top companies worldwide</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div className="mb-8" {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search jobs, companies, or keywords..."
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
                      <SelectItem value="austin">Austin, TX</SelectItem>
                      <SelectItem value="seattle">Seattle, WA</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-48 h-12">
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fulltime">Full-time</SelectItem>
                      <SelectItem value="parttime">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
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
              <div className="text-2xl font-bold text-emerald-600">2,847</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-teal-600">156</div>
              <div className="text-sm text-gray-600">New Today</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600">89</div>
              <div className="text-sm text-gray-600">Remote Jobs</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600">234</div>
              <div className="text-sm text-gray-600">Companies</div>
            </Card>
          </div>
        </motion.div>

        {/* Job Listings */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {jobs.map((job, index) => (
              <motion.div key={job.id} {...fadeInUp} transition={{ delay: 0.1 * index }}>
                <Card
                  className={`hover:shadow-xl transition-all duration-300 border-0 shadow-lg ${
                    job.featured ? "ring-2 ring-emerald-200 bg-gradient-to-r from-emerald-50/50 to-teal-50/50" : ""
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
                            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                            {job.featured && (
                              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-emerald-600 font-medium">{job.company}</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleSaveJob(job.id)}
                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        {savedJobs.includes(job.id) ? (
                          <BookmarkCheck className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <Bookmark className="w-6 h-6" />
                        )}
                      </motion.button>
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed">{job.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-emerald-700 border-emerald-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{job.salary}</span>
                        </div>
                      </div>
                    </div>

                    <Separator className="mb-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{job.posted}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{job.applicants} applicants</span>
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
            {/* Trending Skills */}
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>Trending Skills</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["React", "Python", "AWS", "Node.js", "TypeScript", "Docker"].map((skill) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-gray-700">{skill}</span>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                        Hot
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Salary Insights */}
            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <span>Salary Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Frontend Developer</span>
                      <span className="font-semibold">$95k - $140k</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Backend Developer</span>
                      <span className="font-semibold">$100k - $150k</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full w-4/5"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Data Scientist</span>
                      <span className="font-semibold">$120k - $180k</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Apply */}
            <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
              <Card className="shadow-lg border-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Quick Apply</h3>
                  <p className="text-emerald-100 mb-4 text-sm">
                    Upload your resume and apply to multiple jobs with one click
                  </p>
                  <Button className="bg-white text-emerald-600 hover:bg-gray-100 w-full">Upload Resume</Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
