"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Bookmark,
  BookmarkCheck,
  Zap,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  apply_link: string;
  source_url: string;
  platform: string;
  posted_date?: string;
  salary?: string;
  job_type?: string;
  id?: string;
}

interface ApiResponse {
  success: boolean;
  total_jobs: number;
  jobs: Job[];
  search_params: {
    job_title: string;
    location: string;
    use_selenium: boolean;
    max_results_per_source: number;
    remove_duplicates: boolean;
  };
  timestamp: string;
  message: string;
}

export default function JobsPage() {
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("Any Location");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "https://internflowjobs.onrender.com/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_title: searchQuery,
            location: locationFilter,
            use_selenium: false,
            max_results_per_source: 20,
            remove_duplicates: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data: ApiResponse = await response.json();
      console.log(data);

      if (data.success) {
        const jobsWithIds = data.jobs.map((job, index) => ({
          ...job,
          id: `${job.platform}-${index}-${Date.now()}`,
        }));
        console.log(jobsWithIds);
        setJobs(jobsWithIds);
      } else {
        throw new Error(data.message || "Failed to fetch jobs");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching jobs");
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const toggleSaveJob = (jobId: string) => {
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

  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength) + "...";
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
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Enter location"
                        className="pl-10 h-12 w-48"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                      />
                    </div>
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
                <Dialog key={job.id || index}>
                  <DialogTrigger asChild>
                    <motion.div
                      {...fadeInUp}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => setSelectedJob(job)}
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg cursor-pointer">
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
                            {job.id && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSaveJob(job.id!);
                                }}
                                className="text-gray-400 hover:text-emerald-600 transition-colors"
                              >
                                {job.id && savedJobs.includes(job.id) ? (
                                  <BookmarkCheck className="w-6 h-6 text-emerald-600" />
                                ) : (
                                  <Bookmark className="w-6 h-6" />
                                )}
                              </motion.button>
                            )}
                          </div>

                          <p className="text-gray-600 mb-4 leading-relaxed">
                            {truncateDescription(job.description)}
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
                                onClick={(e) => e.stopPropagation()}
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
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">{selectedJob?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-5 h-5 text-gray-600" />
                        <p className="text-emerald-600 font-medium">{selectedJob?.company}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className="text-emerald-700 border-emerald-200"
                        >
                          {selectedJob?.platform}
                        </Badge>
                        {selectedJob?.job_type && (
                          <Badge
                            variant="outline"
                            className="text-blue-700 border-blue-200"
                          >
                            {selectedJob.job_type}
                          </Badge>
                        )}
                        {selectedJob?.platform === "Adzuna" && (
                          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedJob?.location}</span>
                        </div>
                        {selectedJob?.posted_date && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{selectedJob.posted_date}</span>
                          </div>
                        )}
                        {selectedJob?.salary && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>{selectedJob.salary}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <LinkIcon className="w-4 h-4" />
                          <Link
                            href={selectedJob?.source_url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Source URL
                          </Link>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <div className="max-h-96 overflow-y-auto pr-4">
                          <p className="text-gray-600 leading-relaxed">{selectedJob?.description}</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          asChild
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                        >
                          <Link
                            href={selectedJob?.apply_link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Apply Now
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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