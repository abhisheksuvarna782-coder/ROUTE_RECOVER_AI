import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getRecovery, approveRecovery, rejectRecovery, regenerateRecovery
} from '@/services/api'
import {
  apiErrorMessage, fmtINR, fmtTime, fmtDate, fmtDuration, transportIcon,
  recoveryStatusClass, recoveryStatusLabel, scoreColor,
} from '@/utils'
import {
  Zap, CheckCircle, XCircle, RefreshCw, AlertTriangle,
  ChevronLeft, Clock, MapPin, Award, DollarSign,
  ChevronDown, ChevronUp, Info,
} from 'lucide-react'
import { useState } from 'react'
import type { AlternativeOption, RecoveryPlanDetail } from '@/types'

// ─── Processing stages ───────────────────────────────────────────────────────
function StageList({ stages }: { stages: { stage: number; name: string; status: string; detail: string }[] }) {
  return (
    <div className="space-y-2">
      {stages.map((s) => (
        <div key={s.stage} className="flex items-start gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold
            ${s.status === 'complete' ? 'bg-success-700/20 text-success-500 border border-success-700/40' :
              s.status === 'pending' ? 'bg-navy-600/20 text-navy-400 border border-navy-600/40' :
              'bg-danger-700/20 text-danger-500 border border-danger-700/40'}`}>
            {s.status === 'complete' ? '✓' : s.stage}
          </div>
          <div>
            <div className="text-sm font-medium text-surface-200">{s.name}</div>
            <div className="text-xs text-surface-500">{s.detail}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Alternative card ────────────────────────────────────────────────────────
function AlternativeCard({
  alt, isSelected, onSelect, isRecommended
}: {
  alt: AlternativeOption; isSelected: boolean; onSelect: () => void; isRecommended: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  const rankBadge = isRecommended
    ? <span className="badge badge-approved gap-1"><Award size={10} /> Best Overall</span>
    : alt.rank_label === 'lowest_cost'
    ? <span className="badge badge-processing gap-1"><DollarSign size={10} /> Lowest Cost</span>
    : alt.rank_label === 'fastest'
    ? <span className="badge badge-processing gap-1"><Zap size={10} /> Fastest</span>
    : null

  return (
    <div
      id={`alt-${alt.id}`}
      className={`card p-4 cursor-pointer transition-all ${
        isSelected ? 'border-navy-500 shadow-glow' : 'card-hover'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{transportIcon(alt.transport_type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-surface-100">{alt.service_name}</span>
            {rankBadge}
            {isSelected && <span className="badge badge-approved">Selected</span>}
          </div>
          <div className="text-xs text-surface-500">{alt.provider}</div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
            <div>
              <div className="text-surface-500 text-xs">Departs</div>
              <div className="text-surface-200 font-medium">{fmtTime(alt.departure_time)}</div>
            </div>
            <div>
              <div className="text-surface-500 text-xs">Arrives</div>
              <div className={`font-medium ${alt.meets_deadline ? 'text-surface-200' : 'text-danger-500'}`}>
                {fmtTime(alt.arrival_time)}
              </div>
            </div>
            <div>
              <div className="text-surface-500 text-xs">Duration</div>
              <div className="text-surface-200 font-medium">{fmtDuration(alt.duration_minutes)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div>
              <span className="text-surface-400 text-xs">Price: </span>
              <span className="text-surface-100 font-semibold">{fmtINR(alt.price_inr)}</span>
            </div>
            <div>
              <span className="text-surface-400 text-xs">Extra: </span>
              <span className={`font-semibold ${alt.additional_cost_inr > 0 ? 'text-warning-500' : 'text-success-500'}`}>
                {alt.additional_cost_inr >= 0 ? '+' : ''}{fmtINR(alt.additional_cost_inr)}
              </span>
            </div>
            <div>
              <span className="text-surface-400 text-xs">Score: </span>
              <span className={`font-bold ${scoreColor(alt.score)}`}>{(alt.score * 100).toFixed(0)}</span>
            </div>
          </div>
          {/* Score bar */}
          <div className="score-bar mt-2">
            <div className="score-fill" style={{ width: `${alt.score * 100}%` }} />
          </div>
          <div className="text-xs text-surface-500 mt-1">
            {alt.stops === 0 ? 'Direct' : `${alt.stops} stop${alt.stops > 1 ? 's' : ''}`} ·
            {alt.available_seats} seats · {alt.has_accessibility ? '♿ Accessible' : 'No accessibility'}
          </div>
        </div>
      </div>

      <button
        className="mt-3 text-xs text-surface-500 hover:text-surface-300 flex items-center gap-1"
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? 'Less' : 'More details'}
      </button>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-surface-700 text-xs text-surface-400 space-y-1">
          <p>{alt.explanation}</p>
          {alt.feasibility_issues.length > 0 && (
            <div className="text-warning-500">
              ⚠️ {alt.feasibility_issues.join('; ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main workspace ──────────────────────────────────────────────────────────
export default function RecoveryWorkspacePage() {
  const { recoveryId } = useParams<{ recoveryId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [selectedAltId, setSelectedAltId] = useState<string | null>(null)
  const [showRejected, setShowRejected] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'alternatives' | 'itinerary' | 'explanation'>('overview')

  const { data: plan, isLoading, error } = useQuery({
    queryKey: ['recovery', recoveryId],
    queryFn: () => getRecovery(recoveryId!),
    enabled: !!recoveryId,
    refetchInterval: (query) => query.state.data?.status === 'processing' || query.state.data?.status === 'pending' ? 3000 : false,
  })

  const approveMutation = useMutation({
    mutationFn: () => approveRecovery(recoveryId!, {
      selected_alternative_id: selectedAltId || plan?.alternatives[0]?.id,
      reason: 'Approved by traveller via dashboard',
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recovery', recoveryId] }),
  })

  const rejectMutation = useMutation({
    mutationFn: () => rejectRecovery(recoveryId!, 'Rejected by traveller — will seek alternative'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recovery', recoveryId] }),
  })

  const regenerateMutation = useMutation({
    mutationFn: () => regenerateRecovery(recoveryId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recovery', recoveryId] }),
  })

  if (isLoading) return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-64 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="skeleton h-64 rounded-xl" />
        <div className="lg:col-span-2 skeleton h-64 rounded-xl" />
      </div>
    </div>
  )

  if (error) return (
    <div className="card p-8 text-center" role="alert">
      <p className="text-danger-500">{apiErrorMessage(error, 'Could not load this recovery plan.')}</p>
    </div>
  )

  if (!plan) return (
    <div className="card p-8 text-center">
      <p className="text-surface-400">Recovery plan not found.</p>
    </div>
  )

  const isProcessing = plan.status === 'processing' || plan.status === 'pending'
  const canDecide = plan.status === 'proposed'
  const decided = plan.status === 'approved' || plan.status === 'rejected'

  const selectedAlt = selectedAltId
    ? plan.alternatives.find(a => a.id === selectedAltId)
    : plan.alternatives[0]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/recovery')} className="btn btn-ghost btn-sm gap-2">
          <ChevronLeft size={16} /> Recovery History
        </button>
        <span className="text-surface-700">/</span>
        <h1 className="text-xl font-bold text-surface-50 flex items-center gap-2">
          <Zap size={18} className="text-ocean-400" />
          AI Recovery Workspace
        </h1>
        <span className={recoveryStatusClass(plan.status)}>
          {recoveryStatusLabel(plan.status)}
        </span>
      </div>

      {/* Sim banner */}
      <div className="alert-simulated">
        <AlertTriangle size={12} />
        ⚠️ SIMULATED — All booking changes shown here are simulated. No real provider bookings have been modified.
        Approval only updates this application's demo records.
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="card p-6 flex items-center gap-4">
          <div className="w-8 h-8 border-2 border-ocean-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <div>
            <div className="font-medium text-surface-200">Running recovery engine…</div>
            <div className="text-sm text-surface-500">Evaluating alternatives against your constraints</div>
          </div>
        </div>
      )}

      {!isProcessing && (
        <>
          {/* Cost summary row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4 text-center">
              <div className="text-surface-500 text-xs mb-1">Original Cost</div>
              <div className="text-xl font-bold text-surface-200">{fmtINR(plan.original_cost_inr)}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-surface-500 text-xs mb-1">Recovery Cost</div>
              <div className="text-xl font-bold text-ocean-400">{fmtINR(plan.proposed_cost_inr)}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-surface-500 text-xs mb-1">Extra Cost</div>
              <div className={`text-xl font-bold ${plan.additional_cost_inr > 0 ? 'text-warning-500' : 'text-success-500'}`}>
                {plan.additional_cost_inr >= 0 ? '+' : ''}{fmtINR(plan.additional_cost_inr)}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {(['overview', 'alternatives', 'itinerary', 'explanation'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? 'tab tab-active' : 'tab tab-inactive'}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'alternatives' && plan.alternatives.length > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">({plan.alternatives.length})</span>
                )}
              </button>
            ))}
          </div>

          {/* ── TAB: Overview ── */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Processing stages */}
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-surface-300 mb-4">Recovery Progress</h2>
                {plan.processing_stages.length > 0 ? (
                  <StageList stages={plan.processing_stages} />
                ) : (
                  <p className="text-surface-500 text-sm">Stage data unavailable.</p>
                )}
              </div>

              {/* Affected bookings */}
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-surface-300 mb-4">Booking Impact</h2>
                {plan.affected_bookings.length === 0 && plan.potentially_affected_bookings.length === 0 ? (
                  <p className="text-surface-500 text-sm">No affected bookings identified.</p>
                ) : (
                  <div className="space-y-2">
                    {plan.affected_bookings.map(b => (
                      <div key={b.id} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-danger-700/10 border border-danger-700/20">
                        <div className="w-2 h-2 rounded-full bg-danger-500 flex-shrink-0" />
                        <span className="font-medium text-danger-400">Disrupted:</span>
                        <span className="text-surface-300">{b.provider} ({b.reference})</span>
                      </div>
                    ))}
                    {plan.potentially_affected_bookings.map(b => (
                      <div key={b.id} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-warning-700/10 border border-warning-700/20">
                        <div className="w-2 h-2 rounded-full bg-warning-500 flex-shrink-0" />
                        <span className="font-medium text-warning-400">At Risk:</span>
                        <span className="text-surface-300">{b.provider} ({b.reference})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Required actions */}
              {plan.required_actions.length > 0 && (
                <div className="lg:col-span-2 card p-5">
                  <h2 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
                    <CheckCircle size={14} className="text-ocean-400" />
                    Required Actions
                  </h2>
                  <ol className="space-y-2">
                    {plan.required_actions.map((action, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-navy-600/30 text-navy-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-surface-300">{action}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Alternatives ── */}
          {activeTab === 'alternatives' && (
            <div className="space-y-4">
              {plan.alternatives.length === 0 ? (
                <div className="card p-8 text-center">
                  <XCircle size={32} className="text-danger-500 mx-auto mb-2" />
                  <p className="text-surface-300 font-medium">No compliant alternatives found</p>
                  <p className="text-surface-500 text-sm mt-1">All candidates were rejected by your hard constraints.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.alternatives.map((alt, i) => (
                    <AlternativeCard
                      key={alt.id}
                      alt={alt}
                      isSelected={alt.id === (selectedAltId || plan.alternatives[0]?.id)}
                      onSelect={() => setSelectedAltId(alt.id)}
                      isRecommended={i === 0}
                    />
                  ))}
                </div>
              )}

              {/* Rejected alternatives */}
              {plan.rejected_alternatives.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowRejected(!showRejected)}
                    className="btn btn-ghost btn-sm gap-2 mb-3"
                  >
                    {showRejected ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {showRejected ? 'Hide' : 'Show'} {plan.rejected_alternatives.length} rejected option(s)
                  </button>
                  {showRejected && (
                    <div className="space-y-2">
                      {plan.rejected_alternatives.map((r) => (
                        <div key={r.id} className="card p-4 opacity-60">
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{transportIcon(r.transport_type)}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-surface-300">{r.service_name}</span>
                                <span className="badge badge-rejected">Rejected</span>
                              </div>
                              <div className="text-xs text-danger-400 mt-1">
                                {r.rejection_reasons.join(' · ')}
                              </div>
                              <div className="text-xs text-surface-500 mt-0.5">
                                {fmtTime(r.departure_time)} → {fmtTime(r.arrival_time)} · {fmtINR(r.price_inr)} (+{fmtINR(r.additional_cost_inr)})
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Itinerary ── */}
          {activeTab === 'itinerary' && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-surface-300 mb-5">Recovery Itinerary Timeline</h2>
              {plan.segments.length === 0 ? (
                <p className="text-surface-500 text-sm">No itinerary segments generated.</p>
              ) : (
                <div className="space-y-0">
                  {plan.segments.map((seg, i) => (
                    <div key={seg.id} className="timeline-item">
                      <div className={`timeline-dot ${
                        seg.segment_type === 'original_disrupted'
                          ? 'border-danger-700 bg-danger-700/20'
                          : 'border-navy-600 bg-navy-600/20'
                      }`}>
                        <span className="text-xs">{transportIcon(seg.transport_type)}</span>
                      </div>
                      <div className="card p-3 ml-2">
                        <div className="flex items-center gap-2 mb-1">
                          {seg.segment_type === 'original_disrupted' && (
                            <span className="badge badge-disrupted text-xs">❌ Disrupted</span>
                          )}
                          {seg.segment_type === 'transport' && (
                            <span className="badge badge-proposed text-xs">✓ Replacement</span>
                          )}
                          <span className="font-medium text-surface-200 text-sm">{seg.provider}</span>
                        </div>
                        <div className="text-xs text-surface-500">
                          {seg.origin} → {seg.destination}
                        </div>
                        {seg.departure_time && (
                          <div className="text-xs text-surface-400 mt-1">
                            {fmtTime(seg.departure_time)} → {fmtTime(seg.arrival_time)}
                            {seg.duration_minutes && <> · {fmtDuration(seg.duration_minutes)}</>}
                          </div>
                        )}
                        <div className="text-xs text-surface-500 mt-0.5">{fmtINR(seg.price_inr)}</div>
                        {seg.notes && <div className="text-xs text-surface-600 mt-1 italic">{seg.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Explanation ── */}
          {activeTab === 'explanation' && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
                <Info size={14} />
                AI Explanation
              </h2>
              {plan.ai_explanation ? (
                <div className="prose prose-invert prose-sm max-w-none text-surface-300 leading-relaxed whitespace-pre-wrap">
                  {plan.ai_explanation}
                </div>
              ) : (
                <p className="text-surface-500 text-sm">No explanation generated yet.</p>
              )}
            </div>
          )}

          {/* Approval / Rejection buttons */}
          {canDecide && (
            <div className="card p-5 border-navy-600/40">
              <h2 className="text-sm font-semibold text-surface-300 mb-3">Traveller Decision</h2>
              {selectedAlt && (
                <div className="text-sm text-surface-400 mb-4">
                  Selected: <span className="text-surface-200 font-medium">{selectedAlt.service_name}</span> ·
                  {fmtTime(selectedAlt.departure_time)} → {fmtTime(selectedAlt.arrival_time)} ·
                  {fmtINR(selectedAlt.price_inr)} (+{fmtINR(selectedAlt.additional_cost_inr)})
                </div>
              )}
              <div className="alert-simulated mb-4">
                <AlertTriangle size={12} />
                Approving will update this demo application only. No real provider booking will be changed.
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  id="approve-btn"
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  className="btn btn-success gap-2"
                >
                  <CheckCircle size={16} />
                  {approveMutation.isPending ? 'Approving…' : 'Approve Recovery Plan'}
                </button>
                <button
                  id="reject-btn"
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending}
                  className="btn btn-danger gap-2"
                >
                  <XCircle size={16} />
                  {rejectMutation.isPending ? 'Rejecting…' : 'Reject & Search Again'}
                </button>
                <button
                  onClick={() => regenerateMutation.mutate()}
                  disabled={regenerateMutation.isPending}
                  className="btn btn-ghost gap-2"
                >
                  <RefreshCw size={16} className={regenerateMutation.isPending ? 'animate-spin' : ''} />
                  Regenerate
                </button>
              </div>
            </div>
          )}

          {(approveMutation.isError || rejectMutation.isError || regenerateMutation.isError) && (
            <div className="card p-4 text-danger-500 text-sm" role="alert">
              {apiErrorMessage(
                approveMutation.error || rejectMutation.error || regenerateMutation.error,
                'The recovery plan could not be updated.',
              )}
            </div>
          )}

          {decided && (
            <div className={`card p-5 ${plan.status === 'approved' ? 'border-success-700/40' : 'border-danger-700/40'}`}>
              <div className="flex items-center gap-3">
                {plan.status === 'approved' ? (
                  <CheckCircle size={20} className="text-success-500" />
                ) : (
                  <XCircle size={20} className="text-danger-500" />
                )}
                <div>
                  <div className="font-medium text-surface-200">
                    Plan {plan.status === 'approved' ? 'Approved' : 'Rejected'}
                  </div>
                  <div className="text-sm text-surface-500">
                    {plan.decision_reason || 'No reason provided'} ·
                    {plan.decided_at && <> {fmtDate(plan.decided_at)}</>}
                  </div>
                  {plan.status === 'approved' && (
                    <div className="text-xs text-success-500 mt-1">
                      ✓ Simulated change recorded. No real booking was modified.
                    </div>
                  )}
                </div>
              </div>
              {plan.status === 'rejected' && (
                <button
                  onClick={() => regenerateMutation.mutate()}
                  className="btn btn-primary btn-sm mt-3 gap-2"
                >
                  <RefreshCw size={14} /> Regenerate Plan
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
