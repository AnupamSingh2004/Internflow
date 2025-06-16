"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function JobsPage() {
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/jobs/search/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: searchQuery,
          location: locationFilter,
          use_selenium: false, // Set to true if you want to use Selenium scraping
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      if (data.status === "success") {
        setJobs(data.jobs);
      } else {
        throw new Error(data.message || "Failed to fetch jobs");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching jobs");
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initial jobs when component mounts
    fetchJobs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

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
            <Link
              href="/jobs"
              className="text-emerald-600 font-semibold border-b-2 border-emerald-600 pb-1"
            >
              Jobs
            </Link>
            <Link
              href="/internships"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Internships
            </Link>
            <Link
              href="/competitions"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Competitions
            </Link>
            <Link
              href="/companies"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Companies
            </Link>
            <Link
              href="/profile"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Profile
            </Link>
          </nav>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div className="mb-8" {...fadeInUp}>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600">
            Discover amazing opportunities from top companies worldwide
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div className="mb-8" {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <form onSubmit={handleSearch}>
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
                    <Select
                      value={locationFilter}
                      onValueChange={setLocationFilter}
                    >
                      <SelectTrigger className="w-48 h-12">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Location</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={jobTypeFilter}
                      onValueChange={setJobTypeFilter}
                    >
                      <SelectTrigger className="w-48 h-12">
                        <SelectValue placeholder="Job Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Type</SelectItem>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="submit"
                      className="h-12 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 mr-2" />
                      )}
                      Search
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {error && (
          <motion.div className="mb-8" {...fadeInUp}>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-red-600">{error}</CardContent>
            </Card>
          </motion.div>
        )}

        {/* Job Listings */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">
                    No jobs found. Try adjusting your search criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              jobs.map((job, index) => (
                <motion.div
                  key={job.id || index}
                  {...fadeInUp}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {job.title}
                              </h3>
                              {job.platform === "Adzuna" && (
                                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-emerald-600 font-medium">
                              {job.company}
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleSaveJob(index)}
                          className="text-gray-400 hover:text-emerald-600 transition-colors"
                        >
                          {savedJobs.includes(index) ? (
                            <BookmarkCheck className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <Bookmark className="w-6 h-6" />
                          )}
                        </motion.button>
                      </div>

                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge
                          variant="outline"
                          className="text-emerald-700 border-emerald-200"
                        >
                          {job.platform}
                        </Badge>
                        {job.job_type && (
                          <Badge
                            variant="outline"
                            className="text-blue-700 border-blue-200"
                          >
                            {job.job_type}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.posted_date || "Recently posted"}</span>
                          </div>
                          {job.salary && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{job.salary}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator className="mb-4" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{job.posted_date || "Recently posted"}</span>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            asChild
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                          >
                            <Link
                              href={job.apply_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Apply Now
                            </Link>
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
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
                  {[
                    "React",
                    "Python",
                    "AWS",
                    "Node.js",
                    "TypeScript",
                    "Docker",
                  ].map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700">{skill}</span>
                      <Badge
                        variant="outline"
                        className="text-emerald-600 border-emerald-200"
                      >
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
                  <Button className="bg-white text-emerald-600 hover:bg-gray-100 w-full">
                    Upload Resume
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
