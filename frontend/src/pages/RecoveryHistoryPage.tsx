import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getRecoveryHistory } from '@/services/api'
import { apiErrorMessage, fmtINR, fmtRelative, recoveryStatusClass, recoveryStatusLabel } from '@/utils'
import { Clock, Zap, CheckCircle, XCircle, ArrowRight } from 'lucide-react'

export default function RecoveryHistoryPage() {
  const navigate = useNavigate()
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['recovery-history'],
    queryFn: getRecoveryHistory,
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-50 flex items-center gap-2">
          <Clock size={22} className="text-navy-400" />
          Recovery History
        </h1>
        <p className="text-surface-400 text-sm mt-0.5">Past disruptions, recovery plans, and traveller decisions</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : error ? (
        <div className="card p-8 text-center" role="alert">
          <p className="text-danger-500">{apiErrorMessage(error, 'Could not load recovery history.')}</p>
        </div>
      ) : !history?.length ? (
        <div className="card p-12 text-center">
          <Clock size={36} className="text-surface-600 mx-auto mb-3" />
          <p className="text-surface-300 font-medium">No recovery history yet</p>
          <p className="text-surface-500 text-sm mt-1">Run the demo scenario to generate a recovery plan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((plan) => (
            <div
              key={plan.id}
              id={`history-${plan.id}`}
              className="card card-hover p-4 cursor-pointer group"
              onClick={() => navigate(`/recovery/${plan.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${plan.status === 'approved' ? 'bg-success-700/20' :
                    plan.status === 'rejected' ? 'bg-danger-700/20' :
                    'bg-navy-600/20'}`}>
                  {plan.status === 'approved' ? (
                    <CheckCircle size={18} className="text-success-500" />
                  ) : plan.status === 'rejected' ? (
                    <XCircle size={18} className="text-danger-500" />
                  ) : (
                    <Zap size={18} className="text-navy-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-surface-200 text-sm">Recovery Plan</span>
                    <span className={recoveryStatusClass(plan.status)}>
                      {recoveryStatusLabel(plan.status)}
                    </span>
                    {plan.is_demo && <span className="badge badge-processing text-xs">Demo</span>}
                  </div>
                  <div className="text-xs text-surface-500 mt-0.5">
                    Created {fmtRelative(plan.created_at)}
                    {plan.decided_at && <> · Decided {fmtRelative(plan.decided_at)}</>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-surface-200">{fmtINR(plan.proposed_cost_inr)}</div>
                  <div className={`text-xs ${plan.additional_cost_inr > 0 ? 'text-warning-500' : plan.additional_cost_inr < 0 ? 'text-success-500' : 'text-surface-500'}`}>
                    {plan.additional_cost_inr > 0 ? '+' : ''}{fmtINR(plan.additional_cost_inr)} extra
                  </div>
                </div>
                <ArrowRight size={16} className="text-surface-600 group-hover:text-navy-400 transition-colors flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
