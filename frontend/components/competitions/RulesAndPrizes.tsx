import { Badge } from "@/components/ui/badge";
import { Award, FileText } from "lucide-react";

interface RulesAndPrizesProps {
  rules: string;
  prizes: any;
  judgingCriteria: string;
}

export default function RulesAndPrizes({ rules, prizes, judgingCriteria }: RulesAndPrizesProps) {
  return (
    <div className="space-y-6">
      {rules && (
        <div>
          <h4 className="flex items-center gap-2 font-semibold mb-2">
            <FileText className="h-5 w-5" />
            Rules
          </h4>
          <div className="prose prose-sm max-w-none">
            <p>{rules}</p>
          </div>
        </div>
      )}
      
      {(prizes.firstPrize || prizes.secondPrize || prizes.otherPrizes?.length > 0) && (
        <div>
          <h4 className="flex items-center gap-2 font-semibold mb-2">
            <Award className="h-5 w-5" />
            Prizes
          </h4>
          <div className="space-y-2">
            {prizes.firstPrize && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">1st</Badge>
                <span>{prizes.firstPrize}</span>
              </div>
            )}
            {prizes.secondPrize && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">2nd</Badge>
                <span>{prizes.secondPrize}</span>
              </div>
            )}
            {prizes.otherPrizes?.map((prize: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="outline">{index + 3}rd</Badge>
                <span>{prize}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {judgingCriteria && (
        <div>
          <h4 className="font-semibold mb-2">Judging Criteria</h4>
          <div className="prose prose-sm max-w-none">
            <p>{judgingCriteria}</p>
          </div>
        </div>
      )}
    </div>
  );
}