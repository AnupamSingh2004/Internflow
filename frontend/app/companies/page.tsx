"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Building2,
  MapPin,
  Users,
  Star,
  Filter,
  Bookmark,
  BookmarkCheck,
  Zap,
  ArrowLeft,
  TrendingUp,
  Globe,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

export default function CompaniesPage() {
  const [savedCompanies, setSavedCompanies] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const toggleSaveCompany = (companyId: number) => {
    setSavedCompanies((prev) =>
      prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId],
    )
  }

  const companies = [
    {
      id: 1,
      name: "Google",
      industry: "Technology",
      location: "Mountain View, CA",
      employees: "100,000+",
      rating: 4.4,
      logo: "/placeholder.svg?height=64&width=64",
      description: "A multinational technology company that specializes in Internet-related services and products.",
      openPositions: 1247,
      founded: 1998,
      website: "google.com",
      tags: ["AI", "Cloud", "Search", "Mobile"],
      featured: true,
      culture: ["Innovation", "Diversity", "Growth"],
    },
    {
      id: 2,
      name: "Meta",
      industry: "Social Media",
      location: "Menlo Park, CA",
      employees: "50,000+",
      rating: 4.1,
      logo: "/placeholder.svg?height=64&width=64",
      description: "Building the next evolution of social technology and connecting people around the world.",
      openPositions: 892,
      founded: 2004,
      website: "meta.com",
      tags: ["VR", "Social", "AI", "Metaverse"],
      featured: true,
      culture: ["Bold", "Focus", "Impact"],
    },
    {
      id: 3,
      name: "Apple",
      industry: "Technology",
      location: "Cupertino, CA",
      employees: "150,000+",
      rating: 4.3,
      logo: "/placeholder.svg?height=64&width=64",
      description: "Designs, manufactures, and markets smartphones, personal computers, tablets, and more.",
      openPositions: 634,
      founded: 1976,
      website: "apple.com",
      tags: ["Hardware", "Software", "Design", "Innovation"],
      featured: false,
      culture: ["Excellence", "Innovation", "Privacy"],
    },
    {
      id: 4,
      name: "Microsoft",
      industry: "Technology",
      location: "Redmond, WA",
      employees: "200,000+",
      rating: 4.2,
      logo: "/placeholder.svg?height=64&width=64",
      description: "Develops, manufactures, licenses, supports, and sells computer software and services.",
      openPositions: 1156,
      founded: 1975,
      website: "microsoft.com",
      tags: ["Cloud", "Enterprise", "Gaming", "AI"],
      featured: true,
      culture: ["Respect", "Integrity", "Accountability"],
    },
    {
      id: 5,
      name: "Amazon",
      industry: "E-commerce",
      location: "Seattle, WA",
      employees: "1,500,000+",
      rating: 3.9,
      logo: "/placeholder.svg?height=64&width=64",
      description: "Multinational technology company focusing on e-commerce, cloud computing, and AI.",
      openPositions: 2847,
      founded: 1994,
      website: "amazon.com",
      tags: ["E-commerce", "AWS", "Logistics", "AI"],
      featured: false,
      culture: ["Customer Obsession", "Ownership", "Innovation"],
    },
    {
      id: 6,
      name: "Netflix",
      industry: "Entertainment",
      location: "Los Gatos, CA",
      employees: "10,000+",
      rating: 4.0,
      logo: "/placeholder.svg?height=64&width=64",
      description: "Streaming entertainment service with TV series, documentaries and feature films.",
      openPositions: 234,
      founded: 1997,
      website: "netflix.com",
      tags: ["Streaming", "Content", "Data", "Global"],
      featured: false,
      culture: ["Freedom", "Responsibility", "Excellence"],
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
            <Link href="/internships" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Internships
            </Link>
            <Link href="/competitions" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Competitions
            </Link>
            <Link href="/companies" className="text-emerald-600 font-semibold border-b-2 border-emerald-600 pb-1">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Amazing Companies</h1>
          <p className="text-xl text-gray-600">Explore top companies and find your perfect workplace culture</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div className="mb-8" {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search companies, industries, or locations..."
                    className="pl-10 h-12 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <Select>
                    <SelectTrigger className="w-48 h-12">
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-48 h-12">
                      <SelectValue placeholder="Company Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-50)</SelectItem>
                      <SelectItem value="small">Small (51-200)</SelectItem>
                      <SelectItem value="medium">Medium (201-1000)</SelectItem>
                      <SelectItem value="large">Large (1000+)</SelectItem>
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
              <div className="text-2xl font-bold text-emerald-600">500+</div>
              <div className="text-sm text-gray-600">Companies</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-teal-600">15K+</div>
              <div className="text-sm text-gray-600">Open Positions</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600">25</div>
              <div className="text-sm text-gray-600">Industries</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600">4.2</div>
              <div className="text-sm text-gray-600">Avg. Rating</div>
            </Card>
          </div>
        </motion.div>

        {/* Company Listings */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {companies.map((company, index) => (
              <motion.div key={company.id} {...fadeInUp} transition={{ delay: 0.1 * index }}>
                <Card
                  className={`hover:shadow-xl transition-all duration-300 border-0 shadow-lg ${
                    company.featured ? "ring-2 ring-emerald-200 bg-gradient-to-r from-emerald-50/50 to-teal-50/50" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-16 h-16 border-2 border-gray-200">
                          <AvatarImage src={company.logo || "/placeholder.svg"} alt={company.name} />
                          <AvatarFallback className="text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                            {company.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                            {company.featured && (
                              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-emerald-600 font-medium">{company.industry}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{company.rating}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-600">Founded {company.founded}</span>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleSaveCompany(company.id)}
                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        {savedCompanies.includes(company.id) ? (
                          <BookmarkCheck className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <Bookmark className="w-6 h-6" />
                        )}
                      </motion.button>
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed">{company.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {company.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-emerald-700 border-emerald-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{company.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{company.employees}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{company.openPositions} open roles</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4" />
                        <span>{company.website}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Company Culture</h4>
                      <div className="flex flex-wrap gap-2">
                        {company.culture.map((value) => (
                          <Badge key={value} className="bg-blue-100 text-blue-700">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-emerald-600">{company.openPositions}</span> open positions
                      </div>
                      <div className="flex space-x-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                            View Profile
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
                            View Jobs
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Companies */}
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>Trending Companies</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["OpenAI", "Stripe", "Figma", "Notion", "Discord", "Canva"].map((company, index) => (
                    <div key={company} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-gray-700">{company}</span>
                      </div>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Industry Insights */}
            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span>Industry Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { industry: "Technology", percentage: 45, companies: 225 },
                    { industry: "Finance", percentage: 20, companies: 100 },
                    { industry: "Healthcare", percentage: 15, companies: 75 },
                    { industry: "Education", percentage: 12, companies: 60 },
                    { industry: "Retail", percentage: 8, companies: 40 },
                  ].map((item) => (
                    <div key={item.industry}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{item.industry}</span>
                        <span className="font-medium">{item.companies} companies</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Company Spotlight */}
            <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
              <Card className="shadow-lg border-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <CardContent className="p-6 text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-emerald-100" />
                  <h3 className="text-lg font-semibold mb-2">Company Spotlight</h3>
                  <p className="text-emerald-100 mb-4 text-sm">
                    Get featured insights and behind-the-scenes content from top companies
                  </p>
                  <Button className="bg-white text-emerald-600 hover:bg-gray-100 w-full">Explore Stories</Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
