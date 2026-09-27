import React from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Clock,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Lock,
  Check,
  Building,
  Scale
} from 'lucide-react';
import clsx from 'clsx';

export default function CivicNode({ data, selected }) {
  const {
    id,
    title = 'Permit Step',
    stage = 'Stage 1',
    department = 'Municipal Authority',
    estimatedDays = 0,
    cost = 0,
    isBottleneck = false,
    statutoryRule = '',
    status = 'available', // 'locked' | 'available' | 'completed'
    orientation = 'TB', // 'TB' (top-to-bottom) | 'LR' (left-to-right)
    onStatusChange
  } = data;

  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';
  const isLocked = status === 'locked';

  const handleToggleStatus = (e) => {
    e.stopPropagation();
    if (!onStatusChange || isLocked) return;
    if (isCompleted) {
      onStatusChange(id, 'available');
    } else if (isAvailable) {
      onStatusChange(id, 'completed');
    }
  };

  const targetPosition = orientation === 'LR' ? Position.Left : Position.Top;
  const sourcePosition = orientation === 'LR' ? Position.Right : Position.Bottom;

  return (
    <div
      className={clsx(
        'group relative rounded-2xl border p-4 shadow-xl min-w-[300px] max-w-[320px] transition-all duration-300 text-left cursor-pointer font-sans select-none backdrop-blur-md',
        // Status border & background styling
        isCompleted &&
          'border-[#2BB673] bg-[#FFFFFF] text-[#111111] ring-1 ring-[#2BB673]/30 shadow-md hover:border-[#2BB673]',
        isAvailable &&
          'border-[#F56600] bg-[#FFFFFF] text-[#111111] ring-1 ring-[#F56600]/30 shadow-md hover:border-[#E85D00]',
        isLocked &&
          'border-[#E5E5E5] bg-[#FAFAFA] text-[#888888] opacity-75 hover:opacity-90 hover:border-[#E5E5E5]',
        selected &&
          'ring-2 ring-[#F56600] border-[#F56600] shadow-[0_0_20px_rgba(245,102,0,0.25)] scale-[1.02]'
      )}
    >
      {/* React Flow Target Handle */}
      <Handle
        type="target"
        position={targetPosition}
        className={clsx(
          '!w-3.5 !h-3.5 !border-2 !border-[#FFFFFF] transition-all duration-200',
          isCompleted && '!bg-[#2BB673] shadow-[0_0_8px_rgba(43,182,115,0.4)]',
          isAvailable && '!bg-[#F56600] shadow-[0_0_8px_rgba(245,102,0,0.4)]',
          isLocked && '!bg-[#888888]'
        )}
      />

      {/* Header: Stage Pill and Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={clsx(
            'text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full truncate border',
            isCompleted && 'bg-[#E6F8EF] text-[#2BB673] border-[#2BB673]/30',
            isAvailable && 'bg-[#FFF1E8] text-[#F56600] border-[#F56600]/30',
            isLocked && 'bg-[#FAFAFA] text-[#888888] border-[#E5E5E5]'
          )}
        >
          {stage}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {isCompleted && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#2BB673] bg-[#E6F8EF] px-2 py-0.5 rounded-full border border-[#2BB673]/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2BB673]" />
              Done
            </span>
          )}
          {isAvailable && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#F56600] bg-[#FFF1E8] px-2 py-0.5 rounded-full border border-[#F56600]/40">
              <CircleDashed className="w-3.5 h-3.5 text-[#F56600] animate-spin-slow" />
              Actionable
            </span>
          )}
          {isLocked && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-[#888888] bg-[#FAFAFA] px-2 py-0.5 rounded-full border border-[#E5E5E5]">
              <Lock className="w-3 h-3 text-[#888888]" />
              Prereq Locked
            </span>
          )}
        </div>
      </div>

      {/* Node Title */}
      <h3
        className={clsx(
          'font-bold text-sm leading-snug my-1 line-clamp-2',
          isCompleted && 'text-[#111111]',
          isAvailable && 'text-[#111111]',
          isLocked && 'text-[#888888]'
        )}
      >
        {title}
      </h3>

      {/* Department Badge */}
      <div className="my-2">
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-medium truncate max-w-full border',
            isCompleted && 'bg-[#FAFAFA] text-[#666666] border-[#E5E5E5]',
            isAvailable && 'bg-[#FAFAFA] text-[#111111] border-[#E5E5E5]',
            isLocked && 'bg-[#FAFAFA] text-[#888888] border-[#E5E5E5]'
          )}
        >
          <Building className="w-3 h-3 shrink-0 text-[#888888]" />
          <span className="truncate">{department}</span>
        </span>
      </div>

      {/* Statutory Rule Citation */}
      {statutoryRule && (
        <div className="flex items-center gap-1.5 text-[10px] text-[#888888] italic truncate mb-2 font-mono">
          <Scale className="w-3 h-3 text-[#F56600] shrink-0" />
          <span className="truncate">{statutoryRule}</span>
        </div>
      )}

      {/* Bottleneck Alert */}
      {isBottleneck && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded-lg bg-[#FEF3C7] border border-[#F59E0B]/40 text-[#F59E0B] text-[11px] font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
          <span className="truncate">Known Municipal Bottleneck</span>
        </div>
      )}

      {/* Metric Bar & Status Toggle Button */}
      <div className="pt-2.5 mt-2 border-t border-[#E5E5E5] flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              'flex items-center gap-1 font-medium',
              isCompleted ? 'text-[#2BB673]' : isAvailable ? 'text-[#666666]' : 'text-[#888888]'
            )}
            title="Estimated turnaround time"
          >
            <Clock className="w-3.5 h-3.5 text-[#4A7DFF]" />
            <span>{estimatedDays}d</span>
          </div>

          <div
            className={clsx(
              'flex items-center gap-0.5 font-medium',
              isCompleted ? 'text-[#2BB673]' : isAvailable ? 'text-[#2BB673]' : 'text-[#888888]'
            )}
            title="Estimated fee"
          >
            <IndianRupee className="w-3.5 h-3.5 text-[#2BB673]" />
            <span>{Number(cost).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Interactive Status Toggle Button */}
        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={isLocked}
          className={clsx(
            'inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all shadow-md',
            isCompleted
              ? 'bg-[#2BB673] hover:bg-[#2BB673]/90 text-white shadow-[#2BB673]/30 cursor-pointer active:scale-95'
              : isAvailable
              ? 'bg-[#F56600] hover:bg-[#E85D00] text-white shadow-[#F56600]/30 cursor-pointer active:scale-95'
              : 'bg-[#FAFAFA] text-[#888888] border border-[#E5E5E5] cursor-not-allowed opacity-60'
          )}
          title={
            isCompleted
              ? 'Undo step completion'
              : isAvailable
              ? 'Mark this step completed'
              : 'Prerequisites must be completed first'
          }
        >
          {isCompleted ? (
            <>
              <Check className="w-3 h-3" />
              <span>Done</span>
            </>
          ) : isAvailable ? (
            <>
              <Check className="w-3 h-3" />
              <span>Mark Done</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              <span>Locked</span>
            </>
          )}
        </button>
      </div>

      {/* React Flow Source Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        className={clsx(
          '!w-3.5 !h-3.5 !border-2 !border-[#FFFFFF] transition-all duration-200',
          isCompleted && '!bg-[#2BB673] shadow-[0_0_8px_rgba(43,182,115,0.4)]',
          isAvailable && '!bg-[#F56600] shadow-[0_0_8px_rgba(245,102,0,0.4)]',
          isLocked && '!bg-[#888888]'
        )}
      />
    </div>
  );
}
