import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  X,
  Scale,
  FileText,
  Sparkles,
  Loader2,
  HelpCircle,
  PlusCircle,
  Building,
  Layers,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { API_ENDPOINTS } from '../../config/api';

// Core Statutory Knowledge Base across domains
const STATIC_JARGON_DICTIONARY = [
  // 1. Land & Revenue Records
  {
    term: '7/12 Extract (सातबारा उतारा)',
    category: 'Land Title & Revenue',
    shortDef: 'Official Land Register Extract',
    explanation: 'A fundamental revenue document issued by the Land Records Department (Mahabhulekh) showing legal ownership, survey/gut numbers, crop history, and encumbrances/liens against rural or peri-urban land.',
    statutoryAct: 'Maharashtra Land Revenue Code (MLRC) 1966'
  },
  {
    term: 'CTS / Property Card (मालमत्ता पत्रक)',
    category: 'Urban Land Records',
    shortDef: 'City Title Survey Record',
    explanation: 'The urban equivalent of the 7/12 extract, maintained by City Survey Offices (CTSO) for properties within municipal corporation limits and urban gaothans.',
    statutoryAct: 'MLRC 1966 & CTSO Manual'
  },
  {
    term: 'Mojani (मोजणी / Kayam Mojani)',
    category: 'Survey & Demarcation',
    shortDef: 'Cadastral Boundary Measurement Sheet',
    explanation: 'An on-ground trigonometric survey conducted by the Taluka Inspector of Land Records (TILR). It officially fixes plot boundaries, street widening setbacks, and adjoining government reservations before blueprint sanction.',
    statutoryAct: 'UDCPR 2020, Reg 2.2.3(b)'
  },
  {
    term: 'NA Order (Non-Agricultural Sanction)',
    category: 'Land Conversion',
    shortDef: 'Agricultural to Residential Conversion',
    explanation: 'Order issued by District Collector/Tehsildar permitting agricultural land to be utilized for residential, commercial, or industrial construction.',
    statutoryAct: 'Section 42 & 44, MLRC 1966'
  },

  // 2. Building Permissions & UDCPR 2020
  {
    term: 'AutoDCR / PreDCR Scrutiny',
    category: 'Architectural Compliance',
    shortDef: 'State Automated CAD Blueprint Checker',
    explanation: 'State-mandated software (integrated into MahaBPAMS) that parses layered AutoCAD (.dwg) files submitted by licensed architects to algorithmically verify setback distances, FSI, ground coverage, parking, and staircase ventilation.',
    statutoryAct: 'UDCPR 2020, Reg 2.2.1'
  },
  {
    term: 'IOD (Intimation of Disapproval)',
    category: 'Conditional Approval',
    shortDef: 'Section 45 Conditional Sanction Notice',
    explanation: 'A conditional green signal. The municipal authority approves architectural drawings in principle, but forbids ground excavation until ~15 to 20 parallel departmental NOCs (tree, hydraulic, fire, structural) are submitted.',
    statutoryAct: 'MRTP Act 1966 & UDCPR Reg 2.5'
  },
  {
    term: 'CC (Commencement Certificate)',
    category: 'Permits & Construction',
    shortDef: 'Legal Groundbreaking Authorization',
    explanation: 'The definitive statutory permit (Appendix C under UDCPR 2020) issued by the Town Planning authority. It legally unlocks physical excavation and structural casting up to the plinth height level.',
    statutoryAct: 'UDCPR 2020, Reg 2.6'
  },
  {
    term: 'Plinth Checking (Regulation 2.8.4)',
    category: 'Inspections & Hold Points',
    shortDef: 'Mandatory Foundation Inspection Halt',
    explanation: 'A statutory halt where construction must pause when the foundation reaches plinth height. Municipal engineers inspect the physical site to verify that actual boundary offsets and road setbacks match the sanctioned blueprint before issuing Superstructure CC.',
    statutoryAct: 'UDCPR 2020, Reg 2.8.4'
  },
  {
    term: 'OC (Occupancy Certificate)',
    category: 'Habitation & Utilities',
    shortDef: 'Final Habitability Certification',
    explanation: 'Issued under UDCPR Regulation 2.10 upon building completion. It validates that construction strictly follows the sanctioned plan, unlocking legal permanent electricity meters, drinking water mains, and municipal tax assessment.',
    statutoryAct: 'UDCPR 2020, Reg 2.10'
  },
  {
    term: 'FSI / TDR (Floor Space Index / Transfer of Development Rights)',
    category: 'Zoning & Density',
    shortDef: 'Permissible Built-Up Area Ratio',
    explanation: 'Ratio of allowable gross floor area to the total plot area. TDR allows buying extra building potential generated from surrendered road widening or reserved public plots.',
    statutoryAct: 'UDCPR 2020, Chapter 6'
  },

  // 3. Commercial, Food & Labor (Cloud Kitchens / Shops)
  {
    term: 'Gumasta License (गुमास्ता परवाना)',
    category: 'Commercial Registration',
    shortDef: 'Shop & Establishment Registration',
    explanation: 'Mandatory certificate issued by the Municipal Health/Labor Department authorizing commercial operations, regulating working hours, employee welfare, and trade validity.',
    statutoryAct: 'Maharashtra Shops & Establishments Act, 2017'
  },
  {
    term: 'FSSAI State License / Registration',
    category: 'Food Safety & Hygiene',
    shortDef: 'Food Business Operator (FBO) Sanction',
    explanation: 'Statutory hygiene and food safety license required for all cloud kitchens, restaurants, and food handlers with turnover brackets.',
    statutoryAct: 'Food Safety & Standards Act, 2006'
  },
  {
    term: 'Trade License / Section 394 License',
    category: 'Municipal Trade Clearance',
    shortDef: 'Health & Sanitation Business Permit',
    explanation: 'Issued by Municipal Corporation Medical Officer of Health (MOH) ensuring the commercial trade is not hazardous or a public nuisance.',
    statutoryAct: 'Maharashtra Municipal Corporations (MMC) Act'
  },
  {
    term: 'Fire NOC / CFO Clearance',
    category: 'Safety & Hazard Control',
    shortDef: 'Chief Fire Officer Safety Certificate',
    explanation: 'Inspection and clearance validating that fire hydrants, smoke detectors, emergency egress stairs, and LPG gas bank installations comply with national building codes.',
    statutoryAct: 'Maharashtra Fire Prevention & Life Safety Act'
  },
  {
    term: 'RTS Act (Right to Public Services Act)',
    category: 'Statutory Governance',
    shortDef: 'Time-Bound Service Delivery Guarantee',
    explanation: 'State legislation guaranteeing statutory maximum timelines for municipal permissions (e.g. 30-60 days) with financial penalties on officers for unexcused administrative delays.',
    statutoryAct: 'Maharashtra RTS Act, 2015'
  }
];

