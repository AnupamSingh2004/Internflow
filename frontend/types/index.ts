export interface Competition {
  id: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
  eligibility: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  prizes: {
    firstPrize: string;
    secondPrize: string;
    otherPrizes: string[];
  };
  rules: string;
  submission_guidelines: string;
  registration_link: string;
  submission_link: string;
  max_team_size: number;
  judging_criteria: string;
  certificate_available: boolean;
  is_approved: boolean;
  created_by: {
    id: string;
    username: string;
    company_name?: string;
  };
  teams: Team[];
  submissions: Submission[];
}

export interface Team {
  id: string;
  name: string;
  leader: {
    id: string;
    username: string;
  };
  members: {
    id: string;
    username: string;
  }[];
}

export interface Submission {
  id: string;
  title: string;
  description: string;
  submission_url: string;
  file: string;
  status: string;
  submitted_at: string;
  user: {
    id: string;
    username: string;
  };
  team?: {
    id: string;
    name: string;
  };
}