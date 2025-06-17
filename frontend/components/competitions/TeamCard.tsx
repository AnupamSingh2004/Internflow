import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, MailPlus } from "lucide-react";
import Link from "next/link";
import InviteDialog from "./InviteDialog";
import { useEffect, useState } from "react";
import { competitionApi } from "@/lib/api";

interface TeamCardProps {
  team: any;
  isLeader: boolean;
  competitionId: string;
}

interface MemberDetails {
  id: number;
  username: string;
  email: string;
}

export default function TeamCard({ team, isLeader, competitionId }: TeamCardProps) {
  const [members, setMembers] = useState<MemberDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const memberPromises = team.members.map((memberId: number) => 
          competitionApi.getUserById(memberId)
        );
        
        const memberDetails = await Promise.all(memberPromises);
        setMembers(memberDetails);
      } catch (error) {
        console.error("Failed to fetch member details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [team.members]);

  if (loading) {
    return (
      <div className="border rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            {[...Array(team.members.length + 1)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium">{team.name}</h4>
        {isLeader && <Badge className="flex items-center gap-1"><Crown className="h-3 w-3" /> Leader</Badge>}
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <Users className="h-4 w-4" />
        <span>{team.current_size} members</span>
      </div>
      
      <div className="space-y-2 mb-4">
        {/* Leader */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
            {team.leader_name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm">
            {team.leader_name} (Leader)
          </span>
        </div>
        
        {/* Members */}
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
              {member.username?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm">{member.username}</span>
          </div>
        ))}
      </div>
      
      {isLeader && (
        <div className="flex gap-2">
          <InviteDialog teamId={team.id} competitionId={competitionId} />
          <Link href={`/competitions/${competitionId}/teams/${team.id}/edit`}>
            <Button variant="outline" size="sm">
              Manage Team
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}