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
  LinkIcon,
  Users,
  Star,
  Filter,
  SortDesc,
  Loader2,
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
  const [locationFilter, setLocationFilter] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [sortBy, setSortBy] = useState("recent");

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

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const truncateDescription = (description: string, maxLength = 150) => {
    // Strip HTML tags for truncation
    const div = document.createElement("div");
    div.innerHTML = description;
    const text = div.textContent || div.innerText || "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const renderDescription = (description: string) => {
    // In production, use a sanitization library like DOMPurify to prevent XSS
    // For this example, assuming trusted HTML from the API
    return <div dangerouslySetInnerHTML={{ __html: description }} />;
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      LinkedIn: "bg-blue-100 text-blue-700 border-blue-200",
      Indeed: "bg-green-100 text-green-700 border-green-200",
      Glassdoor: "bg-purple-100 text-purple-700 border-purple-200",
      AngelList: "bg-orange-100 text-orange-700 border-orange-200",
      "Stack Overflow Jobs": "bg-yellow-100 text-yellow-700 border-yellow-200",
      ZipRecruiter: "bg-pink-100 text-pink-700 border-pink-200",
      Adzuna: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return (
      colors[platform as keyof typeof colors] ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  const getExperienceColor = (level: string) => {
    const colors = {
      Junior: "bg-green-100 text-green-700",
      "Mid-level": "bg-blue-100 text-blue-700",
      Senior: "bg-purple-100 text-purple-700",
      Entry: "bg-green-100 text-green-700",
      Experienced: "bg-purple-100 text-purple-700",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm"
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
        <motion.div className="mb-8 text-center" {...fadeInUp}>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing opportunities from top companies worldwide. Your
            next career move starts here.
          </p>
          <div className="flex items-center justify-center space-x-8 mt-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>{jobs.length} Active Jobs</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Updated Daily</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Verified Companies</span>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div className="mb-8" {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSearch}>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search jobs, companies, or keywords..."
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Enter location"
                        className="pl-12 h-14 w-56 border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="h-14 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Search className="w-5 h-5 mr-2" />
                      )}
                      Search Jobs
                    </Button>
                  </div>
                </div>
              </form>

              {/* Filter Bar */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full">
                    Remote
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full">
                    Full-time
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full">
                    $100k+
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <SortDesc className="w-4 h-4 text-gray-400" />
                  <select
                    className="text-sm border-0 bg-transparent focus:outline-none text-gray-600"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recent">Most Recent</option>
                    <option value="salary">Highest Salary</option>
                    <option value="rating">Best Rated</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div className="mb-8" {...fadeInUp}>
            <Card className="bg-red-50 border-red-200 shadow-lg">
              <CardContent className="p-6 text-red-600 text-center">
                <p className="font-medium">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">
                    Finding amazing opportunities for you...
                  </p>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No jobs found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search criteria or location to find more
                    opportunities.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                className="space-y-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {jobs.map((job, index) => (
                  <Dialog key={job.id || index}>
                    <DialogTrigger asChild>
                      <motion.div
                        variants={fadeInUp}
                        onClick={() => setSelectedJob(job)}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      >
                        <Card className="hover:shadow-2xl transition-all duration-300 border-0 shadow-lg cursor-pointer bg-white/80 backdrop-blur-sm group">
                          <CardContent className="p-8">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center group-hover:from-emerald-200 group-hover:to-teal-200 transition-colors">
                                  <Building2 className="w-8 h-8 text-emerald-600" />
                                </div>
                                <div>
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                      {job.title}
                                    </h3>
                                    {job.platform === "Adzuna" && (
                                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                                        Verified
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-emerald-600 font-semibold text-lg">
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
                                  className="text-gray-400 hover:text-emerald-600 transition-colors p-2"
                                >
                                  {savedJobs.includes(job.id) ? (
                                    <BookmarkCheck className="w-6 h-6 text-emerald-600" />
                                  ) : (
                                    <Bookmark className="w-6 h-6" />
                                  )}
                                </motion.button>
                              )}
                            </div>

                            <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                              {truncateDescription(job.description)}
                            </p>

                            <div className="flex flex-wrap gap-3 mb-6">
                              <Badge
                                className={`${getPlatformColor(
                                  job.platform
                                )} px-3 py-1 text-sm font-medium`}
                              >
                                {job.platform}
                              </Badge>
                              {job.job_type && (
                                <Badge
                                  variant="outline"
                                  className="text-blue-700 border-blue-200 px-3 py-1 text-sm font-medium"
                                >
                                  {job.job_type}
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
                              <div className="flex items-center space-x-2 text-gray-600">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                <span className="font-medium">
                                  {job.location}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">
                                  {job.posted_date || "Recently posted"}
                                </span>
                              </div>
                              {job.salary && (
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span className="font-medium">
                                    {job.salary}
                                  </span>
                                </div>
                              )}
                            </div>

                            <Separator className="mb-6" />

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="text-sm text-gray-500">
                                  <span className="font-medium text-gray-700">
                                    Quick Apply Available
                                  </span>
                                </div>
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  asChild
                                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
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
                    <DialogContent className="w-[90%] sm:w-[80%] lg:w-[60%] xl:w-[40%] h-[90%] max-w-none max-h-none">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-gray-900">
                          {selectedJob?.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 h-[calc(90vh-120px)] overflow-y-auto pr-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                              <Building2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-emerald-600 font-bold text-xl">
                                {selectedJob?.company}
                              </p>
                              {selectedJob?.platform === "Adzuna" && (
                                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white mt-1">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                          {selectedJob?.id && (
                            <Button
                              onClick={() => toggleSaveJob(selectedJob.id!)}
                              variant="outline"
                              className="flex items-center space-x-2"
                            >
                              {savedJobs.includes(selectedJob.id) ? (
                                <>
                                  <BookmarkCheck className="w-4 h-4" />
                                  <span>Saved</span>
                                </>
                              ) : (
                                <>
                                  <Bookmark className="w-4 h-4" />
                                  <span>Save Job</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Badge
                            className={`${
                              selectedJob &&
                              getPlatformColor(selectedJob.platform)
                            } px-3 py-1`}
                          >
                            {selectedJob?.platform}
                          </Badge>
                          {selectedJob?.job_type && (
                            <Badge
                              variant="outline"
                              className="text-blue-700 border-blue-200 px-3 py-1"
                            >
                              {selectedJob.job_type}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-5 h-5 text-emerald-500" />
                              <div>
                                <p className="text-sm text-gray-500">
                                  Location
                                </p>
                                <p className="font-semibold">
                                  {selectedJob?.location}
                                </p>
                              </div>
                            </div>
                            {selectedJob?.salary && (
                              <div className="flex items-center space-x-3">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Salary
                                  </p>
                                  <p className="font-semibold">
                                    {selectedJob.salary}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="text-sm text-gray-500">Posted</p>
                                <p className="font-semibold">
                                  {selectedJob?.posted_date ||
                                    "Recently posted"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <LinkIcon className="w-5 h-5 text-purple-500" />
                              <div>
                                <p className="text-sm text-gray-500">Source</p>
                                <Link
                                  href={selectedJob?.source_url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline font-semibold"
                                >
                                  View Original
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-2xl font-bold mb-4 text-gray-900">
                            Job Description
                          </h3>
                          <div className="prose max-w-none">
                            {selectedJob?.description &&
                              renderDescription(selectedJob.description)}
                          </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6 border-t">
                          <Button variant="outline" className="px-6 py-3">
                            Share Job
                          </Button>
                          <Button
                            asChild
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 font-semibold"
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
                ))}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>Trending Skills</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      skill: "React",
                      demand: "Very High",
                      color: "text-red-600",
                    },
                    {
                      skill: "Python",
                      demand: "High",
                      color: "text-orange-600",
                    },
                    {
                      skill: "TypeScript",
                      demand: "High",
                      color: "text-orange-600",
                    },
                    {
                      skill: "AWS",
                      demand: "Medium",
                      color: "text-yellow-600",
                    },
                    {
                      skill: "Node.js",
                      demand: "Medium",
                      color: "text-yellow-600",
                    },
                    {
                      skill: "Docker",
                      demand: "Growing",
                      color: "text-green-600",
                    },
                  ].map((item) => (
                    <div
                      key={item.skill}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-700">
                        {item.skill}
                      </span>
                      <Badge
                        variant="outline"
                        className={`${item.color} border-current`}
                      >
                        {item.demand}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <span>Salary Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    {
                      role: "Frontend Developer",
                      range: "$95k - $140k",
                      percentage: 75,
                    },
                    {
                      role: "Backend Developer",
                      range: "$100k - $150k",
                      percentage: 80,
                    },
                    {
                      role: "Full Stack Developer",
                      range: "$90k - $135k",
                      percentage: 70,
                    },
                    {
                      role: "Data Scientist",
                      range: "$120k - $180k",
                      percentage: 100,
                    },
                  ].map((item) => (
                    <div key={item.role}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">
                          {item.role}
                        </span>
                        <span className="font-bold text-gray-900">
                          {item.range}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
              <Card className="shadow-xl border-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
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
