import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConstraints, saveConstraints } from '@/services/api'
import { apiErrorMessage } from '@/utils'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Settings, Save, AlertTriangle, CheckCircle } from 'lucide-react'
import type { TransportType } from '@/types'

const DEMO_TRAVELLER_ID = 'demo-traveller-001'

const TRANSPORT_TYPES: { value: TransportType; label: string }[] = [
  { value: 'flight', label: '✈️ Flight' },
  { value: 'train', label: '🚆 Train' },
  { value: 'bus', label: '🚌 Bus' },
  { value: 'car', label: '🚗 Car' },
]

export default function ConstraintsPage() {
  const qc = useQueryClient()
  const [saved, setSaved] = useState(false)

  const { data: existing, error: constraintsError } = useQuery({
    queryKey: ['constraints', DEMO_TRAVELLER_ID],
    queryFn: () => getConstraints(DEMO_TRAVELLER_ID),
    retry: false,
  })

  const [form, setForm] = useState({
    max_additional_budget_inr: 1500,
    latest_arrival_time: '2026-10-18T16:00',
    preferred_transport_types: ['train', 'flight'] as TransportType[],
    overnight_travel_ok: false,
    max_transfers: 1,
    max_journey_duration_hours: 8,
    requires_accessibility: false,
    preferred_departure_from: '06:00',
    preferred_departure_to: '14:00',
    notes: 'Must arrive by 4:00 PM to catch connecting train at 5:00 PM.',
  })

  useEffect(() => {
    if (existing) {
      setForm(prev => ({
        ...prev,
        max_additional_budget_inr: existing.max_additional_budget_inr ?? prev.max_additional_budget_inr,
        overnight_travel_ok: existing.overnight_travel_ok,
        max_transfers: existing.max_transfers ?? prev.max_transfers,
        max_journey_duration_hours: existing.max_journey_duration_hours ?? prev.max_journey_duration_hours,
        requires_accessibility: existing.requires_accessibility,
        latest_arrival_time: existing.latest_arrival_time
          ? existing.latest_arrival_time.slice(0, 16)
          : prev.latest_arrival_time,
        preferred_departure_from: existing.preferred_departure_from ?? prev.preferred_departure_from,
        preferred_departure_to: existing.preferred_departure_to ?? prev.preferred_departure_to,
        preferred_transport_types: existing.preferred_transport_types ?? prev.preferred_transport_types,
        notes: existing.notes ?? prev.notes,
      }))
    }
  }, [existing])

  const saveMutation = useMutation({
    mutationFn: () => saveConstraints({
      traveller_id: DEMO_TRAVELLER_ID,
      max_additional_budget_inr: form.max_additional_budget_inr,
      latest_arrival_time: form.latest_arrival_time || undefined,
      preferred_transport_types: form.preferred_transport_types,
      overnight_travel_ok: form.overnight_travel_ok,
      max_transfers: form.max_transfers,
      max_journey_duration_hours: form.max_journey_duration_hours,
      requires_accessibility: form.requires_accessibility,
      preferred_departure_from: form.preferred_departure_from,
      preferred_departure_to: form.preferred_departure_to,
      notes: form.notes,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['constraints'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  const toggleTransport = (type: TransportType) => {
    setForm(prev => ({
      ...prev,
      preferred_transport_types: prev.preferred_transport_types.includes(type)
        ? prev.preferred_transport_types.filter(t => t !== type)
        : [...prev.preferred_transport_types, type],
    }))
  }

  const constraintsErrorMessage = constraintsError &&
    (!axios.isAxiosError(constraintsError) || constraintsError.response?.status !== 404)
      ? apiErrorMessage(constraintsError, 'Could not load saved constraints.')
      : undefined

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-50 flex items-center gap-2">
          <Settings size={22} className="text-navy-400" />
          Traveller Constraints
        </h1>
        <p className="text-surface-400 text-sm mt-0.5">
          Configure your hard constraints. The recovery engine rejects any option that violates these.
        </p>
      </div>

      <div className="card p-5 space-y-5">
        {constraintsErrorMessage && (
          <p role="alert" className="text-danger-500 text-sm">
            {constraintsErrorMessage}
          </p>
        )}
        {/* Budget */}
        <div>
          <label className="label">Maximum Additional Budget (₹)</label>
          <div className="flex items-center gap-2">
            <span className="text-surface-400">₹</span>
            <input
              type="number"
              className="input"
              value={form.max_additional_budget_inr}
              onChange={e => setForm(prev => ({ ...prev, max_additional_budget_inr: Number(e.target.value) }))}
              min={0}
              step={100}
            />
          </div>
          <p className="text-xs text-surface-500 mt-1">Hard limit — options exceeding this will be rejected outright.</p>
        </div>

        {/* Latest arrival */}
        <div>
          <label className="label">Latest Acceptable Arrival Time</label>
          <input
            type="datetime-local"
            className="input"
            value={form.latest_arrival_time}
            onChange={e => setForm(prev => ({ ...prev, latest_arrival_time: e.target.value }))}
          />
          <p className="text-xs text-surface-500 mt-1">Options arriving after this time will be rejected.</p>
        </div>

        {/* Preferred transport */}
        <div>
          <label className="label">Preferred Transport Types</label>
          <div className="flex gap-2 flex-wrap">
            {TRANSPORT_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleTransport(value)}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                  form.preferred_transport_types.includes(value)
                    ? 'border-navy-500 bg-navy-600/20 text-navy-300'
                    : 'border-surface-700 bg-surface-900 text-surface-400 hover:border-surface-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Max transfers */}
        <div>
          <label className="label">Maximum Transfers / Stops</label>
          <select
            className="select"
            value={form.max_transfers}
            onChange={e => setForm(prev => ({ ...prev, max_transfers: Number(e.target.value) }))}
          >
            <option value={0}>Direct only (0 stops)</option>
            <option value={1}>1 stop maximum</option>
            <option value={2}>2 stops maximum</option>
            <option value={3}>3 stops maximum</option>
          </select>
        </div>

        {/* Max duration */}
        <div>
          <label className="label">Maximum Journey Duration (hours)</label>
          <input
            type="number"
            className="input"
            value={form.max_journey_duration_hours}
            onChange={e => setForm(prev => ({ ...prev, max_journey_duration_hours: Number(e.target.value) }))}
            min={1}
            max={24}
            step={0.5}
          />
        </div>

        {/* Departure window */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Preferred Departure From</label>
            <input
              type="time"
              className="input"
              value={form.preferred_departure_from}
              onChange={e => setForm(prev => ({ ...prev, preferred_departure_from: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Preferred Departure To</label>
            <input
              type="time"
              className="input"
              value={form.preferred_departure_to}
              onChange={e => setForm(prev => ({ ...prev, preferred_departure_to: e.target.value }))}
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.overnight_travel_ok}
              onChange={e => setForm(prev => ({ ...prev, overnight_travel_ok: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-surface-300">Overnight travel acceptable</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.requires_accessibility}
              onChange={e => setForm(prev => ({ ...prev, requires_accessibility: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-surface-300">Requires accessibility features</span>
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes</label>
          <textarea
            className="input resize-none h-20"
            value={form.notes}
            onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <button
            id="save-constraints-btn"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="btn btn-primary gap-2"
          >
            <Save size={16} />
            {saveMutation.isPending ? 'Saving…' : 'Save Constraints'}
          </button>
          {saved && (
            <div className="flex items-center gap-1.5 text-success-500 text-sm">
              <CheckCircle size={14} />
              Saved! Regenerate any recovery plan to apply.
            </div>
          )}
          {saveMutation.isError && (
            <p role="alert" className="text-danger-500 text-sm">
              {apiErrorMessage(saveMutation.error, 'Could not save constraints.')}
            </p>
          )}
        </div>
      </div>

      <div className="alert-simulated">
        <AlertTriangle size={12} />
        Hard constraints (budget, deadline, transfers) override soft preferences. The engine will explicitly
        explain if no option satisfies all constraints.
      </div>
    </div>
  )
}
