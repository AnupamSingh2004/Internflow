// app/admin/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { getUsers, updateUserRole, verifyCompany, deleteUser } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  company_profile?: {
    verified: boolean;
    company_name: string;
  };
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('roles')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const userData = await getUsers()
      setUsers(userData)
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch users:', err)
      setError(err.message || 'Failed to fetch users')
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to fetch users',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateUserRole(userId, newRole)
      toast({
        title: "Success",
        description: "User role updated successfully",
      })
      await fetchUsers()
    } catch (err: any) {
      console.error('Failed to update role:', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to update user role',
      })
    }
  }

  const handleVerifyCompany = async (userId: number, verified: boolean) => {
    try {
      await verifyCompany(userId.toString(), verified)
      toast({
        title: "Success",
        description: `Company ${verified ? 'verified' : 'unverified'} successfully`,
      })
      await fetchUsers()
    } catch (err: any) {
      console.error('Failed to update verification:', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to update verification status',
      })
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId.toString())
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      await fetchUsers()
    } catch (err: any) {
      console.error('Failed to delete user:', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to delete user',
      })
    }
  }

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-red-500">Error: {error}</div>
        <Button onClick={fetchUsers} className="mt-4">Retry</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="verification">Company Verification</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* User Roles Tab */}
        <TabsContent value="roles">
          <div className="space-y-4 mt-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{user.username}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Select 
                      defaultValue={user.role}
                      onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.role === 'admin'}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        {/* Company Verification Tab */}
        <TabsContent value="verification">
          <div className="space-y-4 mt-4">
            {users.filter(u => u.role === 'company').map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{user.company_profile?.company_name || user.username}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Verified:</span>
                    <Switch
                      checked={user.company_profile?.verified || false}
                      onCheckedChange={(verified) => handleVerifyCompany(user.id, verified)}
                    />
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Total Users</h3>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Students</h3>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'student').length}</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Companies</h3>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'company').length}</p>
              <p className="text-sm mt-1">
                ({users.filter(u => u.role === 'company' && u.company_profile?.verified).length} verified)
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}