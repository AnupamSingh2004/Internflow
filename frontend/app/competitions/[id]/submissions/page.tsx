"use client";

import { useAuth } from "@/contexts/AuthContext";
import { competitionApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  ExternalLink,
  Trophy,
  Users,
  Award,
  CheckCircle,
  Clock,
  X,
  User,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

export default function CompetitionSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [competition, setCompetition] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [compData, subsData] = await Promise.all([
          competitionApi.getCompetition(id),
          competitionApi.getSubmissions(id),
        ]);
        setCompetition(compData);
        setSubmissions(subsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load competition data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  if (!user || user.role !== "company") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg border-gray-100">
          <CardContent className="p-6 text-center">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Access Denied
            </h3>
            <p className="text-red-600 mb-4">
              Only competition organizers can view this page.
            </p>
            <Button onClick={() => router.push("/competitions")}>
              Back to Competitions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="text-lg text-gray-600">Loading submissions...</span>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge className="bg-emerald-100 text-emerald-700">
            <CheckCircle className="mr-1 h-3 w-3" />
            Submitted
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700">
            <Clock className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {competition?.title}
              </h1>
              <p className="text-lg text-emerald-600 font-medium">
                Submissions Management
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/competitions/${id}`)}
              >
                Back to Competition
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-white/80 shadow-md border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {submissions.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 shadow-md border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Submitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">
                {submissions.filter((s) => s.status === "submitted").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 shadow-md border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {submissions.filter((s) => s.status === "draft").length}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/80 shadow-lg rounded-lg border border-gray-100 overflow-hidden"
        >
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Team/User</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Submission</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length > 0 ? (
                submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      {submission.team ? (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-emerald-600" />
                          <span>{submission.team.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-teal-600" />
                          <span>{submission.user.username}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {submission.title}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      {submission.submitted_at
                        ? new Date(submission.submitted_at).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {submission.submission_file ? (
                        <a
                          href={submission.submission_file}
                          download
                          className="inline-flex items-center text-emerald-600 hover:underline"
                        >
                          <FileText className="mr-1 h-4 w-4" />
                          Download
                        </a>
                      ) : submission.submission_link ? (
                        <a
                          href={submission.submission_link}
                          target="_blank"
                          className="inline-flex items-center text-teal-600 hover:underline"
                        >
                          <ExternalLink className="mr-1 h-4 w-4" />
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/competitions/${id}/submissions/${submission.id}`
                          )
                        }
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                      <Trophy className="h-8 w-8 opacity-50" />
                      <p>No submissions yet</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </motion.div>
      </div>
    </div>
  );
}