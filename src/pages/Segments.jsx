import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSegments, createSegment, updateSegment, deleteSegment, refreshSegment } from '../api/segment.api';
import SegmentCard from '../components/segments/SegmentCard';
import RuleBuilder from '../components/segments/RuleBuilder';
import { SkeletonCard } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { sendMessage } from '../api/agent.api';
import { useAgent } from '../context/AgentContext';
import { Plus, Sparkles, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Segments() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { openPanel, sendToAgent } = useAgent();

  // Modal UI States
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'ai'
  const [editingSegment, setEditingSegment] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState({ logic: 'AND', conditions: [] });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch Segments list
  const { data: segmentsData, isLoading } = useQuery({
    queryKey: ['segments'],
    queryFn: getSegments
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createSegment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      queryClient.refetchQueries({ queryKey: ['segments'] });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['segments'] });
        queryClient.refetchQueries({ queryKey: ['segments'] });
      }, 500);
      toast.success('Audience segment created successfully');
      handleClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to create segment');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSegment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      queryClient.refetchQueries({ queryKey: ['segments'] });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['segments'] });
        queryClient.refetchQueries({ queryKey: ['segments'] });
      }, 500);
      toast.success('Audience segment updated successfully');
      handleClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update segment');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSegment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      queryClient.refetchQueries({ queryKey: ['segments'] });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['segments'] });
        queryClient.refetchQueries({ queryKey: ['segments'] });
      }, 500);
      toast.success('Segment deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to delete segment');
    }
  });

  const refreshMutation = useMutation({
    mutationFn: refreshSegment,
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      queryClient.refetchQueries({ queryKey: ['segments'] });
      toast.success(`Refreshed! Audience size is now ${res.data.audienceCount}`);
    },
    onError: (err) => {
      toast.error('Refresh failed');
    }
  });

  const handleOpenCreate = () => {
    setEditingSegment(null);
    setName('');
    setDescription('');
    setRules({ logic: 'AND', conditions: [{ field: 'totalSpend', operator: 'gte', value: 5000 }] });
    setAiPrompt('');
    setActiveTab('manual');
    setIsOpen(true);
  };

  const handleOpenEdit = (seg) => {
    setEditingSegment(seg);
    setName(seg.name);
    setDescription(seg.description);
    setRules(seg.rules);
    setAiPrompt('');
    setActiveTab('manual');
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingSegment(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Segment name is required');
      return;
    }
    if (rules.conditions.length === 0) {
      toast.error('At least one filter condition is required');
      return;
    }

    const payload = {
      name,
      description,
      rules,
      createdBy: editingSegment ? editingSegment.createdBy : 'manual'
    };

    if (editingSegment) {
      updateMutation.mutate({ id: editingSegment._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Generate rules with Gemini AI
  const handleGenerateRules = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please describe the audience first');
      return;
    }

    setAiLoading(true);
    try {
      const res = await sendMessage(
        `Generate only segment rules to target: ${aiPrompt}`,
        {
          intent: aiPrompt,
          segmentPlan: null,
          messagePlan: null,
          channelPlan: null,
          approvals: { segment: false, message: false, channel: false },
          currentStep: 'PROPOSE_SEGMENT'
        }
      );

      if (res.success && res.data.agentContext.segmentPlan) {
        setRules(res.data.agentContext.segmentPlan);
        setActiveTab('manual'); // switch back to rules builder tab to preview/edit
        toast.success('AI successfully generated filter rules!');
      } else {
        toast.error('AI failed to generate matching rules. Try re-phrasing.');
      }
    } catch (err) {
      toast.error(err.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleUseInCampaign = (segment) => {
    navigate('/campaigns', { state: { segmentId: segment._id, segmentName: segment.name } });
  };

  const handleOpenAIChat = () => {
    openPanel();
    sendToAgent('Help me build a segment of shoppers');
  };

  const segmentsList = segmentsData?.data || [];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* Header buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-card p-4 border border-border rounded-xl">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Target Audience Segments</h4>
          <p className="text-xs text-text-secondary mt-1">Manage target cohorts and run rules resolution.</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenAIChat}
            className="border border-primary/20 text-primary-light hover:bg-primary/5"
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            <span>Ask AI to build</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>New Segment</span>
          </Button>
        </div>
      </div>

      {/* Segments grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, idx) => <SkeletonCard key={idx} />)}
        </div>
      ) : segmentsList.length === 0 ? (
        <div className="glass-card p-12 text-center text-xs text-text-secondary flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="h-8 w-8 text-text-muted" />
          <span>No audience segments found. Create your first segment using the manual builder or AI panel!</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segmentsList.map((segment) => (
            <SegmentCard
              key={segment._id}
              segment={segment}
              onUseCampaign={handleUseInCampaign}
              onEdit={handleOpenEdit}
              onRefresh={(id) => refreshMutation.mutate(id)}
              onDelete={(id) => {
                if (window.confirm('Are you sure you want to delete this segment?')) {
                  deleteMutation.mutate(id);
                }
              }}
              isRefreshing={refreshMutation.isPending && refreshMutation.variables === segment._id}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Segment Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={editingSegment ? 'Edit Audience Segment' : 'Create Audience Segment'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tabs */}
          {!editingSegment && (
            <div className="flex border-b border-border text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`pb-2 px-4 font-semibold transition-all ${
                  activeTab === 'manual'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Manual Segment Builder
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={`pb-2 px-4 font-semibold transition-all flex items-center space-x-1 ${
                  activeTab === 'ai'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Prompt Builder</span>
              </button>
            </div>
          )}

          {/* TAB 1: Manual Builder */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-muted">Segment Name</label>
                  <input
                    type="text"
                    placeholder="e.g. VIP High Spenders"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field py-2 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-muted">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Spent over ₹10k and ordered 5 times"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field py-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-text-muted">Targeting Filters</label>
                <RuleBuilder rules={rules} onChange={setRules} />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border/60">
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="primary" loading={createMutation.isPending || updateMutation.isPending}>
                  {editingSegment ? 'Save Changes' : 'Create Segment'}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: AI Prompt builder */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary">
                  Describe the audience cohort you want to group:
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Shoppers who reside in Bangalore or Hyderabad, spent at least ₹15,000, and purchased in the last 30 days."
                  className="w-full h-32 bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl p-3 text-xs text-text-primary focus:outline-none resize-none"
                />
              </div>

              {/* Sample suggestion chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-text-muted">Example prompts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'VIP loyalists with over 10 orders',
                    'Shoppers at risk of churn (inactive 60+ days)',
                    'New customers registered in Mumbai this week'
                  ].map((chip, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => setAiPrompt(chip)}
                      className="text-[10px] text-text-secondary bg-surface-elevated/40 border border-border hover:border-primary/20 px-2 py-1 rounded hover:text-primary-light transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border/60">
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleGenerateRules}
                  loading={aiLoading}
                  className="bg-primary hover:bg-primary-dark text-white border-0"
                >
                  <Sparkles className="h-4.5 w-4.5 mr-1" />
                  <span>Generate Rules</span>
                </Button>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
