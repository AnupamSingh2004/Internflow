// This should be at app/invitations/page.tsx (NOT app/invitations/[token]/page.tsx)

"use client"
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { competitionApi } from '@/lib/api'

function InvitationContent() {
  const [invitation, setInvitation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const token = searchParams.get('token')

  useEffect(() => {
    console.log('Current URL:', window.location.href)
    console.log('Search params token:', token)
    
    if (token) {
      fetchInvitation(token)
    } else {
      setError('No invitation token found in URL')
      setLoading(false)
    }
  }, [token])

  const fetchInvitation = async (token: string) => {
    try {
      setLoading(true)
      console.log("Fetching invitation details for token:", token)
      const response = await competitionApi.getInvitationDetails(token)
      console.log("Fetched invitation details:", response)
      setInvitation(response)
      setError(null)
    } catch (err: any) {
      console.error("Error fetching invitation:", err)
      setError(err.message || 'Failed to load invitation')
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to load invitation",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No invitation token available",
      })
      return
    }

    try {
      const response = await competitionApi.acceptInvitation(token)
      console.log("Invitation accepted:", response)

      toast({
        title: "Success",
        description: "You've successfully joined the team!",
      })
      
      if (invitation?.team?.competition?.id) {
        router.push(`/competitions/${invitation.team.competition.id}`)
      } else {
        router.push('/competitions')
      }
    } catch (err: any) {
      console.error("Error accepting invitation:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to accept invitation",
      })
    }
  }

  const handleReject = async () => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No invitation token available",
      })
      return
    }

    try {
      await competitionApi.rejectInvitation(token)
      toast({
        title: "Invitation Declined",
        description: "You've declined the team invitation",
      })
      router.push('/competitions')
    } catch (err: any) {
      console.error("Error rejecting invitation:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to reject invitation",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading invitation details...</p>
          {token && <p className="text-sm text-gray-500 mt-2">Token: {token.substring(0, 10)}...</p>}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-800 mb-2">Error Loading Invitation</h1>
          <p className="text-red-700 mb-4">{error}</p>
          
          <div className="bg-gray-100 p-3 rounded text-sm">
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p><strong>Token found:</strong> {token || 'None'}</p>
          </div>
          
          <Button 
            onClick={() => router.push('/competitions')}
            className="mt-4"
            variant="outline"
          >
            Go to Competitions
          </Button>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto text-center">
          <p>No invitation data available</p>
          <Button 
            onClick={() => router.push('/competitions')}
            className="mt-4"
            variant="outline"
          >
            Go to Competitions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Team Invitation</h1>
        
        <div className="mb-6">
          <p className="text-lg mb-2">
            You've been invited to join <span className="font-semibold">{invitation.team?.name || 'Unknown Team'}</span>
          </p>
          <p className="text-gray-600 mb-1">
            Competition: {invitation.team?.competition?.title || 'Unknown Competition'}
          </p>
          <p className="text-gray-600">
            Invited by: {invitation.team?.leader?.username || invitation.inviter?.username || 'Unknown User'}
          </p>
          
          {invitation.created_at && (
            <p className="text-sm text-gray-500 mt-2">
              Invited on: {new Date(invitation.created_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={handleAccept}
            className="bg-green-600 hover:bg-green-700 flex-1"
          >
            Accept Invitation
          </Button>
          <Button 
            onClick={handleReject}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50 flex-1"
          >
            Decline
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function InvitationPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <InvitationContent />
    </Suspense>
  )
}