'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Analysis, AnalysisCreate, Finding } from '@/lib/types';

interface AnalysisContextType {
  // Current analysis state
  currentAnalysis: Analysis | null;
  setCurrentAnalysis: (analysis: Analysis | null) => void;
  
  // Analysis operations
  createAnalysis: (data: AnalysisCreate) => Promise<Analysis>;
  deleteAnalysis: (id: number) => Promise<void>;
  
  // Analysis queries
  analyses: Analysis[];
  isLoadingAnalyses: boolean;
  error: Error | null;
  
  // Findings
  findings: Finding[];
  isLoadingFindings: boolean;
  
  // Refresh functions
  refreshAnalyses: () => void;
  refreshFindings: (analysisId: number) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const queryClient = useQueryClient();

  // Query for analyses list
  const {
    data: analysesData,
    isLoading: isLoadingAnalyses,
    error,
    refetch: refreshAnalyses,
  } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => apiClient.getAnalyses(),
    staleTime: 30000, // 30 seconds
  });

  // Query for findings of current analysis
  const {
    data: findingsData,
    isLoading: isLoadingFindings,
    refetch: refreshFindings,
  } = useQuery({
    queryKey: ['findings', currentAnalysis?.id],
    queryFn: () => 
      currentAnalysis 
        ? apiClient.getAnalysisFindings(currentAnalysis.id)
        : Promise.resolve({ items: [], total: 0, page: 1, size: 20, pages: 1 }),
    enabled: !!currentAnalysis,
    staleTime: 10000, // 10 seconds
  });

  // Mutation for creating analysis
  const createAnalysisMutation = useMutation({
    mutationFn: (data: AnalysisCreate) => apiClient.createAnalysis(data),
    onSuccess: (newAnalysis) => {
      // Add to analyses list
      queryClient.setQueryData(['analyses'], (old: any) => {
        if (!old) return { items: [newAnalysis], total: 1, page: 1, size: 20, pages: 1 };
        return {
          ...old,
          items: [newAnalysis, ...old.items],
          total: old.total + 1,
        };
      });
      
      // Set as current analysis
      setCurrentAnalysis(newAnalysis);
    },
  });

  // Mutation for deleting analysis
  const deleteAnalysisMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteAnalysis(id),
    onSuccess: (_, deletedId) => {
      // Remove from analyses list
      queryClient.setQueryData(['analyses'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((analysis: Analysis) => analysis.id !== deletedId),
          total: old.total - 1,
        };
      });
      
      // Clear current analysis if it was deleted
      if (currentAnalysis?.id === deletedId) {
        setCurrentAnalysis(null);
      }
    },
  });

  const createAnalysis = useCallback(async (data: AnalysisCreate) => {
    return createAnalysisMutation.mutateAsync(data);
  }, [createAnalysisMutation]);

  const deleteAnalysis = useCallback(async (id: number) => {
    return deleteAnalysisMutation.mutateAsync(id);
  }, [deleteAnalysisMutation]);

  const refreshFindingsCallback = useCallback((analysisId: number) => {
    if (currentAnalysis?.id === analysisId) {
      refreshFindings();
    }
  }, [currentAnalysis?.id, refreshFindings]);

  const value: AnalysisContextType = {
    currentAnalysis,
    setCurrentAnalysis,
    createAnalysis,
    deleteAnalysis,
    analyses: analysesData?.items || [],
    isLoadingAnalyses,
    error: error as Error | null,
    findings: findingsData?.items || [],
    isLoadingFindings,
    refreshAnalyses,
    refreshFindings: refreshFindingsCallback,
  };

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
