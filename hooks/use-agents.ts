import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { agentService, type Agent } from '@/services/agent-service'
import type { AgentCreateInput } from '@/src/types/agent'

export function useAgentsQuery() {
  return useQuery<Agent[], Error>({
    queryKey: ['agents'],
    queryFn: () => agentService.getAgents(),
    // Keep data fresh enough for UI but avoid constant refetching
    staleTime: 60_000, // 1 min
    gcTime: 300_000,   // 5 min
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: true,
  })
}

export function useCreateAgentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AgentCreateInput) => agentService.createAgent(input),
    onSuccess: (newAgent) => {
      // Optimistically update list cache
      queryClient.setQueryData<Agent[] | undefined>(['agents'], (old) => {
        if (!old) return [newAgent]
        return [newAgent, ...old]
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}
