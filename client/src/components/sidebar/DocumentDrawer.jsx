import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Search,
  Printer,
  ExternalLink,
  Clock,
  IndianRupee,
  AlertTriangle,
  CheckSquare,
  Square,
  Activity,
  Building,
  Scale,
  Sparkles,
  Info,
  CheckCircle2,
  CircleDashed,
  Lock,
  Check,
  RotateCcw,
  PanelRightClose,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { API_ENDPOINTS } from '../../config/api';
import ApplicabilitySummary from '../common/ApplicabilitySummary';

export default function DocumentDrawer({
  graphData,
  selectedNode,
  onSelectNode,
  completedNodes = new Set(),
  onToggleComplete,
  onClose,
  onOpenQuestionnaire,
  className
}) {
  const [activeTab, setActiveTab] = useState('kit'); // 'kit' | 'inspector' | 'applicability'
  const [docSearch, setDocSearch] = useState('');
  const [checkedDocs, setCheckedDocs] = useState({});
  const [linkStatus, setLinkStatus] = useState(null);

  // Switch to inspector tab automatically when a node is clicked
  useEffect(() => {
    if (selectedNode) {
      setActiveTab('inspector');
      setLinkStatus(null);
    }
  }, [selectedNode]);

  // Aggregate all unique forms across the DAG
  const masterDocList = useMemo(() => {
    if (!graphData || !graphData.nodes) return [];

    const docMap = new Map();
    graphData.nodes.forEach((node) => {
      if (Array.isArray(node.forms)) {
        node.forms.forEach((formName) => {
          const trimmed = formName.trim();
          if (!docMap.has(trimmed)) {
            docMap.set(trimmed, {
              name: trimmed,
              steps: [
                {
                  id: node.id,
                  title: node.title,
                  stage: node.stage,
                  department: node.department
                }
              ]
            });
          } else {
            docMap.get(trimmed).steps.push({
              id: node.id,
              title: node.title,
              stage: node.stage,
              department: node.department
            });
          }
        });
      }
    });

    return Array.from(docMap.values());
  }, [graphData]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    if (!docSearch.trim()) return masterDocList;
    return masterDocList.filter((d) =>
      d.name.toLowerCase().includes(docSearch.toLowerCase())
    );
  }, [masterDocList, docSearch]);

  const toggleDoc = (docName) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [docName]: !prev[docName]
    }));
  };

  const checkedCount = useMemo(() => {
    return Object.values(checkedDocs).filter(Boolean).length;
  }, [checkedDocs]);

  const metrics = useMemo(() => {
    const totalDays =
      graphData?.totalEstimatedDays ||
      graphData?.nodes?.reduce((acc, n) => acc + (n.estimatedDays || 0), 0) ||
      0;
    const totalCost =
      graphData?.totalEstimatedCostINR ||
      graphData?.nodes?.reduce((acc, n) => acc + (n.cost || 0), 0) ||
      0;
    const totalDocs = masterDocList.length;
    const bottlenecks =
      graphData?.nodes?.filter((n) => n.isBottleneck)?.length || 0;

    return { totalDays, totalCost, totalDocs, bottlenecks };
  }, [graphData, masterDocList]);

  // Government portal reachability checker (Protected against SSRF)
  const handleCheckLink = async (url) => {
    if (!url) return;
    setLinkStatus({ loading: true });
    try {
      const response = await axios.get(
        API_ENDPOINTS.linkStatus(url),
        { timeout: 4000 }
      );
      setLinkStatus({
        loading: false,
        reachable: response.data?.reachable,
        status: response.data?.status
      });
    } catch (err) {
      setLinkStatus({
        loading: false,
        reachable: false,
        status: err.response ? err.response.status : null,
        error: err.response?.data?.reason || err.message
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isStepCompleted = selectedNode ? completedNodes.has(selectedNode.id) : false;
  const isStepAvailable = useMemo(() => {
    if (!selectedNode || !graphData || !graphData.edges) return true;
    const parentEdges = graphData.edges.filter((e) => e.target === selectedNode.id);
    if (parentEdges.length === 0) return true;
    return parentEdges.every((e) => completedNodes.has(e.source));
  }, [selectedNode, graphData, completedNodes]);

  return (
    <aside
      className={clsx(
        'w-full h-full bg-[#FFFFFF] border-l border-[#E5E5E5] flex flex-col z-20 text-[#111111] shadow-2xl printable-drawer overflow-hidden',
        className
      )}
    >
      {/* Header Tabs with Minimize Button */}
      <div className="flex items-center border-b border-[#E5E5E5] bg-[#FAFAFA] p-2.5 gap-2 no-print shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('kit')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
            activeTab === 'kit'
              ? 'bg-[#F56600] text-white shadow-lg shadow-[#F56600]/30'
              : 'text-[#666666] hover:text-[#111111] hover:bg-[#FAFAFA]'
          )}
          title="Master Document Checklist & Metrics"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Dossier</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FAFAFA] text-[#F56600] font-mono border border-[#F56600]/30">
            {checkedCount}/{masterDocList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inspector')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
            activeTab === 'inspector'
              ? 'bg-[#F56600] text-white shadow-lg shadow-[#F56600]/30'
              : 'text-[#666666] hover:text-[#111111] hover:bg-[#FAFAFA]'
          )}
          title="Inspect selected workflow step"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Inspector</span>
          {selectedNode && (
            <span className="w-2 h-2 rounded-full bg-[#2BB673] animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('applicability')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
            activeTab === 'applicability'
              ? 'bg-[#F56600] text-white shadow-lg shadow-[#F56600]/30'
              : 'text-[#666666] hover:text-[#111111] hover:bg-[#FAFAFA]'
          )}
          title="NOCs that apply vs are exempt for this plot"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#2BB673]" />
          <span>Applicability</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#888888] hover:text-[#111111] hover:bg-[#FAFAFA] transition-colors border border-transparent hover:border-[#E5E5E5] shrink-0 cursor-pointer"
            title="Minimize/Close Right Sidebar"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab 3: Applicability Overview */}
      {activeTab === 'applicability' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <ApplicabilitySummary
            eligibility={graphData?.eligibility}
            onOpenQuestionnaire={onOpenQuestionnaire}
          />
        </div>
      )}

      {/* Tab 1: Master Document Kit */}
      {activeTab === 'kit' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Metrics Summary Banner */}
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F56600]">
                <Sparkles className="w-4 h-4" />
                Statutory Metrics
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#FFFFFF] hover:bg-[#FAFAFA] text-[#111111] rounded-lg transition-colors shadow-sm border border-[#E5E5E5]"
                title="Print official document kit"
              >
                <Printer className="w-3.5 h-3.5 text-[#F56600]" />
                Print Kit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#FFFFFF] rounded-xl p-3 border border-[#E5E5E5]">
                <div className="flex items-center gap-1.5 text-[#666666] text-[11px] mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#4A7DFF]" />
                  Total Duration
                </div>
                <div className="text-base font-bold text-[#111111]">
                  ~{metrics.totalDays} Days
                </div>
              </div>

              <div className="bg-[#FFFFFF] rounded-xl p-3 border border-[#E5E5E5]">
                <div className="flex items-center gap-1.5 text-[#666666] text-[11px] mb-1">
                  <IndianRupee className="w-3.5 h-3.5 text-[#2BB673]" />
                  Statutory Fees
                </div>
                <div className="text-base font-bold text-[#2BB673]">
                  ₹{Number(metrics.totalCost).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-[#FFFFFF] rounded-xl p-3 border border-[#E5E5E5]">
                <div className="flex items-center gap-1.5 text-[#666666] text-[11px] mb-1">
                  <FileText className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Total Forms
                </div>
                <div className="text-base font-bold text-[#111111]">
                  {metrics.totalDocs} Clearances
                </div>
              </div>

              <div className="bg-[#FFFFFF] rounded-xl p-3 border border-[#E5E5E5]">
                <div className="flex items-center gap-1.5 text-[#666666] text-[11px] mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#DC3545]" />
                  Bottlenecks
                </div>
                <div className="text-base font-bold text-[#DC3545]">
                  {metrics.bottlenecks} Critical
                </div>
              </div>
            </div>

            {/* Project / Construction Type Badge */}
            <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-[#FFFFFF] rounded-xl border border-[#E5E5E5]">
              <span className="text-[#666666]">Project Type:</span>
              <span className="font-bold text-[#F56600] uppercase">
                {graphData?.constructionType || graphData?.eligibility?.constructionType || 'RESIDENTIAL'}
              </span>
            </div>

            {/* Print Header (Only in print) */}
            <div className="hidden print:block text-[#111111] text-xs mt-2 border-t pt-2">
              <div className="font-bold text-sm">{graphData?.taskTitle}</div>
              <div>Project Type: {graphData?.constructionType || graphData?.eligibility?.constructionType || 'RESIDENTIAL'}</div>
              <div>Jurisdiction: {graphData?.jurisdiction}</div>
              <div>Legal Authority: {graphData?.legalReference}</div>
            </div>
          </div>

          {/* Search Documents in Dossier */}
          <div className="relative no-print">
            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              placeholder="Search required forms, NOCs, certificates..."
              className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl pl-9 pr-3 py-2 text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#F56600]"
            />
          </div>

          {/* Interactive Dossier Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#888888] flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[#F56600]" />
                Required Clearances ({filteredDocs.length})
              </h4>
              <span className="text-[11px] text-[#888888] no-print">
                {checkedCount} gathered
              </span>
            </div>

            <div className="space-y-2">
              {filteredDocs.map((doc, idx) => {
                const isChecked = Boolean(checkedDocs[doc.name]);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleDoc(doc.name)}
                    className={clsx(
                      'group flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                      isChecked
                        ? 'bg-[#E6F8EF] border-[#2BB673]/40 text-[#111111]'
                        : 'bg-[#FAFAFA] border-[#E5E5E5] hover:border-[#E5E5E5] hover:bg-[#FFFFFF] text-[#111111]'
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#2BB673]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#888888] group-hover:text-[#666666]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={clsx(
                          'text-xs font-semibold leading-snug',
                          isChecked && 'line-through text-[#888888]'
                        )}
                      >
                        {doc.name}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {doc.steps.map((st, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E5E5E5] text-[#666666]"
                          >
                            {st.stage.split(':')[0] || st.stage}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Step Inspector */}
      {activeTab === 'inspector' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selectedNode ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#666666] space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center text-[#F56600] shadow-xl">
                <Search className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#111111]">
                  Select a Step on the Map
                </h4>
                <p className="text-xs text-[#666666] mt-1.5 max-w-[260px] leading-relaxed">
                  Click any roadmap node to inspect official statutory forms, section rules, and portal links.
                </p>
              </div>
            </div>
          ) : (
            /* Detailed Step Inspector */
            <div className="space-y-4">
              {/* Header Card */}
              <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF1E8] text-[#F56600] border border-[#F56600]/30">
                    {selectedNode.stage}
                  </span>
                  {selectedNode.isBottleneck && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#F59E0B] border border-[#F59E0B]/30">
                      <AlertTriangle className="w-3 h-3" />
                      Bottleneck
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-[#111111] leading-snug">
                  {selectedNode.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-[#666666]">
                  <Building className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                  <span className="truncate">{selectedNode.department}</span>
                </div>

                {/* Time & Cost Badges */}
                <div className="flex items-center gap-3 pt-2 mt-2 border-t border-[#E5E5E5] text-xs">
                  <div className="flex items-center gap-1 text-[#666666]">
                    <Clock className="w-3.5 h-3.5 text-[#4A7DFF]" />
                    <span>Est. {selectedNode.estimatedDays} Days</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#2BB673] font-semibold">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>₹{Number(selectedNode.cost || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Step Completion Action Bar */}
              <div className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-2">
                  {isStepCompleted ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#2BB673] bg-[#E6F8EF] px-2.5 py-1 rounded-xl border border-[#2BB673]/40">
                      <CheckCircle2 className="w-4 h-4 text-[#2BB673]" />
                      Step Completed
                    </span>
                  ) : isStepAvailable ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#F56600] bg-[#FFF1E8] px-2.5 py-1 rounded-xl border border-[#F56600]/40">
                      <CircleDashed className="w-4 h-4 text-[#F56600] animate-spin-slow" />
                      Ready for Action
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[#888888] bg-[#FAFAFA] px-2.5 py-1 rounded-xl border border-[#E5E5E5]">
                      <Lock className="w-3.5 h-3.5 text-[#888888]" />
                      Prereq Locked
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!isStepCompleted && !isStepAvailable) return;
                    if (onToggleComplete) {
                      onToggleComplete(selectedNode.id, isStepCompleted ? 'available' : 'completed');
                    }
                  }}
                  disabled={!isStepCompleted && !isStepAvailable}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md',
                    isStepCompleted
                      ? 'bg-[#FAFAFA] hover:bg-[#E5E5E5] text-[#666666] border border-[#E5E5E5] cursor-pointer'
                      : isStepAvailable
                        ? 'bg-[#2BB673] hover:bg-[#2BB673]/90 text-white shadow-[#2BB673]/30 cursor-pointer active:scale-95'
                        : 'bg-[#FAFAFA] text-[#888888] border border-[#E5E5E5] cursor-not-allowed opacity-60'
                  )}
                  title={
                    isStepCompleted
                      ? 'Undo step completion'
                      : isStepAvailable
                        ? 'Mark this step completed and advance to next step'
                        : 'Prerequisites must be completed first'
                  }
                >
                  {isStepCompleted ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Undo Done</span>
                    </>
                  ) : isStepAvailable ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark as done →</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Prereq Locked</span>
                    </>
                  )}
                </button>
              </div>

              {/* Plain Language Summary */}
              {selectedNode.plainLanguageSummary && (
                <div className="p-4 rounded-2xl bg-[#FFF1E8] border border-[#F56600]/30 space-y-1.5 shadow-lg">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#F56600] uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 text-[#F56600]" />
                    Plain Language Explanation
                  </div>
                  <p className="text-xs text-[#111111] leading-relaxed">
                    {selectedNode.plainLanguageSummary}
                  </p>
                </div>
              )}

              {/* Statutory Legal Rule */}
              {selectedNode.statutoryRule && (
                <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-1.5 shadow-lg">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111] uppercase tracking-wider">
                    <Scale className="w-3.5 h-3.5 text-[#F56600]" />
                    Statutory Rule & Section
                  </div>
                  <p className="text-xs text-[#111111] font-mono italic bg-[#FFFFFF] p-2.5 rounded-xl border border-[#E5E5E5]">
                    {selectedNode.statutoryRule}
                  </p>
                </div>
              )}

              {/* Step Forms */}
              {Array.isArray(selectedNode.forms) && selectedNode.forms.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#888888] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#F56600]" />
                    Forms & Submissions Required
                  </h4>
                  <div className="space-y-1.5">
                    {selectedNode.forms.map((form, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] text-xs text-[#111111]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#F56600] mt-0.5 shrink-0" />
                        <span className="leading-snug">{form}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Portal & Link Status */}
              {selectedNode.officialUrl && (
                <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-3 shadow-xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#888888] block">
                    Official Government Portal
                  </span>

                  <a
                    href={selectedNode.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#F56600] hover:bg-[#E85D00] text-white transition-all shadow-lg shadow-[#F56600]/30 active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Official Portal
                  </a>

                  {/* Portal Status Checker */}
                  <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => handleCheckLink(selectedNode.officialUrl)}
                      disabled={linkStatus?.loading}
                      className="inline-flex items-center gap-1 text-[#888888] hover:text-[#111111] text-[11px] font-medium transition-colors"
                    >
                      <Activity
                        className={clsx('w-3.5 h-3.5', linkStatus?.loading && 'animate-spin text-[#F56600]')}
                      />
                      {linkStatus?.loading ? 'Probing portal...' : 'Test Server Connectivity'}
                    </button>

                    {linkStatus && !linkStatus.loading && (
                      <div>
                        {linkStatus.reachable ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2BB673] bg-[#E6F8EF] border border-[#2BB673]/40 px-2.5 py-0.5 rounded-full">
                            🟢 Online ({linkStatus.status || '200 OK'})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F59E0B] bg-[#FEF3C7] border border-[#F59E0B]/40 px-2.5 py-0.5 rounded-full">
                            ⚠️ Unreachable
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
