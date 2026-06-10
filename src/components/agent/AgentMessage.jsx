import React, { useState } from 'react';
import { Bot, User, Sparkles } from 'lucide-react';
import AgentStepCard from './AgentStepCard';
import AgentApprovalCard from './AgentApprovalCard';
import { useAgent } from '../../context/AgentContext';

export default function AgentMessage({ message, isLast }) {
  const { role, content, type, structuredData, timestamp } = message;
  const { agentContext, approveAgentStep, rejectAgentStep } = useAgent();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState('');

  const isUser = role === 'user';

  // Format time stamp
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // Render markdown-like bold/lists for natural chat styling
  const renderMessageContent = (text) => {
    if (!text) return null;
    
    // Convert newlines to breaks, **bold** to tags, and list dashes to bullets
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      
      // Bold parsing **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        parts.push(line.substring(lastIndex, match.index));
        parts.push(<strong key={match.index} className="font-bold text-text-primary">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(line.substring(lastIndex));
      
      const lineContent = parts.length > 0 ? parts : content;

      if (line.trim().startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc mt-1 text-text-secondary">
            {line.trim().substring(2)}
          </li>
        );
      }
      
      return (
        <p key={idx} className={line.trim() === '' ? 'h-2' : 'mt-1'}>
          {lineContent}
        </p>
      );
    });
  };

  const handleStartEdit = () => {
    if (type === 'segment_proposal') {
      setEditVal(JSON.stringify(agentContext.segmentPlan, null, 2));
    } else if (type === 'message_proposal') {
      setEditVal(agentContext.messagePlan);
    } else if (type === 'channel_proposal') {
      setEditVal(agentContext.channelPlan);
    }
    setIsEditing(true);
  };

  const handleSaveEdit = (step) => {
    try {
      let finalData = editVal;
      if (step === 'segment') {
        finalData = JSON.parse(editVal);
      }
      approveAgentStep(step, finalData);
      setIsEditing(false);
    } catch (err) {
      alert(`Invalid format: ${err.message}`);
    }
  };

  return (
    <div className={`flex w-full mt-4 space-x-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border shadow-sm ${
        isUser
          ? 'bg-primary/10 border-primary/20 text-primary-light'
          : 'bg-surface-elevated border-border text-primary-light'
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
      </div>

      {/* Bubble */}
      <div className="flex flex-col space-y-1 min-w-0 flex-1">
        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-primary text-white rounded-tr-none'
            : 'bg-surface-elevated border border-border/60 text-text-secondary rounded-tl-none'
        }`}>
          {type === 'thinking' ? (
            <div className="flex items-center space-x-1 text-text-muted thinking-dots py-1">
              <span>●</span>
              <span>●</span>
              <span>●</span>
              <span className="text-xs ml-2 italic">Analyzing...</span>
            </div>
          ) : (
            <div className="space-y-2 whitespace-pre-wrap select-text">
              {renderMessageContent(content)}
            </div>
          )}

          {/* Inline proposals */}
          {type === 'segment_proposal' && structuredData?.segmentRules && (
            <AgentStepCard
              type="segment_proposal"
              data={agentContext.segmentPlan || structuredData.segmentRules}
              count={agentContext.resolvedAudienceCount}
              name={agentContext.segmentName || structuredData?.segmentName}
              description={agentContext.segmentDesc || structuredData?.segmentDesc}
            />
          )}

          {type === 'message_proposal' && structuredData?.messageTemplate && (
            <AgentStepCard
              type="message_proposal"
              data={agentContext.messagePlan || structuredData.messageTemplate}
            />
          )}

          {type === 'channel_proposal' && structuredData?.channel && (
            <AgentStepCard
              type="channel_proposal"
              data={agentContext.channelPlan || structuredData.channel}
            />
          )}

          {type === 'campaign_proposal' && (
            <AgentStepCard
              type="campaign_proposal"
              data={structuredData || {
                segmentRules: agentContext.segmentPlan,
                messageTemplate: agentContext.messagePlan,
                channel: agentContext.channelPlan,
                resolvedAudienceCount: agentContext.resolvedAudienceCount
              }}
              name={agentContext.campaignName || structuredData?.campaignName}
            />
          )}

          {/* Inline Edit Panel */}
          {isEditing && (
            <div className="flex flex-col space-y-2 mt-3 p-3 bg-surface border border-border rounded-xl">
              <span className="text-[10px] uppercase font-bold text-text-muted">
                Edit Proposal Content
              </span>
              <textarea
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                className="w-full h-32 bg-surface-elevated border border-border rounded-lg p-2 text-xs font-mono text-text-primary focus:outline-none focus:border-primary"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEdit(type.split('_')[0])}
                  className="px-3 py-1 text-xs bg-primary hover:bg-primary-dark text-white rounded-md font-medium"
                >
                  Save & Approve
                </button>
              </div>
            </div>
          )}

          {/* Decision actions for last agent message */}
          {isLast && !isEditing && (
            <>
              {type === 'segment_proposal' && !agentContext.approvals.segment && (
                <AgentApprovalCard
                  step="segment"
                  onApprove={approveAgentStep}
                  onEdit={handleStartEdit}
                  onReject={rejectAgentStep}
                />
              )}

              {type === 'message_proposal' && !agentContext.approvals.message && (
                <AgentApprovalCard
                  step="message"
                  onApprove={approveAgentStep}
                  onEdit={handleStartEdit}
                  onReject={rejectAgentStep}
                />
              )}

              {type === 'channel_proposal' && !agentContext.approvals.channel && (
                <AgentApprovalCard
                  step="channel"
                  onApprove={approveAgentStep}
                  onEdit={handleStartEdit}
                  onReject={rejectAgentStep}
                />
              )}

              {type === 'campaign_proposal' && !agentContext.campaignCreated && (
                <AgentApprovalCard
                  step="campaign"
                  onApprove={approveAgentStep}
                  onEdit={handleStartEdit}
                  onReject={rejectAgentStep}
                />
              )}
            </>
          )}
        </div>

        {/* Timestamp */}
        <span className={`text-[10px] text-text-muted ${isUser ? 'ml-auto' : 'mr-auto'}`}>
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
