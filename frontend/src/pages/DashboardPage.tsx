import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getDashboardMetrics, runDemoScenario } from '@/services/api'
import { apiErrorMessage, fmtINR, fmtRelative, fmtDate, disruptionTypeLabel } from '@/utils'
import {
  LayoutDashboard, Zap, AlertTriangle, CheckCircle,
  TrendingUp, Clock, Plane, Activity, RefreshCw,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

function StatCard({
  icon: Icon, label, value, sub, color = 'text-navy-400', bg = 'bg-navy-600/10'
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color?: string; bg?: string
}) {
  return (
    <div className="stat-card card-hover">
      <div className="flex items-start justify-between">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value mt-1">{value}</div>
          {sub && <div className="text-xs text-surface-500 mt-0.5">{sub}</div>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardMetrics,
    refetchInterval: 30_000,
  })

  const demoMutation = useMutation({
    mutationFn: runDemoScenario,
    onSuccess: (data) => {
      qc.invalidateQueries()
      navigate(`/recovery/${data.recovery_plan_id}`)
    },
  })

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="card p-8 text-center">
      <AlertTriangle size={32} className="text-danger-500 mx-auto mb-3" />
      <p className="text-surface-300">Could not load dashboard. Is the backend running?</p>
      <p className="text-surface-500 text-sm mt-1">Run: <code className="font-mono">uvicorn app.main:app --reload</code></p>
    </div>
  )

  const m = metrics!

  const chartData = [
    { name: 'Active', value: m.total_active_bookings, fill: '#6366f1' },
    { name: 'Disrupted', value: m.affected_reservations, fill: '#ef4444' },
    { name: 'Plans', value: m.recovery_plans_generated, fill: '#06b6d4' },
    { name: 'Disruptions', value: m.current_disruptions, fill: '#f59e0b' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-50 flex items-center gap-2">
            <LayoutDashboard size={22} className="text-navy-400" />
            Recovery Dashboard
          </h1>
          <p className="text-surface-400 text-sm mt-0.5">Real-time travel disruption monitoring</p>
        </div>
        <button
          id="dashboard-run-demo"
          onClick={() => demoMutation.mutate()}
          disabled={demoMutation.isPending}
          className="btn btn-ocean gap-2"
        >
          <Zap size={16} />
          {demoMutation.isPending ? 'Loading…' : 'Run Demo Scenario'}
        </button>
      </div>
      {demoMutation.isError && (
        <p role="alert" className="text-danger-500 text-sm">
          {apiErrorMessage(demoMutation.error, 'Could not start the demo scenario.')}
        </p>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Plane} label="Active Bookings" value={m.total_active_bookings}
          color="text-navy-400" bg="bg-navy-600/10"
        />
        <StatCard
          icon={AlertTriangle} label="Active Disruptions" value={m.current_disruptions}
          color="text-warning-500" bg="bg-warning-700/10"
          sub={m.current_disruptions > 0 ? 'Action needed' : 'All clear'}
        />
        <StatCard
          icon={Activity} label="Affected Reservations" value={m.affected_reservations}
          color="text-danger-500" bg="bg-danger-700/10"
        />
        <StatCard
          icon={Zap} label="Recovery Plans" value={m.recovery_plans_generated}
          color="text-ocean-400" bg="bg-ocean-600/10"
        />
        <StatCard
          icon={TrendingUp} label="Est. Extra Cost" value={fmtINR(m.estimated_additional_cost_inr)}
          color="text-success-500" bg="bg-success-700/10"
          sub="from proposed plans"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-1 card p-5">
          <h2 className="text-sm font-semibold text-surface-300 mb-4">Booking Overview</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Active Disruptions */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-surface-300">Active Disruption Cases</h2>
            <button onClick={() => navigate('/disruptions')} className="btn btn-ghost btn-sm text-xs">
              View all
            </button>
          </div>
          {m.active_disruption_cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-surface-500">
              <CheckCircle size={28} className="text-success-500 mb-2" />
              <p className="text-sm">No active disruptions</p>
              <button
                onClick={() => demoMutation.mutate()}
                className="btn btn-ghost btn-sm mt-3 gap-2"
              >
                <Zap size={14} /> Run Demo Scenario
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {m.active_disruption_cases.slice(0, 5).map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-900 border border-surface-700 cursor-pointer hover:border-navy-600/50 transition-colors"
                  onClick={() => navigate('/disruptions')}
                >
                  <div className="w-2 h-2 rounded-full bg-danger-500 animate-pulse-slow flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-surface-200 truncate">
                      {disruptionTypeLabel(d.disruption_type)}
                    </div>
                    <div className="text-xs text-surface-500">
                      {d.origin} → {d.destination} · {fmtRelative(d.detected_at)}
                    </div>
                  </div>
                  {d.is_simulated && (
                    <span className="badge badge-simulated text-xs flex-shrink-0">Simulated</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Alerts + Upcoming Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
            <Clock size={14} /> Recent Alerts
          </h2>
          {m.recent_alerts.length === 0 ? (
            <p className="text-surface-500 text-sm">No recent activity.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {m.recent_alerts.map((a) => (
                <div key={a.id} className="flex gap-3 text-sm">
                  <span className="text-surface-600 text-xs whitespace-nowrap pt-0.5">
                    {fmtRelative(a.timestamp)}
                  </span>
                  <span className="text-surface-300 truncate-2">{a.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
            <Plane size={14} /> Upcoming Trips
          </h2>
          {m.upcoming_trips.length === 0 ? (
            <p className="text-surface-500 text-sm">No upcoming trips. Run the demo scenario to get started.</p>
          ) : (
            <div className="space-y-2">
              {m.upcoming_trips.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-900 border border-surface-700 cursor-pointer hover:border-navy-600/50 transition-colors"
                  onClick={() => navigate(`/trips/${t.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-surface-200 truncate">{t.name}</div>
                    <div className="text-xs text-surface-500">
                      {t.origin} → {t.destination} · {fmtDate(t.departure_date)}
                    </div>
                  </div>
                  {t.is_demo && <span className="badge badge-processing text-xs">Demo</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
