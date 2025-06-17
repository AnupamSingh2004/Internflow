"use client";
import { useEffect, useState } from "react";
import { getUsers, updateUserRole, verifyCompany, deleteUser, getCompetitions, approveCompetition, competitionApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Competition } from "@/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Filter, MoreVertical, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("competitions");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      // Fetch data with proper error handling
      const [userData, competitionsData] = await Promise.all([
        getUsers().catch(err => {
          console.error('Failed to fetch users:', err);
          return [];
        }),
        Promise.all([
          competitionApi.getPendingCompetitions().catch(err => {
            console.error('Failed to fetch pending competitions:', err);
            return [];
          }),
          getCompetitions({}).catch(err => {
            console.error('Failed to fetch all competitions:', err);
            return [];
          })
        ]).then(([pending, all]) => [...pending, ...all])
      ]);

      setUsers(userData);
      setCompetitions(competitionsData);
      
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      const errorMessage = err.message || "Failed to fetch data";
      setError(errorMessage);
      
      // Show specific error messages
      if (err.message?.includes('authentication') || err.message?.includes('401')) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in again to access admin features.",
        });
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login?message=admin-auth-required';
        }, 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleApproveCompetition = async (id: number) => {
    try {
      await approveCompetition(id);
      toast({
        title: "Success",
        description: "Competition approved successfully",
      });
      await fetchData(); // Refresh data
    } catch (err: any) {
      console.error("Failed to approve competition:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to approve competition",
      });
    }
  };

  const handleRejectCompetition = async (id: number|string) => {
    try {
      await competitionApi.rejectCompetition(id);
      toast({
        title: "Success",
        description: "Competition rejected",
      });
      await fetchData(); // Refresh data
    } catch (err: any) {
      console.error("Failed to reject competition:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to reject competition",
      });
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string, currentRole: string) => {
    try {
      await updateUserRole(userId, newRole, currentRole);
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      await fetchData(); // Refresh data
    } catch (err: any) {
      console.error("Failed to update user role:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update user role",
      });
    }
  };

  const handleVerifyCompany = async (userId: number, verified: boolean) => {
    try {
      await verifyCompany(userId, verified);
      toast({
        title: "Success",
        description: `Company ${verified ? 'verified' : 'unverified'} successfully`,
      });
      await fetchData(); // Refresh data
    } catch (err: any) {
      console.error("Failed to verify company:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to verify company",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteUser(userId);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      await fetchData(); // Refresh data
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete user",
      });
    }
  };

  const filteredCompetitions = competitions.filter(comp => {
    const matchesSearch = comp.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         comp.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "pending" && !comp.is_approved) ||
                         (statusFilter === "approved" && comp.is_approved);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <Button onClick={fetchData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="verification">Company Verification</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Competitions Tab */}
        <TabsContent value="competitions">
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search competitions..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompetitions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {competitions.length === 0 ? 'No competitions available' : 'No competitions match your search criteria'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompetitions.map((comp) => (
                    <TableRow key={comp.id}>
                      <TableCell className="font-medium">{comp.title || 'Untitled'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{comp.type || 'Unknown'}</Badge>
                      </TableCell>
                      <TableCell>
                        {comp.created_by?.company_name || comp.created_by?.username || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {comp.start_date ? new Date(comp.start_date).toLocaleDateString() : 'N/A'} - {comp.end_date ? new Date(comp.end_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {comp.is_approved ? (
                          <Badge className="bg-green-100 text-green-700">Approved</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/competitions/${comp.id}`, '_blank')}
                          >
                            View
                          </Button>
                          {!comp.is_approved && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveCompetition(comp.id)}
                              >
                                Approve
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem 
                                    className="text-red-500"
                                    onClick={() => handleRejectCompetition(comp.id)}
                                  >
                                    Reject
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <div className="space-y-4 mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={user.role}
                          onValueChange={(newRole) =>
                            handleUpdateUserRole(user.id, newRole, user.role)
                          }
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
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.role === "admin"}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Company Verification Tab */}
        <TabsContent value="verification">
          <div className="space-y-4 mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter((u) => u.role === "company").length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  users
                    .filter((u) => u.role === "company")
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.company_profile?.company_name || user.username}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.company_profile?.verified || false}
                              onCheckedChange={(verified) =>
                                handleVerifyCompany(user.id, verified)
                              }
                            />
                            <span>
                              {user.company_profile?.verified ? "Verified" : "Unverified"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
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
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "student").length}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Companies</h3>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "company").length}
              </p>
              <p className="text-sm mt-1">
                (
                {
                  users.filter(
                    (u) => u.role === "company" && u.company_profile?.verified
                  ).length
                }{" "}
                verified)
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Active Competitions</h3>
              <p className="text-2xl font-bold">
                {competitions.filter(c => c.is_approved && c.end_date && new Date(c.end_date) > new Date()).length}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Pending Competitions</h3>
              <p className="text-2xl font-bold">
                {competitions.filter(c => !c.is_approved).length}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Completed Competitions</h3>
              <p className="text-2xl font-bold">
                {competitions.filter(c => c.is_approved && c.end_date && new Date(c.end_date) <= new Date()).length}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}