import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Building2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  LandPlot
} from 'lucide-react';
import clsx from 'clsx';

export default function ApplicabilitySummary({ eligibility, onOpenQuestionnaire }) {
  const [activeTab, setActiveTab] = useState('applicable'); // 'applicable' | 'exempt' | 'uncertain'
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!eligibility) return null;

  const applicable = eligibility.applicable || [];
  const exempt = eligibility.exempt || [];
  const uncertain = eligibility.uncertain || [];

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-3 bg-[#FAFAFA] border-b border-[#E5E5E5] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#F56600]" />
          <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
            Plot Clearance Applicability
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {onOpenQuestionnaire && (
            <button
              type="button"
              onClick={onOpenQuestionnaire}
              className="text-[10px] font-semibold text-[#F56600] hover:text-[#E85D00] hover:underline cursor-pointer"
            >
              Edit Plot Parameters
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-[#888888] hover:text-[#111111] rounded transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-3">
          {/* Quick Plot Metrics Banner */}
          <div className="flex flex-wrap items-center gap-3 p-2 mb-3 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-[11px] text-[#111111]">
            <div>
              <span className="text-[#666666]">Type: </span>
              <strong className="text-[#F56600] uppercase">{eligibility.constructionType || 'RESIDENTIAL'}</strong>
            </div>
            <div>
              <span className="text-[#666666]">Authority: </span>
              <strong className="text-[#111111]">{eligibility.jurisdiction || 'Maharashtra'}</strong>
            </div>
            <div>
              <span className="text-[#666666]">Height: </span>
              <strong className="text-[#111111]">{eligibility.buildingHeight || 8.5}m</strong>
            </div>
            <div>
              <span className="text-[#666666]">Area: </span>
              <strong className="text-[#111111]">{eligibility.plotArea || 200} sq.m</strong>
            </div>
            <div>
              <span className="text-[#666666]">Road: </span>
              <strong className="text-[#111111]">{eligibility.roadWidth || 9}m</strong>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-[#E5E5E5] mb-3 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('applicable')}
              className={clsx(
                'flex-1 py-1.5 px-2 font-semibold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                activeTab === 'applicable'
                  ? 'border-[#2BB673] text-[#2BB673] bg-[#E6F8EF]'
                  : 'border-transparent text-[#666666] hover:text-[#111111]'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Applies ({applicable.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exempt')}
              className={clsx(
                'flex-1 py-1.5 px-2 font-semibold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                activeTab === 'exempt'
                  ? 'border-[#888888] text-[#111111] bg-[#FAFAFA]'
                  : 'border-transparent text-[#666666] hover:text-[#111111]'
              )}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Exempt ({exempt.length})</span>
            </button>

            {uncertain.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('uncertain')}
                className={clsx(
                  'flex-1 py-1.5 px-2 font-semibold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                  activeTab === 'uncertain'
                    ? 'border-[#F59E0B] text-[#F59E0B] bg-[#FEF3C7]'
                    : 'border-transparent text-[#666666] hover:text-[#111111]'
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Verify ({uncertain.length})</span>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
            {activeTab === 'applicable' && (
              <>
                {applicable.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-[#E6F8EF] border border-[#2BB673]/30"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-[#2BB673] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2BB673] shrink-0" />
                        {item.name}
                      </span>
                      {item.statutoryRef && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FFFFFF] text-[#2BB673] border border-[#2BB673]/30 shrink-0">
                          {item.statutoryRef}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#666666] pl-5">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'exempt' && (
              <>
                {exempt.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-[#888888]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-[#666666] line-through flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                        {item.name}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FFFFFF] text-[#888888] border border-[#E5E5E5] shrink-0">
                        EXEMPT
                      </span>
                    </div>
                    <p className="text-[11px] text-[#888888] pl-5">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'uncertain' && (
              <>
                {uncertain.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#111111]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-[#F59E0B] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                        {item.name}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FFFFFF] text-[#F59E0B] border border-[#F59E0B]/30 shrink-0">
                        VERIFY
                      </span>
                    </div>
                    <p className="text-[11px] text-[#666666] pl-5">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
