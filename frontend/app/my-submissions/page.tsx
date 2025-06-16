import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function MySubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await apiRequest("/competitions/my-submissions/", "GET");
        setSubmissions(data.results);
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchSubmissions();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Submissions</h1>

      {submissions.length === 0 ? (
        <p className="text-gray-600">You haven't submitted to any competitions yet.</p>
      ) : (
        <div className="space-y-6">
          {submissions.map((submission) => (
            <div key={submission.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    <Link
                      href={`/competitions/${submission.competition.id}/submissions/${submission.id}`}
                      className="hover:underline"
                    >
                      {submission.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-2">
                    For:{" "}
                    <Link
                      href={`/competitions/${submission.competition.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {submission.competition.title}
                    </Link>
                  </p>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        submission.status === "evaluated" || submission.status === "winner"
                          ? "bg-green-100 text-green-800"
                          : submission.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {submission.status}
                    </span>
                    {submission.score && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        Score: {submission.score}
                      </span>
                    )}
                    {submission.rank && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        Rank: {submission.rank}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}