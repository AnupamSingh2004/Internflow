// components/competitions/SubmissionForm.tsx
"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { competitionApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface SubmissionFormProps {
  competitionId: string;
  teamId?: string;
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    submission_file?: string;
    submission_link?: string;
    status?: string;
  };
  isEdit?: boolean;
}

export default function SubmissionForm({
  competitionId,
  teamId,
  initialData,
  isEdit = false,
}: SubmissionFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data with proper fallbacks
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    submission_file: null as File | null,
    submission_link: initialData?.submission_link || "",
  });

  if (isEdit && !initialData?.id) {
    setError("Submission ID is required for editing");
    return;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      if (!formData.description.trim()) {
        throw new Error("Description is required");
      }
      if (!formData.submission_file && !formData.submission_link.trim()) {
        throw new Error("Either a file or link is required");
      }

      const formPayload = new FormData();
      formPayload.append("competition", competitionId);
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);

      if (teamId) {
        formPayload.append("team", teamId);
      }

      if (formData.submission_file) {
        formPayload.append("submission_file", formData.submission_file);
      }

      if (formData.submission_link) {
        formPayload.append("submission_link", formData.submission_link);
      }

      let response;
      if (isEdit && initialData?.id) {
        response = await competitionApi.updateSubmission(
          initialData.id,
          formPayload
        );
      } else {
        response = await competitionApi.createSubmission(formPayload);
      }

      toast({
        title: "Success",
        description: isEdit
          ? "Submission updated successfully"
          : "Submission created successfully",
      });

      // Optionally refresh the page or parent component
      window.location.reload();
    } catch (err: any) {
      console.error("Submission error:", err);

      let errorMessage = "Failed to submit";
      if (err.response) {
        // Handle HTTP errors
        if (err.response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (err.response.data) {
          errorMessage =
            err.response.data.detail ||
            err.response.data.message ||
            JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        // Handle validation errors
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Your submission title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Detailed description of your submission"
          rows={5}
          required
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Upload File</Label>
          <FileUpload
            onFileChange={(file) =>
              setFormData({ ...formData, submission_file: file })
            }
            initialFile={initialData?.submission_file}
          />
          <p className="text-sm text-gray-500">
            Upload your submission file (PDF, ZIP, etc.)
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">OR</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="link">Submission Link</Label>
          <Input
            id="link"
            type="url"
            value={formData.submission_link}
            onChange={(e) =>
              setFormData({ ...formData, submission_link: e.target.value })
            }
            placeholder="https://example.com/submission"
          />
          <p className="text-sm text-gray-500">
            Provide a link to your submission if not uploading a file
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isEdit ? "Updating..." : "Submitting..."}
            </span>
          ) : isEdit ? (
            "Update Submission"
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </form>
  );
}
