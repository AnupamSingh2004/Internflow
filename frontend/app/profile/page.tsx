"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  GraduationCap,
  BookOpen,
  Award,
  Plus,
  Edit3,
  Save,
  Camera,
  Zap,
  ArrowLeft,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false) // Separate saving state
  const [formData, setFormData] = useState({
    professional_title: '',
    bio: '',
    phone_number: '',
    location: '',
    website: '',
    educations: [],
    skills: [],
    certifications: [],
    projects: []
  })
  const { toast } = useToast()
  const router = useRouter()

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  // Fixed API base URL - use consistent URL
  const API_BASE_URL = 'http://127.0.0.1:8000'

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in to view your profile",
            variant: "destructive",
          })
          router.push('/login')
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/profile/complete-profile/`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: "Session Expired",
              description: "Please log in again",
              variant: "destructive",
            })
            router.push('/login')
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json()
        setProfileData(data)
        
        // Initialize form data with proper fallbacks
        setFormData({
          professional_title: data.profile?.professional_title || '',
          bio: data.profile?.bio || '',
          phone_number: data.profile?.phone_number || '',
          location: data.profile?.location || '',
          website: data.profile?.website || '',
          educations: Array.isArray(data.educations) ? data.educations : [],
          skills: Array.isArray(data.skills) ? data.skills : [],
          certifications: Array.isArray(data.certifications) ? data.certifications : [],
          projects: Array.isArray(data.projects) ? data.projects : []
        })
        
      } catch (error) {
        console.error('Error fetching profile data:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfileData()
  }, [router, toast])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEducationChange = (index, field, value) => {
    if (index < 0 || index >= formData.educations.length) return // Bounds check
    
    const updatedEducations = [...formData.educations]
    updatedEducations[index] = {
      ...updatedEducations[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      educations: updatedEducations
    }))
  }

  const handleAddEducation = () => {
    const currentYear = new Date().getFullYear()
    setFormData(prev => ({
      ...prev,
      educations: [
        ...prev.educations,
        {
          degree: '',
          institution: '',
          field_of_study: '',
          start_year: currentYear,
          end_year: null, // Changed to null for proper handling
          gpa: '',
          description: '',
          is_current: true // Default to current
        }
      ]
    }))
  }

  const handleRemoveEducation = (index) => {
    if (index < 0 || index >= formData.educations.length) return // Bounds check
    
    const updatedEducations = [...formData.educations]
    updatedEducations.splice(index, 1)
    setFormData(prev => ({
      ...prev,
      educations: updatedEducations
    }))
  }

  const handleSkillChange = (index, field, value) => {
    if (index < 0 || index >= formData.skills.length) return // Bounds check
    
    const updatedSkills = [...formData.skills]
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills
    }))
  }

  const handleAddSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          name: '',
          proficiency: 'intermediate'
        }
      ]
    }))
  }

  const handleRemoveSkill = (index) => {
    if (index < 0 || index >= formData.skills.length) return // Bounds check
    
    const updatedSkills = [...formData.skills]
    updatedSkills.splice(index, 1)
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills
    }))
  }

  const handleProjectChange = (index, field, value) => {
    if (index < 0 || index >= formData.projects.length) return // Bounds check
    
    const updatedProjects = [...formData.projects]
    
    // Handle skills_used specially
    if (field === 'skills_used' && typeof value === 'string') {
      const skillsArray = value.split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)
        .map(skill => ({ skill }))
      
      updatedProjects[index] = {
        ...updatedProjects[index],
        [field]: skillsArray
      }
    } else {
      updatedProjects[index] = {
        ...updatedProjects[index],
        [field]: value
      }
    }
    
    setFormData(prev => ({
      ...prev,
      projects: updatedProjects
    }))
  }

  const handleAddProject = () => {
    const today = new Date().toISOString().split('T')[0]
    setFormData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: '',
          description: '',
          project_url: '',
          github_url: '',
          start_date: today,
          end_date: null,
          is_current: true,
          skills_used: []
        }
      ]
    }))
  }

  const handleRemoveProject = (index) => {
    if (index < 0 || index >= formData.projects.length) return // Bounds check
    
    const updatedProjects = [...formData.projects]
    updatedProjects.splice(index, 1)
    setFormData(prev => ({
      ...prev,
      projects: updatedProjects
    }))
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      
      const token = localStorage.getItem('accessToken')
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to save your profile",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      // Save profile data
      const profileResponse = await fetch(`${API_BASE_URL}/api/profile/profile/`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          professional_title: formData.professional_title,
          bio: formData.bio,
          phone_number: formData.phone_number,
          location: formData.location,
          website: formData.website
        })
      })
      
      if (!profileResponse.ok) {
        throw new Error(`Failed to save profile: ${profileResponse.status}`)
      }
      
      // Save educations - only save non-empty ones
      const validEducations = formData.educations.filter(edu => 
        edu.degree.trim() || edu.institution.trim()
      )
      
      for (const education of validEducations) {
        const educationData = {
          ...education,
          start_year: education.start_year || new Date().getFullYear(),
          end_year: education.end_year || null,
          gpa: education.gpa || null
        }
        
        if (education.id) {
          // Update existing education
          const response = await fetch(`${API_BASE_URL}/api/profile/educations/${education.id}/`, {
            method: 'PUT',
            credentials: 'include',
            headers: getAuthHeaders(),
            body: JSON.stringify(educationData)
          })
          if (!response.ok) {
            console.error(`Failed to update education ${education.id}:`, response.status)
          }
        } else {
          // Create new education
          const response = await fetch(`${API_BASE_URL}/api/profile/educations/`, {
            method: 'POST',
            credentials: 'include',
            headers: getAuthHeaders(),
            body: JSON.stringify(educationData)
          })
          if (!response.ok) {
            console.error('Failed to create education:', response.status)
          }
        }
      }
      
      // Save skills - only save non-empty ones
      const validSkills = formData.skills.filter(skill => skill.name.trim())
      
      for (const skill of validSkills) {
        if (skill.id) {
          // Update existing skill
          const response = await fetch(`${API_BASE_URL}/api/profile/skills/${skill.id}/`, {
            method: 'PUT',
            credentials: 'include',
            headers: getAuthHeaders(),
            body: JSON.stringify(skill)
          })
          if (!response.ok) {
            console.error(`Failed to update skill ${skill.id}:`, response.status)
          }
        } else {
          // Create new skill
          const response = await fetch(`${API_BASE_URL}/api/profile/skills/`, {
            method: 'POST',
            credentials: 'include',
            headers: getAuthHeaders(),
            body: JSON.stringify(skill)
          })
          if (!response.ok) {
            console.error('Failed to create skill:', response.status)
          }
        }
      }
      
      // Save projects - only save non-empty ones
      const validProjects = formData.projects.filter(project => 
        project.title.trim() || project.description.trim()
      )
      
      for (const project of validProjects) {
        const projectData = {
          ...project,
          skills_used: Array.isArray(project.skills_used) 
            ? project.skills_used.map(skill => 
                typeof skill === 'string' ? skill : skill.skill
              ).filter(Boolean)
            : []
        }
        
        if (project.id) {
          // Update existing project
          const response = await fetch(`${API_BASE_URL}/api/profile/projects/${project.id}/`, {
            method: 'PUT',
            credentials: 'include',
            headers: getAuthHeaders(),
            body: JSON.stringify(projectData)
          })
          if (!response.ok) {
            console.error(`Failed to update project ${project.id}:`, response.status)
          }
        } else {
          // Create new project
          const response = await fetch(`${API_BASE_URL}/api/profile/projects/`, {
            method: 'POST',
            credentials: 'include',
            headers: getAuthHeaders(),
            body: JSON.stringify(projectData)
          })
          if (!response.ok) {
            console.error('Failed to create project:', response.status)
          }
        }
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      
      // Refresh the data
      const response = await fetch(`${API_BASE_URL}/api/profile/complete-profile/`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
      }
      
      setIsEditing(false)
      
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't load your profile data.</p>
          <Button onClick={() => router.push('/')}>Go to Home</Button>
        </div>
      </div>
    )
  }

  const user = profileData.profile || {}
  const educations = formData.educations || []
  const skills = formData.skills || []
  const certifications = formData.certifications || []
  const projects = formData.projects || []

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

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={isEditing ? handleSaveProfile : () => setIsEditing(!isEditing)}
              disabled={saving}
              className={`${
                isEditing
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  : "bg-gray-600 hover:bg-gray-700"
              } text-white`}
            >
              {isEditing ? (
                <>
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </motion.div>
        </div>
        
      </motion.header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <motion.div {...fadeInUp}>
          <Card className="mb-8 shadow-lg border-0">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage src={user.profile_picture || "/placeholder.svg?height=128&width=128"} alt="Profile" />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                      {user.first_name?.[0] || 'U'}{user.last_name?.[0] || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="absolute bottom-2 right-2 bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="First Name" defaultValue={user.first_name || ''} className="text-lg" disabled />
                        <Input placeholder="Last Name" defaultValue={user.last_name || ''} className="text-lg" disabled />
                      </div>
                      <Input
                        name="professional_title"
                        placeholder="Professional Title"
                        value={formData.professional_title}
                        onChange={handleInputChange}
                        className="text-lg"
                      />
                      <Textarea
                        name="bio"
                        placeholder="Bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                          {user.first_name || 'First'} {user.last_name || 'Last'}
                        </h1>
                        <p className="text-xl text-emerald-600 font-medium">
                          {user.professional_title || 'No title provided'}
                        </p>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {user.bio || 'No bio provided'}
                      </p>
                    </>
                  )}

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {skills.slice(0, 4).map((skill, index) => (
                      <Badge key={index} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                        {skill.name}
                      </Badge>
                    ))}
                    {skills.length > 4 && (
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                        +{skills.length - 4} more
                      </Badge>
                    )}
                    {skills.length === 0 && !isEditing && (
                      <Badge variant="outline">No skills added</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card className="mb-8 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-emerald-600" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website/Portfolio</Label>
                    <Input 
                      id="website" 
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span>{user.email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span>{user.phone_number || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>{user.location || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-gray-500" />
                    {user.website ? (
                      <a href={user.website} className="text-emerald-600 hover:text-emerald-700" target="_blank" rel="noopener noreferrer">
                        {user.website}
                      </a>
                    ) : (
                      <span>Not provided</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Education */}
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <Card className="mb-8 shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <span>Education</span>
              </CardTitle>
              {isEditing && (
                <Button 
                  onClick={handleAddEducation}
                  size="sm" 
                  variant="outline" 
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Education
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {educations.length === 0 && !isEditing && (
                <p className="text-gray-500 text-center py-4">No education information added</p>
              )}

              {educations.map((education, index) => (
                <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg">
                  {isEditing && (
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleRemoveEducation(index)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                  
                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Degree</Label>
                          <Input 
                            value={education.degree || ''}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            placeholder="Bachelor of Science in Computer Science"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Institution</Label>
                          <Input 
                            value={education.institution || ''}
                            onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                            placeholder="University Name"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>GPA</Label>
                          <Input 
                            value={education.gpa || ''}
                            onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                            placeholder="3.8/4.0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Start Year</Label>
                          <Select 
                            value={education.start_year?.toString() || new Date().getFullYear().toString()}
                            onValueChange={(value) => handleEducationChange(index, 'start_year', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 20}, (_, i) => new Date().getFullYear() - i).map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>End Year</Label>
                          <Select 
                            value={education.end_year?.toString() || ''}
                            onValueChange={(value) => handleEducationChange(index, 'end_year', value ? parseInt(value) : null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Ongoing" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Ongoing</SelectItem>
                              {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={education.description || ''}
                          onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                          placeholder="Relevant coursework, honors, etc."
                        />
                      </div>
                    </>
                  ) : (
                    <div className="border-l-4 border-emerald-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900">{education.degree || 'Degree not specified'}</h3>
                      <p className="text-emerald-600 font-medium">{education.institution || 'Institution not specified'}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {education.start_year} - {education.end_year || 'Present'}
                          </span>
                        </div>
                        {education.gpa && (
                          <div className="flex items-center space-x-1">
                            <Award className="w-4 h-4" />
                            <span>GPA: {education.gpa}</span>
                          </div>
                        )}
                      </div>
                      {education.description && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">{education.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills & Certifications */}
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
          <Card className="mb-8 shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Skills & Certifications</span>
              </CardTitle>
              {isEditing && (
                <Button 
                  onClick={handleAddSkill}
                  size="sm" 
                  variant="outline" 
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Skill
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={index} className="space-y-2 p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <Label>Skill Name</Label>
                          <Input 
                            value={skill.name}
                            onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                            placeholder="e.g., React, Python"
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-600 ml-4"
                          onClick={() => handleRemoveSkill(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>Proficiency Level</Label>
                        <Select 
                          value={skill.proficiency}
                          onValueChange={(value) => handleSkillChange(index, 'proficiency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Technical Skills</h4>
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge key={index} className="bg-emerald-100 text-emerald-700">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No skills added</p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Certifications</h4>
                    {certifications.length > 0 ? (
                      <div className="space-y-2">
                        {certifications.map((cert, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-emerald-600" />
                            <span className="text-gray-700">{cert.name} ({cert.issue_date})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No certifications added</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Projects */}
        <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>Projects</span>
              </CardTitle>
              {isEditing && (
                <Button 
                  onClick={handleAddProject}
                  size="sm" 
                  variant="outline" 
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Project
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {projects.length === 0 && !isEditing && (
                <p className="text-gray-500 text-center py-4">No projects added</p>
              )}

              {projects.map((project, index) => (
                <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg">
                  {isEditing && (
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleRemoveProject(index)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Project Name</Label>
                          <Input 
                            value={project.title}
                            onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>GitHub URL</Label>
                          <Input 
                            value={project.github_url || ''}
                            onChange={(e) => handleProjectChange(index, 'github_url', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={project.description}
                          onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Technologies Used (comma separated)</Label>
                        <Input 
                          value={project.skills_used?.map(s => s.skill).join(', ') || ''}
                          onChange={(e) => handleProjectChange(index, 'skills_used', e.target.value.split(',').map(s => ({ skill: s.trim() })))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="border-l-4 border-emerald-500 pl-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              className="text-emerald-600 hover:text-emerald-700 text-sm"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View on GitHub
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mt-2 leading-relaxed">
                        {project.description}
                      </p>
                      {project.skills_used?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {project.skills_used.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="outline">{skill.skill}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}