export default function JargonBusterModal({ isOpen, onClose, graphData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'workflow' | 'ai'
  const [aiCustomTerms, setAiCustomTerms] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Dynamically extract terms from current active graph
  const workflowTerms = useMemo(() => {
    if (!graphData || !graphData.nodes) return [];
    const extracted = [];

    graphData.nodes.forEach((node) => {
      extracted.push({
        term: node.title,
        category: node.stage || 'Current Workflow Stage',
        shortDef: node.department || 'Statutory Milestone',
        explanation: node.plainLanguageSummary || `Required milestone for ${node.title} regulated under ${node.statutoryRule || 'municipal bylaws'}.`,
        statutoryAct: node.statutoryRule || graphData.legalReference
      });
    });

    return extracted;
  }, [graphData]);

  // Combined dictionary
  const allTerms = useMemo(() => {
    return [...aiCustomTerms, ...workflowTerms, ...STATIC_JARGON_DICTIONARY];
  }, [aiCustomTerms, workflowTerms]);

  // Filtered list
  const filteredTerms = useMemo(() => {
    let source = allTerms;
    if (activeTab === 'workflow') source = workflowTerms;
    if (activeTab === 'ai') source = aiCustomTerms;

    if (!searchTerm.trim()) return source;

    const lower = searchTerm.toLowerCase();
    return source.filter(
      (item) =>
        item.term.toLowerCase().includes(lower) ||
        item.explanation.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower) ||
        (item.shortDef && item.shortDef.toLowerCase().includes(lower))
    );
  }, [allTerms, workflowTerms, aiCustomTerms, activeTab, searchTerm]);

  // Dynamic AI Explainer via Backend Gemini 2.5
  const handleExplainWithAI = async () => {
    if (!searchTerm.trim()) return;
    setAiLoading(true);
    setAiError('');

    try {
      const response = await axios.post(
        API_ENDPOINTS.explainTerm,
        {
          term: searchTerm.trim(),
          context: `${graphData?.taskTitle || ''} (${graphData?.jurisdiction || ''})`
        },
        { timeout: 8000 }
      );

      if (response.data && response.data.term) {
        setAiCustomTerms((prev) => [
          {
            ...response.data,
            isAiGenerated: true
          },
          ...prev.filter((t) => t.term.toLowerCase() !== response.data.term.toLowerCase())
        ]);
        setActiveTab('all');
      }
    } catch (err) {
      setAiError('Unable to generate AI definition at this moment.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#111111]/40 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden font-sans text-[#111111]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] bg-[#FFFFFF] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1E8] border border-[#F56600]/30 flex items-center justify-center text-[#F56600] shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#111111] flex items-center gap-2">
                Civic Jargon Buster
                <span className="text-[10px] font-semibold text-[#F56600] bg-[#FFF1E8] px-2.5 py-0.5 rounded-full border border-[#F56600]/30 hidden sm:inline-block">
                  AI-Powered Lexicon
                </span>
              </h3>
              <p className="text-xs text-[#666666]">
                Demystifying statutory acronyms, Marathi revenue terms, and bylaws for any civic query.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#888888] hover:text-[#111111] hover:bg-[#FAFAFA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-4 border-b border-[#E5E5E5] bg-[#FAFAFA] space-y-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={clsx(
                'px-3 py-1.5 rounded-lg font-semibold transition-all',
                activeTab === 'all'
                  ? 'bg-[#F56600] text-white shadow-md shadow-[#F56600]/30'
                  : 'bg-[#FFFFFF] text-[#666666] hover:text-[#111111] border border-[#E5E5E5]'
              )}
            >
              All Statutory Terms ({allTerms.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('workflow')}
              className={clsx(
                'px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5',
                activeTab === 'workflow'
                  ? 'bg-[#F56600] text-white shadow-md shadow-[#F56600]/30'
                  : 'bg-[#FFFFFF] text-[#666666] hover:text-[#111111] border border-[#E5E5E5]'
              )}
            >
              <Layers className="w-3.5 h-3.5 text-[#F56600]" />
              Active Query Workflow ({workflowTerms.length})
            </button>

            {aiCustomTerms.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={clsx(
                  'px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5',
                  activeTab === 'ai'
                    ? 'bg-[#F56600] text-white shadow-md shadow-[#F56600]/30'
                    : 'bg-[#FFFFFF] text-[#666666] hover:text-[#111111] border border-[#E5E5E5]'
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2BB673]" />
                AI Generated ({aiCustomTerms.length})
              </button>
            )}
          </div>

          {/* Search Bar + Ask AI Action */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search any term (e.g., 7/12, IOD, FSSAI, Gumasta, TDR, Plinth, NA Order)..."
                className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#F56600] focus:border-transparent"
                autoFocus
              />
            </div>

            <button
              type="button"
              onClick={handleExplainWithAI}
              disabled={aiLoading || !searchTerm.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-[#F56600] to-[#E85D00] hover:from-[#E85D00] hover:to-[#F56600] text-white rounded-xl text-xs font-bold shadow-md shadow-[#F56600]/30 transition-all disabled:opacity-50 shrink-0"
              title="Use Gemini AI to deconstruct any new civic jargon not yet in the dictionary"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Explaining...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI to Explain</span>
                </>
              )}
            </button>
          </div>

          {aiError && (
            <p className="text-xs text-[#DC3545] font-medium">{aiError}</p>
          )}
        </div>

        {/* Jargon Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12 space-y-3 text-[#666666]">
              <HelpCircle className="w-10 h-10 mx-auto text-[#888888]" />
              <p className="text-sm font-semibold text-[#111111]">
                No built-in term found matching "{searchTerm}"
              </p>
              <p className="text-xs max-w-sm mx-auto text-[#666666]">
                Click <strong>"Ask AI to Explain"</strong> above and our Gemini engine will instantly deconstruct this statutory term for you.
              </p>
              <button
                type="button"
                onClick={handleExplainWithAI}
                disabled={aiLoading}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#F56600] hover:bg-[#E85D00] text-white text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Explain "{searchTerm}" with AI
              </button>
            </div>
          ) : (
            filteredTerms.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5] hover:border-[#E5E5E5] hover:bg-[#FFFFFF] transition-all space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF1E8] text-[#F56600] border border-[#F56600]/30">
                      {item.category}
                    </span>
                    {item.isAiGenerated && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E6F8EF] text-[#2BB673] border border-[#2BB673]/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI Explainer
                      </span>
                    )}
                  </div>
                  {item.shortDef && (
                    <span className="text-xs font-semibold text-[#888888]">
                      {item.shortDef}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-[#111111] flex items-center gap-2">
                  {item.term}
                </h4>

                <p className="text-xs text-[#666666] leading-relaxed">
                  {item.explanation}
                </p>

                {item.statutoryAct && (
                  <div className="pt-2 border-t border-[#E5E5E5] flex items-center gap-1.5 text-[11px] text-[#888888] font-mono italic">
                    <Scale className="w-3.5 h-3.5 text-[#F56600] shrink-0" />
                    <span className="truncate">Statute: {item.statutoryAct}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-[#E5E5E5] bg-[#FFFFFF] flex items-center justify-between text-xs text-[#666666]">
          <span>Covers UDCPR 2020, FSSAI, Shops Act, MRTP 1966 & Indian Municipal Bylaws.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#FAFAFA] hover:bg-[#E5E5E5] text-[#111111] font-semibold rounded-lg transition-colors border border-[#E5E5E5]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
