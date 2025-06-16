"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { competitionApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";

export default function CompetitionForm({ params }: { params?: { id: string } }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "hackathon",
    tags: [] as string[],
    eligibility: "",
    start_date: new Date(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
    registration_deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Default to 6 days from now
    prizes: {
      firstPrize: "",
      secondPrize: "",
      otherPrizes: [] as string[],
    },
    rules: "",
    submission_guidelines: "",
    registration_link: "",
    submission_link: "",
    max_team_size: 1,
    judging_criteria: "",
    certificate_available: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [prizeInput, setPrizeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const resolvedParams = use(params);

  useEffect(() => {
    if (resolvedParams?.id) {
      setIsEditing(true);
      fetchCompetition(resolvedParams.id.toString());
    }
  }, [params?.id]);

  const fetchCompetition = async (id: string) => {
    try {
      setLoading(true);
      const data = await competitionApi.getCompetition(id);
      setFormData({
        ...data,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        registration_deadline: new Date(data.registration_deadline),
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to fetch competition",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (isEditing && params?.id) {
        await competitionApi.updateCompetition(params.id, formData);
        toast({
          title: "Success",
          description: "Competition updated successfully",
        });
      } else {
        await competitionApi.createCompetition(formData);
        toast({
          title: "Success",
          description: "Competition created successfully",
        });
      }
      
      router.push("/competitions");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save competition",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleAddPrize = () => {
    if (prizeInput.trim()) {
      setFormData({
        ...formData,
        prizes: {
          ...formData.prizes,
          otherPrizes: [...formData.prizes.otherPrizes, prizeInput.trim()],
        },
      });
      setPrizeInput("");
    }
  };

  const handleRemovePrize = (prizeToRemove: string) => {
    setFormData({
      ...formData,
      prizes: {
        ...formData.prizes,
        otherPrizes: formData.prizes.otherPrizes.filter(prize => prize !== prizeToRemove),
      },
    });
  };

  if (loading && isEditing) {
    return <div className="container mx-auto py-8">Loading competition data...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Competition" : "Create New Competition"}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="hackathon">Hackathon</option>
              <option value="case_study">Case Study</option>
              <option value="coding_contest">Coding Contest</option>
              <option value="design_challenge">Design Challenge</option>
              <option value="data_science">Data Science</option>
              <option value="business_plan">Business Plan</option>
            </select>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Eligibility</label>
            <Input
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Start Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.start_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.start_date ? (
                    format(formData.start_date, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.start_date}
                  onSelect={(date) => date && setFormData({ ...formData, start_date: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">End Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.end_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.end_date ? (
                    format(formData.end_date, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.end_date}
                  onSelect={(date) => date && setFormData({ ...formData, end_date: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Registration Deadline *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.registration_deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.registration_deadline ? (
                    format(formData.registration_deadline, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.registration_deadline}
                  onSelect={(date) => date && setFormData({ ...formData, registration_deadline: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Max Team Size *</label>
            <Input
              type="number"
              min="1"
              value={formData.max_team_size}
              onChange={(e) => setFormData({ ...formData, max_team_size: parseInt(e.target.value) || 1 })}
              required
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium">Prizes</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">First Prize</label>
                <Input
                  value={formData.prizes.firstPrize}
                  onChange={(e) => setFormData({
                    ...formData,
                    prizes: { ...formData.prizes, firstPrize: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Second Prize</label>
                <Input
                  value={formData.prizes.secondPrize}
                  onChange={(e) => setFormData({
                    ...formData,
                    prizes: { ...formData.prizes, secondPrize: e.target.value }
                  })}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <label className="block text-sm font-medium">Other Prizes</label>
              <div className="flex gap-2">
                <Input
                  value={prizeInput}
                  onChange={(e) => setPrizeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPrize())}
                />
                <Button type="button" onClick={handleAddPrize}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.prizes.otherPrizes.map((prize) => (
                  <Badge key={prize} className="flex items-center gap-1">
                    {prize}
                    <button
                      type="button"
                      onClick={() => handleRemovePrize(prize)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium">Rules</label>
            <Textarea
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium">Submission Guidelines</label>
            <Textarea
              value={formData.submission_guidelines}
              onChange={(e) => setFormData({ ...formData, submission_guidelines: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium">Judging Criteria</label>
            <Textarea
              value={formData.judging_criteria}
              onChange={(e) => setFormData({ ...formData, judging_criteria: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Registration Link</label>
            <Input
              type="url"
              value={formData.registration_link}
              onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Submission Link</label>
            <Input
              type="url"
              value={formData.submission_link}
              onChange={(e) => setFormData({ ...formData, submission_link: e.target.value })}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="certificate"
              checked={formData.certificate_available}
              onCheckedChange={(checked) => setFormData({ ...formData, certificate_available: checked })}
            />
            <label htmlFor="certificate" className="text-sm font-medium">
              Certificate Available
            </label>
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/competitions")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Competition" : "Create Competition"}
          </Button>
        </div>
      </form>
    </div>
  );
}