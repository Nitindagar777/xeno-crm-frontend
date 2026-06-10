import React from 'react';

export default function CampaignStatsBar({ stats }) {
  const {
    total = 0,
    queued = 0,
    sent = 0,
    delivered = 0,
    failed = 0,
    opened = 0,
    clicked = 0,
    converted = 0
  } = stats;

  if (total === 0) {
    return <div className="h-2 w-full bg-surface-elevated rounded-full" />;
  }


  // Calculate remaining sent (sent but not delivered or failed yet)
  const activeSent = Math.max(0, sent - delivered - failed);

  // Calculate proportional widths based on the sum of all displayed metrics
  // This ensures that if Click=2, Open=2, Deliv=4, all 3 colors are visibly represented
  const displayTotal = clicked + opened + delivered + converted + failed + activeSent + queued;

  if (displayTotal === 0) {
    return <div className="h-2 w-full bg-surface-elevated rounded-full" />;
  }

  const clickedPct = (clicked / displayTotal) * 100;
  const openedPct = (opened / displayTotal) * 100;
  const deliveredPct = (delivered / displayTotal) * 100;
  const convertedPct = (converted / displayTotal) * 100;
  const sentPct = (activeSent / displayTotal) * 100;
  const failedPct = (failed / displayTotal) * 100;
  const queuedPct = (queued / displayTotal) * 100;

  return (
    <div className="space-y-2">
      {/* Visual stacked bar */}
      <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden flex">
        {/* Clicked (Purple) */}
        {clickedPct > 0 && (
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${clickedPct}%`, backgroundColor: '#8B5CF6' }}
            title={`Clicked: ${clicked}`}
          />
        )}
        
        {/* Opened (Blue) */}
        {openedPct > 0 && (
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${openedPct}%`, backgroundColor: '#3B82F6' }}
            title={`Opened: ${opened}`}
          />
        )}

        {/* Delivered (Green) */}
        {deliveredPct > 0 && (
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${deliveredPct}%`, backgroundColor: '#10B981' }}
            title={`Delivered: ${delivered}`}
          />
        )}

        {/* Sent (Amber) */}
        {sentPct > 0 && (
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${sentPct}%`, backgroundColor: '#F59E0B' }}
            title={`Sent: ${activeSent}`}
          />
        )}

        {/* Converted (Cyan) */}
        {convertedPct > 0 && (
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${convertedPct}%`, backgroundColor: '#06B6D4' }}
            title={`Converted: ${converted}`}
          />
        )}

        {/* Failed (Red) */}
        {failedPct > 0 && (
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${failedPct}%`, backgroundColor: '#EF4444' }}
            title={`Failed: ${failed}`}
          />
        )}

        {/* Queued (Muted Grey) */}
        {queuedPct > 0 && (
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${queuedPct}%`, backgroundColor: '#71717A' }}
            title={`Queued: ${queued}`}
          />
        )}
      </div>

      {/* Legend labels */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-text-muted font-semibold uppercase tracking-wider justify-between">
        <div className="flex items-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#8B5CF6' }} />
          <span>Click ({clicked})</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
          <span>Open ({opened})</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#10B981' }} />
          <span>Deliv ({delivered})</span>
        </div>
        {converted > 0 && (
          <div className="flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#06B6D4' }} />
            <span>Conv ({converted})</span>
          </div>
        )}
        {failed > 0 && (
          <div className="flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#EF4444' }} />
            <span>Fail ({failed})</span>
          </div>
        )}
      </div>
    </div>
  );
}
