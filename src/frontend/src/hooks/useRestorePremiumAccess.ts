import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useRestorePremiumAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ['subscription'] });
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['premiumStatus'] });
      await queryClient.refetchQueries({ queryKey: ['subscription'] });
      await queryClient.refetchQueries({ queryKey: ['currentUserProfile'] });
      await queryClient.refetchQueries({ queryKey: ['premiumStatus'] });
    },
  });
}
