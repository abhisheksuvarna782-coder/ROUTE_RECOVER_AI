import { useNavigate } from 'react-router-dom'
import { Activity, Zap, Shield, ArrowRight, AlertTriangle, BarChart2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { runDemoScenario } from '@/services/api'
import { apiErrorMessage } from '@/utils'

const features = [
  {
    icon: AlertTriangle,
    title: 'Instant Disruption Detection',
    desc: 'Simulate or receive disruption events across flights, trains, buses and hotels.',
    color: 'text-warning-500',
    bg: 'bg-warning-700/10',
  },
  {
    icon: Zap,
    title: 'AI-Powered Recovery',
    desc: 'Our decision engine evaluates alternatives against your hard constraints and personal preferences.',
    color: 'text-navy-400',
    bg: 'bg-navy-600/10',
  },
  {
    icon: BarChart2,
    title: 'Clear Cost Comparison',
    desc: 'Side-by-side comparison of original vs recovery journey with accurate cost breakdown.',
    color: 'text-ocean-400',
    bg: 'bg-ocean-600/10',
  },
  {
    icon: Shield,
    title: 'Safe & Transparent',
    desc: 'Simulated changes are clearly labelled. You approve before anything is actioned.',
    color: 'text-success-500',
    bg: 'bg-success-700/10',
  },
]

const steps = [
  { num: '01', title: 'Detect', desc: 'A disruption is detected or simulated — flight cancelled, train delayed, hotel unavailable.' },
  { num: '02', title: 'Recover', desc: 'The AI engine finds alternatives, scores them against your constraints, and builds a recovery itinerary.' },
  { num: '03', title: 'Continue', desc: 'Review, approve or regenerate the plan. Your journey continues with minimal disruption.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const demoMutation = useMutation({
    mutationFn: runDemoScenario,
    onSuccess: (data) => navigate(`/recovery/${data.recovery_plan_id}`),
  })

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-surface-800 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-500 to-ocean-500 flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <span className="font-bold text-surface-50 text-lg">RouteRecover <span className="text-ocean-400">AI</span></span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary btn-sm"
        >
          Open Dashboard
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-600/20 border border-navy-600/30 text-navy-300 text-xs font-medium mb-6">
          <Zap size={12} />
          AI-powered travel disruption recovery
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-surface-50 leading-tight mb-6">
          When travel changes,<br />
          <span className="text-gradient">your journey doesn't have to stop.</span>
        </h1>
        <p className="text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          RouteRecover AI detects travel disruptions, identifies affected bookings, evaluates
          alternatives against your constraints, and produces a recovery itinerary in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            id="open-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary btn-lg gap-2"
          >
            Open Recovery Dashboard
            <ArrowRight size={18} />
          </button>
          <button
            id="try-demo-btn"
            onClick={() => demoMutation.mutate()}
            disabled={demoMutation.isPending}
            className="btn btn-outline btn-lg gap-2"
          >
            <Zap size={18} />
            {demoMutation.isPending ? 'Starting demo…' : 'Try Live Demo'}
          </button>
        </div>
        {demoMutation.isError && (
          <p className="text-danger-500 text-sm mt-4">
            {apiErrorMessage(demoMutation.error, 'Could not start the demo scenario.')}
          </p>
        )}
        <div className="alert-simulated justify-center mt-6 max-w-md mx-auto">
          <AlertTriangle size={12} />
          Demo travel availability and booking changes are simulated — not live provider data.
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-surface-50 text-center mb-10">
          Everything you need to recover
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="card p-5 card-hover animate-slide-up">
              <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon size={20} className={f.color} />
              </div>
              <h3 className="font-semibold text-surface-100 mb-2">{f.title}</h3>
              <p className="text-surface-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-surface-800">
        <h2 className="text-2xl font-bold text-surface-50 text-center mb-12">
          Three steps to get back on track
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy-600 to-ocean-600 flex items-center justify-center mx-auto mb-5 shadow-glow">
                <span className="font-mono text-white font-bold text-lg">{s.num}</span>
              </div>
              <h3 className="text-xl font-semibold text-surface-50 mb-3">{s.title}</h3>
              <p className="text-surface-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="border-gradient rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold text-surface-50 mb-4">
            Ready to recover your journey?
          </h2>
          <p className="text-surface-400 mb-8 max-w-lg mx-auto">
            Open the recovery dashboard and run the demo scenario to see RouteRecover AI in action.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary btn-lg gap-2"
          >
            Open Recovery Dashboard
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800 py-6 px-6 text-center text-surface-500 text-sm">
        <p>RouteRecover AI — Hackathon PS 4.1 Demo</p>
        <p className="mt-1 text-xs">⚠️ All booking changes are simulated. No real provider integrations.</p>
      </footer>
    </div>
  )
}
