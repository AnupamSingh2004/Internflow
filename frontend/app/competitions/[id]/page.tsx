"use client";

import { useEffect, useState, use } from "react";
import { competitionApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  Award,
  FileText,
  Mail,
  UserPlus,
  X,
  Trophy,
  Target,
  Zap,
  Star,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Edit3,
  ExternalLink,
  Crown,
  Shield,
  ArrowRight,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TeamCard from "@/components/competitions/TeamCard";
import SubmissionForm from "@/components/competitions/SubmissionForm";
import RulesAndPrizes from "@/components/competitions/RulesAndPrizes";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [competition, setCompetition] = useState<any>(null);
  const [creatorInfo, setCreatorInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRegistered, setIsRegistered] = useState(false);
  const [userTeam, setUserTeam] = useState<any>(null);
  const [userSubmission, setUserSubmission] = useState<any>(null);
  const { toast } = useToast();
  const [teamName, setTeamName] = useState("");
  const [teammateUsername, setTeammateUsername] = useState("");
  const [teammateEmail, setTeammateEmail] = useState("");
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
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
    if (!authLoading) {
      fetchCompetition();
    }
  }, [resolvedParams.id, authLoading]);

  const fetchCompetition = async () => {
    try {
      setLoading(true);
      const data = await competitionApi.getCompetition(resolvedParams.id);
      const competitionData = {
        ...data,
        teams: data.teams || [],
        prizes: data.prizes || {
          firstPrize: "",
          secondPrize: "",
          otherPrizes: [],
        },
      };
      console.log(competitionData);
      setCompetition(competitionData);

      if (data.created_by) {
        try {
          const creator = await competitionApi.getUserById(data.created_by);
          setCreatorInfo(creator);
        } catch (error) {
          setCreatorInfo({
            username: "Unknown",
            company_name: null,
          });
        }
      }

      if (user) {
        try {
          const registrationStatus = await competitionApi.getRegistrationStatus(
            resolvedParams.id
          );
          setIsRegistered(registrationStatus.registered);
          setUserTeam(registrationStatus.team);

          if (registrationStatus.team) {
            try {
              const invitations = await competitionApi.getTeamInvitations(
                registrationStatus.team.id
              );
              setPendingInvitations(invitations);
            } catch (inviteError) {
              console.error("Failed to fetch invitations:", inviteError);
              setPendingInvitations([]);
            }

            // Fetch user's submission if registered
            try {
              const submissions = await competitionApi.getSubmissions(
                resolvedParams.id
              );
              const userSub = submissions.find(
                (sub: any) =>
                  sub.user === user.id ||
                  sub.team === registrationStatus.team.id
              );
              setUserSubmission(userSub || null);
            } catch (submissionError) {
              console.error("Failed to fetch submissions:", submissionError);
              setUserSubmission(null);
            }
          }
        } catch (regError) {
          console.error("Failed to fetch registration status:", regError);
        }
      }

      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch competition:", err);
      setError(err.message || "Failed to fetch competition");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to fetch competition",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to register",
      });
      return;
    }

    if (!teamName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a team name",
      });
      return;
    }

    try {
      const response = await competitionApi.registerForCompetition(
        resolvedParams.id,
        teamName
      );

      // Update the competition state with the new data
      setCompetition(response.competition);
      setIsRegistered(true);
      setUserTeam(response.team_id);

      toast({
        title: "Success",
        description: "Team created successfully",
      });
      setShowTeamForm(false);
    } catch (err: any) {
      console.error("Failed to register:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to create team",
      });
    }
  };

  const handleInviteTeammate = async () => {
    if (!teammateUsername.trim() && !teammateEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a username or email",
      });
      return;
    }

    try {
      const payload = teammateUsername.trim()
        ? { username: teammateUsername.trim() }
        : { email: teammateEmail.trim() };

      await competitionApi.inviteToTeam(userTeam.id, payload);

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      setTeammateUsername("");
      setTeammateEmail("");
      setShowInviteDialog(false);
      fetchCompetition();
    } catch (err: any) {
      console.error("Failed to invite teammate:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to send invitation",
      });
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await competitionApi.cancelInvitation(invitationId);
      toast({
        title: "Success",
        description: "Invitation cancelled",
      });
      fetchCompetition();
    } catch (err: any) {
      console.error("Failed to cancel invitation:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to cancel invitation",
      });
    }
  };

  if (authLoading) {
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
            Loading competition details...
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
              Error Loading Competition
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={fetchCompetition}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              <Zap className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg border-gray-100">
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">
              Competition Not Found
            </h3>
            <p className="text-gray-600 mt-2">
              The competition you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompetitionActive =
    new Date() >= new Date(competition.start_date) &&
    new Date() <= new Date(competition.end_date);
  const isRegistrationOpen =
    new Date() <= new Date(competition.registration_deadline);

  const getStatusBadge = () => {
    if (isCompetitionActive) {
      return (
        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md">
          <PlayCircle className="mr-1 h-3 w-3" />
          Live Now
        </Badge>
      );
    } else if (new Date() < new Date(competition.start_date)) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 shadow-md">
          <Clock className="mr-1 h-3 w-3" />
          Upcoming
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0 shadow-md">
          <CheckCircle className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    }
  };

  const getRegistrationBadge = () => {
    return isRegistrationOpen ? (
      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md">
        <Zap className="mr-1 h-3 w-3" />
        Open
      </Badge>
    ) : (
      <Badge variant="outline" className="border-red-300 text-red-600">
        <X className="mr-1 h-3 w-3" />
        Closed
      </Badge>
    );
  };

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
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-0 backdrop-blur-sm"
                  >
                    <Trophy className="mr-1 h-3 w-3" />
                    {competition.type}
                  </Badge>
                  {getStatusBadge()}
                </div>

                <motion.h1
                  className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight bg-gradient-to-r from-gray-900 to-emerald-800 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                  {competition.title}
                </motion.h1>

                <motion.p
                  className="text-xl text-emerald-100 mb-6 max-w-3xl leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                >
                  {competition.description}
                </motion.p>

                <motion.div
                  className="flex flex-wrap gap-4 text-white/90"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div
                    variants={fadeInUp}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>
                      {new Date(competition.start_date).toLocaleDateString()} -{" "}
                      {new Date(competition.end_date).toLocaleDateString()}
                    </span>
                  </motion.div>
                  <motion.div
                    variants={fadeInUp}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-5 w-5" />
                    <span>{competition.teams_count || 0} teams registered</span>
                  </motion.div>
                  <motion.div
                    variants={fadeInUp}
                    className="flex items-center gap-2"
                  >
                    <Award className="h-5 w-5" />
                    <span>
                      {competition.prizes?.firstPrize || "Exciting prizes"}
                    </span>
                  </motion.div>
                </motion.div>
              </div>

              <motion.div
                className="flex flex-col gap-3 min-w-[200px]"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                {user?.role === "company" &&
                  competition.created_by === user.id && (
                    <Link href={`/competitions/${competition.id}/edit`}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg">
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit Competition
                        </Button>
                      </motion.div>
                    </Link>
                  )}
                {user?.role === "company" &&
                  competition.created_by === user.id && (
                    <Link href={`/competitions/${competition.id}/submissions`}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg">
                          <FileText className="mr-2 h-4 w-4" />
                          View Submissions
                        </Button>
                      </motion.div>
                    </Link>
                  )}

                {user?.role === "student" &&
                  !isRegistered &&
                  isRegistrationOpen && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => setShowTeamForm(true)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Join Competition
                      </Button>
                    </motion.div>
                  )}

                {isRegistered && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white text-center">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2 text-emerald-300" />
                    <span className="font-medium">You're Registered!</span>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {showTeamForm &&
              user?.role === "student" &&
              !isRegistered &&
              isRegistrationOpen && (
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                >
                  <Card className="mb-8 shadow-lg border-gray-100 bg-white/80">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-700">
                        <Users className="h-5 w-5" />
                        Create Your Team
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          placeholder="Enter a creative team name"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          className="border-emerald-200 focus:border-emerald-400"
                          required
                        />
                        <p className="text-sm text-emerald-600 flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Maximum team size: {competition.max_team_size} members
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={handleRegister}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            Create Team
                          </Button>
                        </motion.div>
                        <Button
                          variant="outline"
                          onClick={() => setShowTeamForm(false)}
                          className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-white shadow-md rounded-lg p-1">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="teams"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Teams
                </TabsTrigger>
                <TabsTrigger
                  value="submit"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Submit
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-6">
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div variants={fadeInUp}>
                      <Card className="shadow-md border-gray-100 bg-white/80">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-100 rounded-full">
                              <Calendar className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-emerald-600">
                                Competition Period
                              </p>
                              <p className="text-lg font-semibold text-gray-800">
                                {new Date(
                                  competition.start_date
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {new Date(
                                  competition.end_date
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <Card className="shadow-md border-gray-100 bg-white/80">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-teal-100 rounded-full">
                              <Users className="h-6 w-6 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-teal-600">
                                Team Size
                              </p>
                              <p className="text-lg font-semibold text-gray-800">
                                Up to {competition.max_team_size} members
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <Card className="shadow-md border-gray-100 bg-white/80">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-100 rounded-full">
                              <Award className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-emerald-600">
                                Prize Pool
                              </p>
                              <p className="text-lg font-semibold text-gray-800">
                                {competition.prizes?.firstPrize ||
                                  "Exciting rewards"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <Card className="shadow-md border-gray-100 bg-white/80">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-teal-100 rounded-full">
                              <Clock className="h-6 w-6 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-teal-600">
                                Registration Deadline
                              </p>
                              <p className="text-lg font-semibold text-gray-800">
                                {new Date(
                                  competition.registration_deadline
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  <motion.div variants={fadeInUp}>
                    <Card className="shadow-lg border-gray-100 bg-white/80">
                      <CardContent className="p-6">
                        <RulesAndPrizes
                          rules={competition.rules}
                          prizes={competition.prizes}
                          judgingCriteria={competition.judging_criteria}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="teams" className="pt-6">
                {isRegistered ? (
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    {userTeam && (
                      <motion.div variants={fadeInUp}>
                        <Card className="shadow-lg border-gray-100 bg-white/80">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-700">
                              <Crown className="h-5 w-5" />
                              Your Team
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <TeamCard
                              team={userTeam}
                              isLeader={userTeam.leader.id === user?.id}
                              competitionId={competition.id}
                            />
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {userTeam?.leader.id === user?.id && (
                      <motion.div variants={fadeInUp}>
                        <Card className="shadow-md border-gray-100 bg-white/80">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-700">
                              <Mail className="h-5 w-5" />
                              Pending Invitations
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {pendingInvitations.length > 0 ? (
                              <div className="space-y-3">
                                {pendingInvitations.map((invitation) => (
                                  <div
                                    key={invitation.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-emerald-100 rounded-full">
                                        <Mail className="h-4 w-4 text-emerald-600" />
                                      </div>
                                      <span className="font-medium">
                                        {invitation.email ||
                                          invitation.username}
                                      </span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleCancelInvitation(invitation.id)
                                      }
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-4">
                                No pending invitations
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    <motion.div variants={fadeInUp}>
                      <Card className="shadow-lg border-gray-100 bg-white/80">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-gray-700">
                            <Users className="h-5 w-5" />
                            All Teams ({competition.teams?.length || 0})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 gap-4">
                            {competition.teams?.map((team: any) => (
                              <TeamCard
                                key={team.id}
                                team={team}
                                isLeader={false}
                                competitionId={competition.id}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                  >
                    <Card className="shadow-lg border-gray-100 bg-white/80 text-center py-12">
                      <CardContent>
                        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          Registration Required
                        </h3>
                        <p className="text-gray-500 mb-6">
                          You need to register for this competition to view team
                          information.
                        </p>
                        {isRegistrationOpen && !isRegistered && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              onClick={() => setShowTeamForm(true)}
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Register Now
                            </Button>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="submit" className="pt-6">
                {isRegistered && isCompetitionActive ? (
                  <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                  >
                    <Card className="shadow-lg border-gray-100 bg-white/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-700">
                          <Trophy className="h-5 w-5" />
                          {userSubmission
                            ? "Your Submission"
                            : "Submit Your Solution"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {userSubmission ? (
                          <div className="space-y-6">
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                              <div className="flex items-center gap-3 mb-3">
                                <Badge className="bg-emerald-100 text-emerald-700">
                                  {userSubmission.status === "submitted" && (
                                    <span className="flex items-center">
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      Submitted
                                    </span>
                                  )}
                                  {userSubmission.status === "draft" && (
                                    <span className="flex items-center">
                                      <Edit3 className="mr-1 h-3 w-3" />
                                      Draft
                                    </span>
                                  )}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  Submitted on:{" "}
                                  {userSubmission.submitted_at
                                    ? new Date(
                                        userSubmission.submitted_at
                                      ).toLocaleString()
                                    : "Not yet submitted"}
                                </span>
                              </div>
                              <h4 className="font-semibold text-lg mb-2">
                                {userSubmission.title}
                              </h4>
                              <p className="text-gray-700 mb-3">
                                {userSubmission.description}
                              </p>
                              {userSubmission.submission_file && (
                                <a
                                  href={userSubmission.submission_file}
                                  target="_blank"
                                  className="inline-flex items-center text-emerald-600 hover:underline"
                                >
                                  <FileText className="mr-1 h-4 w-4" />
                                  Download Submission File
                                </a>
                              )}
                              {userSubmission.submission_link && (
                                <div className="mt-2">
                                  <a
                                    href={userSubmission.submission_link}
                                    target="_blank"
                                    className="inline-flex items-center text-emerald-600 hover:underline"
                                  >
                                    <ExternalLink className="mr-1 h-4 w-4" />
                                    View Submission Link
                                  </a>
                                </div>
                              )}
                            </div>

                            <SubmissionForm
                              competitionId={competition.id}
                              teamId={userTeam?.id}
                              initialData={{
                                id: userSubmission.id,
                                title: userSubmission.title,
                                description: userSubmission.description,
                                submission_file: userSubmission.submission_file,
                                submission_link: userSubmission.submission_link,
                                status: userSubmission.status,
                              }}
                              isEdit={true}
                            />
                          </div>
                        ) : (
                          <SubmissionForm
                            competitionId={competition.id}
                            teamId={userTeam?.id}
                            isEdit={false}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                  >
                    <Card className="shadow-lg border-gray-100 bg-white/80 text-center py-12">
                      <CardContent>
                        <div className="mb-6">
                          {!isRegistered ? (
                            <AlertCircle className="h-16 w-16 text-orange-400 mx-auto" />
                          ) : (
                            <Clock className="h-16 w-16 text-gray-400 mx-auto" />
                          )}
                        </div>
                        {!isRegistered ? (
                          <>
                            <h3 className="text-xl font-semibold text-orange-700 mb-2">
                              Registration Required
                            </h3>
                            <p className="text-orange-600 mb-6">
                              You need to register for this competition to
                              submit solutions.
                            </p>
                            {isRegistrationOpen && (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  onClick={() => setShowTeamForm(true)}
                                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                >
                                  <Star className="mr-2 h-4 w-4" />
                                  Register Now
                                </Button>
                              </motion.div>
                            )}
                          </>
                        ) : (
                          <>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                              {new Date() < new Date(competition.start_date)
                                ? "Competition Not Started"
                                : "Competition Ended"}
                            </h3>
                            <p className="text-gray-500">
                              {new Date() < new Date(competition.start_date)
                                ? "The competition hasn't started yet. Come back later!"
                                : "The submission period has ended. Thank you for participating!"}
                            </p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-16 space-y-6">
              <motion.div
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.3 }}
              >
                <Card className="shadow-lg border-gray-100 bg-white/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-700">
                      <Target className="h-5 w-5" />
                      Competition Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Registration:</span>
                      {getRegistrationBadge()}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge()}
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deadline:</span>
                        <span className="font-medium">
                          {new Date(
                            competition.registration_deadline
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Teams:</span>
                        <span className="font-medium text-emerald-600">
                          {competition.teams_count || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Participants:</span>
                        <span className="font-medium text-teal-600">
                          {competition.participants_count || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {isRegistered && userTeam && (
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <Card className="shadow-lg border-gray-100 bg-white/80">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-700">
                        <Users className="h-5 w-5" />
                        Team Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Dialog
                        open={showInviteDialog}
                        onOpenChange={setShowInviteDialog}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite Teammates
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Mail className="h-5 w-5 text-emerald-600" />
                              Invite Teammates
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Username
                              </label>
                              <Input
                                placeholder="Enter username"
                                value={teammateUsername}
                                onChange={(e) =>
                                  setTeammateUsername(e.target.value)
                                }
                                className="border-emerald-200 focus:border-emerald-400"
                              />
                            </div>
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">
                                  OR
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Email Address
                              </label>
                              <Input
                                type="email"
                                placeholder="Enter email address"
                                value={teammateEmail}
                                onChange={(e) =>
                                  setTeammateEmail(e.target.value)
                                }
                                className="border-emerald-200 focus:border-emerald-400"
                              />
                            </div>
                            <Button
                              onClick={handleInviteTeammate}
                              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Send Invitation
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Link
                        href={`/competitions/${competition.id}/teams/${userTeam.id}/edit`}
                      >
                        <Button
                          variant="outline"
                          className="w-full border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Manage Team
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <motion.div
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.3 }}
              >
                <Card className="shadow-lg border-gray-100 bg-white/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-700">
                      <Crown className="h-5 w-5" />
                      Organizer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {creatorInfo?.company_profile?.company_name
                          ? creatorInfo.company_profile.company_name
                              .charAt(0)
                              .toUpperCase()
                          : creatorInfo?.username
                          ? creatorInfo.username.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {creatorInfo?.company_profile?.company_name ||
                            creatorInfo?.username ||
                            "Loading..."}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {creatorInfo?.company_profile?.company_name
                              ? "Company"
                              : "Organizer"}
                          </span>
                          {creatorInfo?.company_profile?.verified && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.3 }}
              >
                <Card className="shadow-lg border-gray-100 bg-white/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-700">
                      <ExternalLink className="h-5 w-5" />
                      Useful Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {competition.registration_link && (
                      <a
                        href={competition.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        <FileText className="h-5 w-5" />
                        <span className="font-medium">
                          Registration Details
                        </span>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </a>
                    )}
                    {competition.submission_link && (
                      <a
                        href={competition.submission_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                      >
                        <Trophy className="h-5 w-5" />
                        <span className="font-medium">Submission Portal</span>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </a>
                    )}
                    {!competition.registration_link &&
                      !competition.submission_link && (
                        <div className="text-center py-4 text-gray-500">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">
                            No additional links available
                          </p>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
