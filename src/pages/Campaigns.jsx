import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCampaigns, createCampaign, sendCampaign } from '../api/campaign.api';
import { getSegments } from '../api/segment.api';
import CampaignCard from '../components/campaigns/CampaignCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useAgent } from '../context/AgentContext';
import { Plus, Sparkles, AlertCircle, MessageSquare, Mail, Smartphone, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Campaigns() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { openPanel, sendToAgent } = useAgent();

  // Modal UI States
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 = Info, 2 = Template, 3 = Channel, 4 = Review

  // Filter tab state
  const [statusFilter, setStatusFilter] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [selectedSegmentId, setSelectedSegmentId] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [scheduledAt, setScheduledAt] = useState('');
  const [sendNow, setSendNow] = useState(true);

  // Fetch Campaigns
  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['campaigns', statusFilter],
    queryFn: () => getCampaigns(statusFilter ? { status: statusFilter } : {}),
    refetchInterval: (query) => {
      const list = query?.state?.data?.data || [];
      return list.some(c => c.status === 'running' || c.status === 'scheduled') ? 5000 : false;
    },
    refetchIntervalInBackground: true
  });

  // Fetch Segments (for create campaign dropdown selector)
  const { data: segmentsData } = useQuery({
    queryKey: ['segments'],
    queryFn: getSegments,
    enabled: isOpen
  });

  // Prefill segment if redirected from Segments page
  useEffect(() => {
    if (location.state?.segmentId) {
      setSelectedSegmentId(location.state.segmentId);
      setName(location.state.segmentName || `Campaign: ${new Date().toLocaleDateString('en-IN')}`);
      setStep(1);
      setIsOpen(true);
    }
  }, [location]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      
      // Auto launch or schedule campaign
      const data = !sendNow && scheduledAt ? { scheduledAt } : {};
      launchMutation.mutate({ id: res.data._id, data });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to create campaign');
    }
  });

  const launchMutation = useMutation({
    mutationFn: ({ id, data }) => sendCampaign(id, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      if (variables.data?.scheduledAt) {
        toast.success('Campaign scheduled successfully! 📅');
      } else {
        toast.success('Campaign launched successfully! 🚀');
      }
      handleClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to send campaign');
    }
  });

  const handleClose = () => {
    setIsOpen(false);
    setStep(1);
    setName('');
    setSelectedSegmentId('');
    setMessageTemplate('');
    setChannel('whatsapp');
    setScheduledAt('');
    setSendNow(true);
  };

  const handleNext = () => {
    if (step === 1 && (!name || !selectedSegmentId)) {
      toast.error('Campaign Name and Segment are required');
      return;
    }
    if (step === 2 && !messageTemplate) {
      toast.error('Message template cannot be empty');
      return;
    }
    setStep(s => s + 1);
  };

  const handlePrev = () => {
    setStep(s => s - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      segmentId: selectedSegmentId,
      messageTemplate,
      channel,
      ...(!sendNow && scheduledAt ? { scheduledAt } : {})
    });
  };

  const insertVariable = (variable) => {
    setMessageTemplate(prev => prev + ` {{${variable}}}`);
  };

  const handleOpenAIChat = () => {
    openPanel();
    sendToAgent('Help me launch a campaign');
  };

  const campaignsList = campaignsData?.data || [];
  const segmentsList = segmentsData?.data || [];
  const selectedSegment = segmentsList.find(s => s._id === selectedSegmentId);

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-card p-4 border border-border rounded-xl">
        {/* Status filter tabs */}
        <div className="flex space-x-1.5 bg-surface p-1 rounded-xl border border-border flex-wrap">
          {[
            { value: '', label: 'All' },
            { value: 'running', label: 'Running' },
            { value: 'completed', label: 'Completed' },
            { value: 'draft', label: 'Draft' },
            { value: 'failed', label: 'Failed' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === tab.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
            onClick={() => {
              setName(`Campaign: ${new Date().toLocaleDateString('en-IN')}`);
              setIsOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>New Campaign</span>
          </Button>
        </div>
      </div>

      {/* Campaigns grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, idx) => <SkeletonCard key={idx} />)}
        </div>
      ) : campaignsList.length === 0 ? (
        <div className="glass-card p-12 text-center text-xs text-text-secondary flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="h-8 w-8 text-text-muted" />
          <span>No campaigns found matching your query. Create one now or ask the AI agent!</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaignsList.map((campaign) => (
            <CampaignCard key={campaign._id} campaign={campaign} />
          ))}
        </div>
      )}

      {/* 4-Step Campaign Builder Wizard Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={`New Campaign Wizard (Step ${step} of 4)`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Progress dots bar */}
          <div className="flex justify-between items-center px-4 bg-surface p-3 border border-border rounded-xl">
            {['General Info', 'Write Template', 'Choose Channel', 'Launch'].map((stepLabel, idx) => (
              <div key={idx} className="flex items-center space-x-1.5 text-[10px] uppercase font-bold tracking-wider">
                <span className={`h-5 w-5 rounded-full flex items-center justify-center border font-bold text-[9px] ${
                  step > idx + 1
                    ? 'bg-success border-success text-white'
                    : step === idx + 1
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 animate-pulse'
                      : 'border-border text-text-muted bg-surface-elevated/40'
                }`}>
                  {idx + 1}
                </span>
                <span className={step === idx + 1 ? 'text-primary-light' : 'text-text-muted'}>
                  {stepLabel}
                </span>
              </div>
            ))}
          </div>

          {/* STEP 1: General Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-text-muted">Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. Monsoon Serum Promotion"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-text-muted">Target Audience Segment</label>
                <select
                  value={selectedSegmentId}
                  onChange={(e) => setSelectedSegmentId(e.target.value)}
                  className="bg-surface-elevated border border-border rounded-lg text-xs p-2.5 text-text-primary focus:outline-none focus:border-primary w-full"
                >
                  <option value="">Select Segment...</option>
                  {segmentsList.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.audienceCount} shoppers)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border/60">
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" onClick={handleNext}>Next: Template</Button>
              </div>
            </div>
          )}

          {/* STEP 2: Write Template */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary">Message Template Structure</label>
                <textarea
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="Hi {{firstName}}, we miss you! You have ordered {{orderCount}} times with us, enjoy this 20% coupon code: MISSYOU20"
                  className="w-full h-32 bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl p-3 text-xs text-text-primary focus:outline-none resize-none font-mono"
                />
              </div>

              {/* Variable Injection Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-text-muted">Inject Customer variables:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['name', 'firstName', 'city', 'totalSpend', 'orderCount', 'avgOrderValue', 'lastOrderDate'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="text-[10px] text-primary-light bg-primary/10 border border-primary/20 hover:bg-primary hover:text-white px-2.5 py-1 rounded transition-all"
                    >
                      {`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-border/60">
                <Button variant="secondary" onClick={handlePrev}>Back</Button>
                <Button variant="primary" onClick={handleNext}>Next: Channel</Button>
              </div>
            </div>
          )}

          {/* STEP 3: Choose Channel */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-text-secondary block">Select Delivery Channel</label>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'border-success/20 hover:border-success text-success bg-success/5' },
                  { value: 'sms', label: 'SMS Carrier', icon: Smartphone, color: 'border-info/20 hover:border-info text-info bg-info/5' },
                  { value: 'email', label: 'Email SMTP', icon: Mail, color: 'border-primary/20 hover:border-primary text-primary-light bg-primary/5' },
                  { value: 'rcs', label: 'RCS Messaging', icon: Send, color: 'border-warning/20 hover:border-warning text-warning bg-warning/5' }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = channel === item.value;
                  return (
                    <div
                      key={item.value}
                      onClick={() => setChannel(item.value)}
                      className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5' 
                          : 'border-border bg-surface-card hover:bg-surface-elevated/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg border ${item.color}`}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-xs font-bold text-text-primary">{item.label}</span>
                      </div>
                      
                      {isSelected && (
                        <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-white">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-3 border-t border-border/60">
                <Button variant="secondary" onClick={handlePrev}>Back</Button>
                <Button variant="primary" onClick={handleNext}>Next: Review</Button>
              </div>
            </div>
          )}

          {/* STEP 4: Review Launch */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="space-y-3 bg-surface-elevated/30 p-4 border border-border/60 rounded-xl text-xs">
                <div className="flex justify-between border-b border-border/40 pb-2.5">
                  <span className="text-text-secondary">Campaign Name:</span>
                  <strong className="text-text-primary">{name}</strong>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2.5">
                  <span className="text-text-secondary">Target Segment:</span>
                  <strong className="text-text-primary">{selectedSegment?.name || 'Seeded Segment'}</strong>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2.5">
                  <span className="text-text-secondary">Audience Size:</span>
                  <strong className="text-text-primary">{selectedSegment?.audienceCount || 0} customers</strong>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2.5">
                  <span className="text-text-secondary">Delivery Channel:</span>
                  <strong className="text-text-primary uppercase">{channel}</strong>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-text-secondary">Template Text:</span>
                  <p className="bg-surface p-3 border border-border rounded-lg text-xs italic font-mono text-text-secondary">
                    "{messageTemplate}"
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-border/40 pt-4">
                <label className="text-xs font-semibold text-text-secondary">Delivery Schedule</label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSendNow(true)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                      sendNow ? 'bg-primary text-surface border-primary' : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Send Now
                  </button>
                  <button
                    onClick={() => setSendNow(false)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                      !sendNow ? 'bg-primary text-surface border-primary' : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Schedule for Later
                  </button>
                </div>
                {!sendNow && (
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary"
                  />
                )}
              </div>

              <div className="flex justify-between pt-3 border-t border-border/60">
                <Button variant="secondary" onClick={handlePrev}>Back</Button>
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  loading={createMutation.isPending || launchMutation.isPending}
                  className="bg-success hover:bg-success/90 text-white border-0"
                >
                  {sendNow ? 'Confirm & Launch Campaign 🚀' : 'Schedule Campaign 📅'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
