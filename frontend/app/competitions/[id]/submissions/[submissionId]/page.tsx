"use client";

import { useAuth } from "@/contexts/AuthContext";
import { competitionApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  User,
  File,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [competition, setCompetition] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState("");
  const [saving, setSaving] = useState(false);

  // Unwrap params using React.use()
  const { id, submissionId } = use(params);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [id, submissionId, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compData, subData] = await Promise.all([
        competitionApi.getCompetition(id),
        competitionApi.getSubmissions(submissionId) // Changed from getSubmissions to getSubmission
      ]);
      console.log(compData,subData)
      setCompetition(compData);
      setSubmission(subData[0]);
      setFeedback(subData[0].feedback || "");
      setScore(subData[0].score?.toString() || "");
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load submission data",
      });
      router.push(`/competitions/${id}/submissions`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (!submissionId) return;

    try {
      setSaving(true);
      const updatedSubmission = await competitionApi.updateSubmission(
        submissionId,
        { 
          feedback : feedback,
          score: score ? parseInt(score) : null
        }
      );

      setSubmission(updatedSubmission);
      toast({
        title: "Success",
        description: "Feedback saved successfully",
      });
    } catch (error: any) {
      console.error("Failed to save feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save feedback",
      });
    } finally {
      setSaving(false);
    }
  };

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
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="text-lg text-gray-600">Loading submission...</span>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg border-gray-100">
          <CardContent className="p-6 text-center">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Submission Not Found
            </h3>
            <Button 
              onClick={() => router.push(`/competitions/${id}/submissions`)}
              className="mt-4"
            >
              Back to Submissions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
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
      case "approved":
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <Award className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700">
            <X className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700">
            <Clock className="mr-1 h-3 w-3" />
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <Button
              variant="outline"
              onClick={() => router.push(`/competitions/${id}/submissions`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Submissions
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Submission Review: {competition?.title}
            </h1>
            <div className="w-full sm:w-auto"></div> {/* Spacer for mobile */}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 shadow-md border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-lg">{submission.title || "Untitled Submission"}</span>
                  {getStatusBadge(submission.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line">
                      {submission.description || "No description provided"}
                    </p>
                  </div>

                  {submission.submission_file && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">
                        Submission File
                      </h3>
                      <a
                        href={submission.submission_file}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-emerald-600 hover:underline"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download File
                      </a>
                    </div>
                  )}

                  {submission.submission_link && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">
                        Submission Link
                      </h3>
                      <a
                        href={submission.submission_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-teal-600 hover:underline"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Submission
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 shadow-md border-gray-100">
              <CardHeader>
                <CardTitle>Evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="score">Score (0-100)</Label>
                      <Input
                        id="score"
                        type="number"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        placeholder="Enter score"
                      />
                    </div>
                    <div>
                      <Label>Current Status</Label>
                      <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {getStatusBadge(submission.status)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide detailed feedback..."
                      rows={5}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/competitions/${id}/submissions`)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveFeedback} 
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Feedback"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/80 shadow-md border-gray-100">
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
              </CardHeader>
              <CardContent>
                {submission.team ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">
                        Team Name
                      </h3>
                      <p className="text-gray-600">{submission.team_name}</p>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">
                        Members
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-emerald-600" />
                          <span>{submission.team.leader?.username || "Unknown"}</span>
                          <Badge className="ml-auto">Leader</Badge>
                        </div>
                        {submission.team.members?.map((member: any) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2"
                          >
                            <User className="h-4 w-4 text-teal-600" />
                            <span>{member.username}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">
                        Participant
                      </h3>
                      <p className="text-gray-600">
                        {submission.user?.username || "Unknown"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/80 shadow-md border-gray-100">
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-1">Submitted</h3>
                  <p className="text-gray-600">
                    {submission.submitted_at
                      ? new Date(submission.submitted_at).toLocaleString()
                      : "Not submitted"}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-1">
                    Last Updated
                  </h3>
                  <p className="text-gray-600">
                    {new Date(submission.updated_at).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}