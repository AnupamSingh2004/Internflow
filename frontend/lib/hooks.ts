import { useQuery, useMutation, useQueryClient, QueryFunction } from 'react-query';
import * as api from './api';
import { Competition, CompetitionParticipant, Team, CompetitionSubmission, CompetitionAnnouncement, CompetitionFAQ } from '@/types';

// Competitions
export const useCompetitions = (params?: Record<string, any>) => {
  return useQuery(['competitions', params], () => api.fetchCompetitions(params));
};

export const useCompetition = (id: number) => {
  return useQuery(['competition', id], () => api.fetchCompetition(id), {
    select: (data: Competition) => ({
      ...data,
      // Ensure dates are properly parsed if needed
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      registration_deadline: new Date(data.registration_deadline)
    })
  });
};

export const useCreateCompetition = () => {
  const queryClient = useQueryClient();
  return useMutation(api.createCompetition, {
    onSuccess: () => {
      queryClient.invalidateQueries('competitions');
    },
  });
};

export const useUpdateCompetition = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation((data: Partial<Competition>) => api.updateCompetition(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['competition', id]);
      queryClient.invalidateQueries('competitions');
    },
  });
};

// Participants
export const useParticipants = (competitionId: number) => {
  return useQuery(['participants', competitionId], () => api.fetchParticipants(competitionId));
};

export const useJoinCompetition = (competitionId: number) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { team_name?: string; notes?: string }) => api.joinCompetition(competitionId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['competition', competitionId]);
        queryClient.invalidateQueries(['participants', competitionId]);
      },
    }
  );
};

export const useWithdrawFromCompetition = (competitionId: number) => {
  const queryClient = useQueryClient();
  return useMutation(() => api.withdrawFromCompetition(competitionId), {
    onSuccess: () => {
      queryClient.invalidateQueries(['competition', competitionId]);
      queryClient.invalidateQueries(['participants', competitionId]);
    },
  });
};

// Teams
export const useTeams = (competitionId: number) => {
  return useQuery(['teams', competitionId], () => api.fetchTeams(competitionId));
};

export const useCreateTeam = (competitionId: number) => {
  const queryClient = useQueryClient();
  return useMutation((data: { name: string }) => api.createTeam(competitionId, data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['teams', competitionId]);
    },
  });
};

export const useJoinTeam = (competitionId: number, teamId: number) => {
  const queryClient = useQueryClient();
  return useMutation(() => api.joinTeam(competitionId, teamId), {
    onSuccess: () => {
      queryClient.invalidateQueries(['teams', competitionId]);
    },
  });
};

export const useLeaveTeam = (competitionId: number, teamId: number) => {
  const queryClient = useQueryClient();
  return useMutation(() => api.leaveTeam(competitionId, teamId), {
    onSuccess: () => {
      queryClient.invalidateQueries(['teams', competitionId]);
    },
  });
};

// Submissions
export const useSubmissions = (competitionId: number) => {
  return useQuery(['submissions', competitionId], () => api.fetchSubmissions(competitionId));
};

export const useMySubmissions = () => {
  return useQuery('mySubmissions', api.fetchMySubmissions);
};

export const useCreateSubmission = (competitionId: number) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: Partial<CompetitionSubmission>) => api.createSubmission(competitionId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['submissions', competitionId]);
        queryClient.invalidateQueries('mySubmissions');
      },
    }
  );
};

// Fix the useSubmitSubmission hook
export const useSubmitSubmission = (competitionId: number) => {
  const queryClient = useQueryClient();
  return useMutation(
    (submissionId: number) => api.submitSubmission(competitionId, submissionId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['submissions', competitionId]);
        queryClient.invalidateQueries('mySubmissions');
      },
    }
  );
};

// Fix the useUploadSubmissionFile hook
export const useUploadSubmissionFile = (competitionId: number) => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ submissionId, file }: { submissionId: number; file: File }) => 
      api.uploadSubmissionFile(competitionId, submissionId, file),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['submissions', competitionId]);
        queryClient.invalidateQueries('mySubmissions');
      },
    }
  );
};

// Announcements
export const useAnnouncements = (competitionId: number) => {
  return useQuery(['announcements', competitionId], () => api.fetchAnnouncements(competitionId));
};

// FAQs
export const useFAQs = (competitionId: number) => {
  return useQuery(['faqs', competitionId], () => api.fetchFAQs(competitionId));
};

// Leaderboard
export const useLeaderboard = (competitionId: number) => {
  return useQuery(['leaderboard', competitionId], () => api.fetchLeaderboard(competitionId));
};

// Stats
export const useCompetitionStats = (competitionId: number) => {
  return useQuery(['stats', competitionId], () => api.fetchCompetitionStats(competitionId));
};