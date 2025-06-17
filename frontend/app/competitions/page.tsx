"use client";

import { useEffect, useState } from "react";
import { competitionApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Zap, ArrowRight, User, LogOut } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Competition } from "@/types";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  // Navbar state
  const [navUser, setNavUser] = useState(null);
  const [navLoading, setNavLoading] = useState(true);

  // Framer Motion animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Navbar authentication logic
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setNavLoading(false);
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setNavUser(userData);
      } else {
        await refreshToken();
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setNavLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/token/refresh/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.access);
        await checkAuthStatus();
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setNavUser(null);
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setNavUser(null);
    window.location.reload();
  };

  // Competition data fetching
  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const data = await competitionApi.getCompetitions();
      console.log("Fetched competitions:", data);
      setCompetitions(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch competitions:", err);
      setError(err.message || "Failed to fetch competitions");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to fetch competitions",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCompetitions = competitions.filter(comp => {
    const matchesSearch = comp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         comp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || comp.type === typeFilter;
    
    const now = new Date();
    const startDate = new Date(comp.start_date);
    const endDate = new Date(comp.end_date);
    
    const matchesStatus = 
      (statusFilter === "active" && now >= startDate && now <= endDate) ||
      (statusFilter === "upcoming" && now < startDate) ||
      (statusFilter === "past" && now > endDate) ||
      statusFilter === "all";
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (authLoading || navLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="text-lg text-gray-600">
            Loading authentication...
          </span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="text-lg text-gray-600">
            Loading competitions...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg border-gray-100">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Error Loading Competitions
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={fetchCompetitions}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                <Zap className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 font-sans text-gray-900">
      {/* Navbar */}
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

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/jobs"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
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
              className="text-emerald-600 font-semibold border-b-2 border-emerald-600 pb-1"
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

          <div className="flex items-center space-x-4">
            {navLoading ? (
              <div className="flex items-center space-x-4">
                <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : navUser ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-emerald-700 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-semibold">
                    Welcome, {navUser.first_name || navUser.username || "User"}
                  </span>
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
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
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
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
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="relative container mx-auto py-12 px-4">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight bg-gradient-to-r from-gray-900 to-emerald-800 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Explore Competitions
            </motion.h1>
            <motion.p
              className="text-xl text-emerald-100 mb-6 max-w-3xl leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              Join exciting challenges to showcase your skills and win amazing prizes!
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto py-8 px-4">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex justify-between items-center mb-8">
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-extrabold text-gray-800"
            >
              Competitions
            </motion.h2>
            {user?.role === "company" && (
              <motion.div variants={fadeInUp} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/competitions/create">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg">
                    <Zap className="mr-2 h-4 w-4" />
                    Create Competition
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          <motion.div variants={fadeInUp} className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search competitions..."
                className="pl-10 border-emerald-200 focus:border-emerald-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px] border-emerald-200 focus:border-emerald-400">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="case_study">Case Study</SelectItem>
                    <SelectItem value="coding_contest">Coding Contest</SelectItem>
                    <SelectItem value="design_challenge">Design Challenge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] border-emerald-200 focus:border-emerald-400">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {filteredCompetitions.length === 0 ? (
            <motion.div variants={fadeInUp} className="text-center py-12">
              <Card className="shadow-lg border-gray-100 bg-white/80">
                <CardContent className="p-6">
                  <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Competitions Found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCompetitions.map((comp) => (
                <motion.div
                  key={comp.id}
                  variants={fadeInUp}
                  className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white/80"
                >
                  <Card className="border-0">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{comp.title}</h3>
                        <Badge
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md"
                        >
                          {comp.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {comp.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {comp.tags?.map((tag, index) => (
                          <Badge
                            key={index}
                            className="bg-emerald-100 text-emerald-700 border-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Starts:</span>
                          <span>{new Date(comp.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ends:</span>
                          <span>{new Date(comp.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Link href={`/competitions/${comp.id}`}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </motion.div>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}