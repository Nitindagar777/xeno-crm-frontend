import React, { createContext, useState, useEffect, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sendMessage, approveStep, getSuggestions } from '../api/agent.api';
import toast from 'react-hot-toast';

const AgentContext = createContext(null);

export const AgentProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [agentContext, setAgentContext] = useState({
    intent: null,
    segmentPlan: null,
    segmentName: null,
    segmentDesc: null,
    campaignName: null,
    messagePlan: null,
    channelPlan: null,
    approvals: { segment: false, message: false, channel: false },
    resolvedAudienceCount: 0,
    campaignCreated: false,
    currentStep: 'UNDERSTAND_INTENT'
  });

  // Load suggestions
  const fetchSuggestions = async () => {
    try {
      const res = await getSuggestions();
      if (res.success && Array.isArray(res.data)) {
        setSuggestions(res.data);
      }
    } catch (err) {
      console.warn('AI suggestions load failed:', err.message);
    }
  };

  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [isOpen]);

  const togglePanel = () => setIsOpen(!isOpen);
  const openPanel = () => setIsOpen(true);
  const closePanel = () => setIsOpen(false);

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      ...msg
    }]);
  };

  const clearMessages = () => {
    setMessages([]);
    setAgentContext({
      intent: null,
      segmentPlan: null,
      segmentName: null,
      segmentDesc: null,
      campaignName: null,
      messagePlan: null,
      channelPlan: null,
      approvals: { segment: false, message: false, channel: false },
      resolvedAudienceCount: 0,
      campaignCreated: false,
      currentStep: 'UNDERSTAND_INTENT'
    });
    fetchSuggestions();
  };

  const updateAgentContext = (updates) => {
    setAgentContext((prev) => ({ ...prev, ...updates }));
  };

  const invalidateAndRefetchSegments = () => {
    queryClient.invalidateQueries({ queryKey: ['segments'] });
    queryClient.refetchQueries({ queryKey: ['segments'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    queryClient.refetchQueries({ queryKey: ['dashboard-overview'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-insights'] });
    queryClient.refetchQueries({ queryKey: ['dashboard-insights'] });
    
    // Invalidate and refetch again with minor delay to ensure consistency
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      queryClient.refetchQueries({ queryKey: ['segments'] });
    }, 500);
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      queryClient.refetchQueries({ queryKey: ['segments'] });
    }, 1500);
  };

  const invalidateAndRefetchCampaigns = () => {
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    queryClient.refetchQueries({ queryKey: ['campaigns'] });
    queryClient.invalidateQueries({ queryKey: ['segments'] });
    queryClient.refetchQueries({ queryKey: ['segments'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    queryClient.refetchQueries({ queryKey: ['dashboard-overview'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-insights'] });
    queryClient.refetchQueries({ queryKey: ['dashboard-insights'] });
    
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.refetchQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      queryClient.refetchQueries({ queryKey: ['segments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-insights'] });
    }, 500);
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.refetchQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      queryClient.refetchQueries({ queryKey: ['segments'] });
    }, 1500);
  };

  const sendToAgentWithContext = async (userText, customContext) => {
    if (!userText.trim()) return;

    // 1. Add user message
    addMessage({ role: 'user', content: userText, type: 'text' });
    setIsLoading(true);

    // 2. Add temporary typing indicator
    const thinkingId = 'thinking_' + Math.random().toString(36).substring(7);
    setMessages((prev) => [...prev, {
      id: thinkingId,
      role: 'agent',
      content: 'Thinking...',
      type: 'thinking',
      timestamp: new Date()
    }]);

    try {
      const response = await sendMessage(userText, customContext || agentContext);

      // Remove thinking loader and add agent reply
      setMessages((prev) => prev.filter(m => m.id !== thinkingId));

      if (response.success) {
        const { reply, agentContext: newContext, structuredData, action } = response.data;
        
        setAgentContext(newContext);

        // Determine message subtype for rendering specific cards
        let type = 'text';
        if (action === 'AWAIT_SEGMENT' && structuredData.segmentRules) {
          type = 'segment_proposal';
        } else if (action === 'AWAIT_MESSAGE' && structuredData.messageTemplate) {
          type = 'message_proposal';
        } else if (action === 'AWAIT_CHANNEL' && structuredData.channel) {
          type = 'channel_proposal';
        } else if (newContext.currentStep === 'CONFIRM_LAUNCH') {
          type = 'campaign_proposal';
        } else if (newContext.campaignCreated) {
          type = 'success';
          toast.success('Campaign launched successfully! 🚀');
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 6000);
          invalidateAndRefetchCampaigns();
        } else if (newContext.currentStep === 'COMPLETED' && structuredData.segmentRules && !structuredData.messagePlan) {
          type = 'success';
          toast.success('Segment created successfully! ✅');
          invalidateAndRefetchSegments();
        }

        addMessage({
          role: 'agent',
          content: reply,
          type,
          structuredData
        });
      } else {
        addMessage({
          role: 'agent',
          content: response.error || 'Failed to process request',
          type: 'text'
        });
      }
    } catch (err) {
      setMessages((prev) => prev.filter(m => m.id !== thinkingId));
      addMessage({
        role: 'agent',
        content: `Sorry, I encountered an error: ${err.message}. Please verify your connection or Gemini API key.`,
        type: 'text'
      });
      toast.error('AI Agent error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendToAgent = async (userText) => {
    await sendToAgentWithContext(userText, agentContext);
  };

  const approveAgentStep = async (step, editedData = null) => {
    setIsLoading(true);
    try {
      const res = await approveStep(step, agentContext, editedData);
      if (res.success) {
        const { agentContext: newContext, reply } = res.data;
        setAgentContext(newContext);

        // Notify step approval in chat thread
        addMessage({
          role: 'user',
          content: editedData 
            ? `Approved ${step} with manual edits` 
            : `Approved ${step}`,
          type: 'text'
        });

        if (step === 'campaign' || newContext.campaignCreated) {
          toast.success('Campaign launched successfully! 🚀');
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 6000);
          invalidateAndRefetchCampaigns();
          addMessage({
            role: 'agent',
            content: reply || 'Campaign launched successfully! 🚀',
            type: 'success'
          });
          setIsLoading(false);
          return;
        }

        if (step === 'segment' && newContext.currentStep === 'COMPLETED') {
          toast.success('Segment created successfully! ✅');
          invalidateAndRefetchSegments();
          addMessage({
            role: 'agent',
            content: reply || 'Segment created successfully! ✅',
            type: 'success'
          });
          setIsLoading(false);
          return;
        }

        // Trigger next prompt automatically to proceed the agent conversation loop
        let nextPromptMessage = '';
        if (step === 'segment') {
          nextPromptMessage = 'I have approved the segment. Propose a message template for my campaign.';
        } else if (step === 'message') {
          nextPromptMessage = 'I have approved the message template. Recommend a channel to send it.';
        } else if (step === 'channel') {
          nextPromptMessage = 'The channel is approved. Show me the final summary so we can launch.';
        }

        // Call agent with next prompt message in sequence
        await sendToAgent(nextPromptMessage);
      } else {
        toast.error(res.error || 'Failed to approve step');
      }
    } catch (err) {
      toast.error(`Approve step failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const rejectAgentStep = (step) => {
    // Reverts state back
    const resetApprovals = { ...agentContext.approvals };
    let currentStep = agentContext.currentStep;

    if (step === 'segment') {
      resetApprovals.segment = false;
      currentStep = 'PROPOSE_SEGMENT';
    } else if (step === 'message') {
      resetApprovals.message = false;
      currentStep = 'PROPOSE_MESSAGE';
    } else if (step === 'channel') {
      resetApprovals.channel = false;
      currentStep = 'PROPOSE_CHANNEL';
    }

    setAgentContext(prev => ({
      ...prev,
      approvals: resetApprovals,
      currentStep
    }));

    addMessage({
      role: 'user',
      content: `Let's modify the proposed ${step}. Please suggest another option.`,
      type: 'text'
    });

    addMessage({
      role: 'agent',
      content: `Understood, let's adjust the ${step}. What changes would you like me to make?`,
      type: 'text'
    });
  };

  const value = {
    isOpen,
    messages,
    agentContext,
    setAgentContext,
    updateAgentContext,
    isLoading,
    suggestions,
    togglePanel,
    openPanel,
    closePanel,
    addMessage,
    clearMessages,
    sendToAgent,
    sendToAgentWithContext,
    approveAgentStep,
    rejectAgentStep,
    showConfetti,
    setShowConfetti
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
