"use client";

import { useAuth } from "@/contexts/AuthContext";
import { competitionApi } from "@/lib/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  Award,
  FileText,
  Trophy,
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
  X,
  Plus,
  User,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function MyCompetitionsPage() {
  const { user } = useAuth();
  const [organized, setOrganized] = useState<any[]>([]);
  const [participating, setParticipating] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all competitions
        const allCompetitions = await competitionApi.getCompetitions();
        
        // Filter competitions created by the current user
        const createdByUser = allCompetitions.filter(
          (comp: any) => comp.created_by === user?.id
        );
        
        // Fetch teams where user is a member or leader
        const userTeams = await competitionApi.getUserTeams();
        console.log(userTeams)
        
        // Get competition IDs where user is participating
        const participatingIds = userTeams.map((team: any) => team.competition);
        console.log(participatingIds)
        
        // Filter competitions where user is participating but not the creator
        const participatingComps = allCompetitions.filter(
          (comp: any) => 
            participatingIds.includes(comp.id) && 
            comp.created_by !== user?.id
        );

        setOrganized(createdByUser);
        setParticipating(participatingComps);
      } catch (err: any) {
        console.error("Failed to fetch competitions:", err);
        setError(err.message || "Failed to load competitions");
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Failed to load competitions",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchCompetitions();
  }, [user, toast]);

  // Helper function to get user's role in a competition
  const getUserRole = (competitionId: string) => {
    // This would need to be implemented based on your team data structure
    return "member"; // or "leader"
  };

  // Helper function to get user's team name for a competition
  const getTeamName = (competitionId: string) => {
    // This would need to be implemented based on your team data structure
    return "My Team";
  };

  // Helper function to check if user has a submission for a competition
  const hasSubmission = (competitionId: string) => {
    // This would need to be implemented based on your submission data structure
    return false; // or return submission object if exists
  };

  const getStatusBadge = (comp: any) => {
    const now = new Date();
    const startDate = new Date(comp.start_date);
    const endDate = new Date(comp.end_date);

    if (now >= startDate && now <= endDate) {
      return (
        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md">
          <PlayCircle className="mr-1 h-3 w-3" />
          Live Now
        </Badge>
      );
    } else if (now < startDate) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="text-lg text-gray-600">
            Loading your competitions...
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
            <Button
              onClick={() => window.location.reload()}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            My Competitions
          </h1>
          <p className="text-xl text-gray-600">
            Manage competitions you've organized or are participating in
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-12"
        >
          {/* Organized Competitions Section */}
          <motion.section variants={fadeInUp}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Crown className="h-6 w-6 text-emerald-600" />
                Organized by Me
              </h2>
              <Link href="/competitions/new">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New
                </Button>
              </Link>
            </div>

            {organized.length === 0 ? (
              <Card className="shadow-lg border-gray-100 bg-white/80 text-center py-12">
                <CardContent>
                  <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Competitions Organized
                  </h3>
                  <p className="text-gray-500 mb-6">
                    You haven't created any competitions yet.
                  </p>
                  <Link href="/competitions/new">
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Competition
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organized.map((comp) => (
                  <motion.div 
                    key={comp.id}
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="shadow-lg border-gray-100 bg-white/80 h-full flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-xl font-bold">
                            <Link 
                              href={`/competitions/${comp.id}`} 
                              className="hover:underline hover:text-emerald-600"
                            >
                              {comp.title}
                            </Link>
                          </CardTitle>
                          {getStatusBadge(comp)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(comp.start_date).toLocaleDateString()} -{" "}
                            {new Date(comp.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-gray-600 line-clamp-3 mb-4">
                          {comp.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4" />
                            <span>{comp.teams_count || 0} teams</span>
                          </div>
                          <Link
                            href={`/competitions/${comp.id}`}
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                          >
                            Manage <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Participating Competitions Section */}
          <motion.section variants={fadeInUp}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <User className="h-6 w-6 text-teal-600" />
              Participating In
            </h2>

            {participating.length === 0 ? (
              <Card className="shadow-lg border-gray-100 bg-white/80 text-center py-12">
                <CardContent>
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Not Participating Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    You're not registered for any competitions yet.
                  </p>
                  <Link href="/competitions">
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                      <Trophy className="mr-2 h-4 w-4" />
                      Browse Competitions
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {participating.map((comp) => (
                  <motion.div 
                    key={comp.id}
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="shadow-lg border-gray-100 bg-white/80 h-full flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-xl font-bold">
                            <Link 
                              href={`/competitions/${comp.id}`} 
                              className="hover:underline hover:text-emerald-600"
                            >
                              {comp.title}
                            </Link>
                          </CardTitle>
                          {getStatusBadge(comp)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(comp.start_date).toLocaleDateString()} -{" "}
                            {new Date(comp.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-gray-600 line-clamp-3 mb-4">
                          {comp.description}
                        </p>
                        <div className="space-y-3 mt-auto">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4" />
                              <span>Team: {getTeamName(comp.id)}</span>
                            </div>
                            <Badge variant="outline" className="border-emerald-200 text-emerald-600">
                              {getUserRole(comp.id)}
                            </Badge>
                          </div>
                          {hasSubmission(comp.id) ? (
                            <Link
                              href={`/competitions/${comp.id}/submissions`}
                              className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium"
                            >
                              <FileText className="h-4 w-4" />
                              View Submission
                            </Link>
                          ) : (
                            <Link
                              href={`/competitions/${comp.id}`}
                              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium"
                            >
                              <Trophy className="h-4 w-4" />
                              Create Submission
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}