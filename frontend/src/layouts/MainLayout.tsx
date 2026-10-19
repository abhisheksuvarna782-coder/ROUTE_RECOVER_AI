import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Plane, AlertTriangle, Zap,
  Settings, MessageSquare, Menu, X, Activity,
} from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { runDemoScenario } from '@/services/api'
import { apiErrorMessage } from '@/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trips', icon: Plane, label: 'My Trips' },
  { to: '/disruptions', icon: AlertTriangle, label: 'Disruptions' },
  { to: '/recovery', icon: Zap, label: 'Recovery History' },
  { to: '/constraints', icon: Settings, label: 'Constraints' },
  { to: '/assistant', icon: MessageSquare, label: 'AI Assistant' },
]

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const demoMutation = useMutation({
    mutationFn: runDemoScenario,
    onSuccess: (data) => {
      qc.invalidateQueries()
      navigate(`/recovery/${data.recovery_plan_id}`)
    },
  })

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface-900 border-r border-surface-800
        transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-500 to-ocean-500 flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-surface-50 text-sm leading-tight">RouteRecover</div>
            <div className="text-ocean-400 text-xs font-medium">AI</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-surface-400 hover:text-surface-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Demo button */}
        <div className="px-4 py-3 border-b border-surface-800">
          <button
            id="run-demo-btn"
            onClick={() => demoMutation.mutate()}
            disabled={demoMutation.isPending}
            className="w-full btn btn-ocean btn-sm gap-2 justify-center"
          >
            <Zap size={14} />
            {demoMutation.isPending ? 'Loading demo…' : 'Run Demo Scenario'}
          </button>
          {demoMutation.isError && (
            <p className="text-danger-500 text-xs mt-1.5 text-center">
              {apiErrorMessage(demoMutation.error, 'Could not start the demo scenario.')}
            </p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sim disclaimer */}
        <div className="px-4 pb-4">
          <div className="alert-simulated">
            <AlertTriangle size={12} />
            <span>Demo mode — all booking changes are simulated</span>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 py-3 bg-surface-900 border-b border-surface-800 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-surface-400 hover:text-surface-200"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="badge badge-simulated text-xs">
            <AlertTriangle size={10} />
            Demo Simulation Mode
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
