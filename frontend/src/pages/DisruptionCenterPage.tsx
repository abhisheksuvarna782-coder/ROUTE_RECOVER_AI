import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  listDisruptions, simulateDisruption, listTrips, generateRecovery, getTrip
} from '@/services/api'
import { apiErrorMessage, fmtRelative, fmtTime, disruptionTypeLabel } from '@/utils'
import { AlertTriangle, Zap, Clock } from 'lucide-react'
import { useState } from 'react'
import type { DisruptionType, Trip } from '@/types'

const DISRUPTION_TYPES: { value: DisruptionType; label: string; icon: string }[] = [
  { value: 'flight_cancellation', label: 'Flight Cancellation', icon: '✈️' },
  { value: 'flight_delay', label: 'Flight Delay', icon: '⏰' },
  { value: 'train_delay', label: 'Train Delay', icon: '🚆' },
  { value: 'bus_cancellation', label: 'Bus Cancellation', icon: '🚌' },
  { value: 'hotel_cancellation', label: 'Hotel Cancellation', icon: '🏨' },
  { value: 'train_cancellation', label: 'Train Cancellation', icon: '🚆' },
]

export default function DisruptionCenterPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showSimulate, setShowSimulate] = useState(false)
  const [selectedType, setSelectedType] = useState<DisruptionType>('flight_cancellation')

  const { data: disruptions, isLoading, error } = useQuery({
    queryKey: ['disruptions'],
    queryFn: listDisruptions,
    refetchInterval: 15_000,
  })

  const { data: trips } = useQuery({
    queryKey: ['trips'],
    queryFn: () => listTrips(),
  })

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const demoTrip = trips?.find((t: Trip) => t.is_demo)
      if (!demoTrip) throw new Error('No demo trip found. Run demo scenario first.')
      
      // Find a relevant transport booking to disrupt
      const tripDetail = await getTrip(demoTrip.id)
      const tripBookings = tripDetail.bookings
      
      const affectedBooking = tripBookings?.find(b => {
        if (selectedType === 'hotel_cancellation') return b.booking_type === 'hotel'
        if (b.booking_type !== 'transport') return false
        if (selectedType.startsWith('flight')) return b.transport_type === 'flight'
        if (selectedType.startsWith('train')) return b.transport_type === 'train'
        if (selectedType.startsWith('bus')) return b.transport_type === 'bus'
        return false
      })
      if (!affectedBooking) {
        throw new Error(`No booking matching ${disruptionTypeLabel(selectedType)} was found on the demo trip.`)
      }
      
      const disruption = await simulateDisruption({
        trip_id: demoTrip.id,
        disruption_type: selectedType,
        affected_booking_id: affectedBooking.id,
        provider: affectedBooking.provider,
        origin: affectedBooking.origin,
        destination: affectedBooking.destination,
        is_demo: true,
        description: `[SIMULATED] ${disruptionTypeLabel(selectedType)} - demo simulation`,
      })
      return generateRecovery({ trip_id: demoTrip.id, disruption_id: disruption.id })
    },
    onSuccess: (plan) => {
      qc.invalidateQueries()
      navigate(`/recovery/${plan.id}`)
    },
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-50 flex items-center gap-2">
            <AlertTriangle size={22} className="text-warning-500" />
            Disruption Center
          </h1>
          <p className="text-surface-400 text-sm mt-0.5">Monitor and simulate travel disruptions</p>
        </div>
        <button
          onClick={() => setShowSimulate(!showSimulate)}
          className="btn btn-primary gap-2"
        >
          <Zap size={16} />
          Simulate Disruption
        </button>
      </div>

      {/* Simulate panel */}
      {showSimulate && (
        <div className="card p-5 border-warning-700/40 animate-slide-up">
          <h2 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-warning-500" />
            Simulate a Disruption
            <span className="badge badge-simulated ml-2">Simulated — not real</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {DISRUPTION_TYPES.map((dt) => (
              <button
                key={dt.value}
                onClick={() => setSelectedType(dt.value)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedType === dt.value
                    ? 'border-navy-500 bg-navy-600/20 text-navy-300'
                    : 'border-surface-700 bg-surface-900 text-surface-400 hover:border-surface-600'
                }`}
              >
                <div className="text-2xl mb-1">{dt.icon}</div>
                <div className="text-xs font-medium">{dt.label}</div>
              </button>
            ))}
          </div>
          <div className="alert-simulated mb-4">
            <AlertTriangle size={12} />
            This will simulate a disruption on the demo trip and generate a recovery plan.
            No real bookings will be changed.
          </div>
          <button
            onClick={() => simulateMutation.mutate()}
            disabled={simulateMutation.isPending}
            className="btn btn-ocean gap-2"
          >
            <Zap size={16} />
            {simulateMutation.isPending ? 'Simulating…' : `Simulate ${disruptionTypeLabel(selectedType)}`}
          </button>
          {simulateMutation.isError && (
            <p className="text-danger-500 text-sm mt-2">
              {apiErrorMessage(simulateMutation.error, 'Could not simulate the disruption.')}
            </p>
          )}
        </div>
      )}

      {/* Disruptions list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      ) : error ? (
        <div className="card p-8 text-center" role="alert">
          <p className="text-danger-500">{apiErrorMessage(error, 'Could not load disruptions.')}</p>
        </div>
      ) : !disruptions?.length ? (
        <div className="card p-12 text-center">
          <AlertTriangle size={36} className="text-surface-600 mx-auto mb-3" />
          <p className="text-surface-300 font-medium">No disruptions recorded</p>
          <p className="text-surface-500 text-sm mt-1">Use "Simulate Disruption" to create a demo event.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disruptions.map((d) => (
            <div key={d.id} className="card p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-danger-700/10 border border-danger-700/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} className="text-danger-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-surface-100">
                      {disruptionTypeLabel(d.disruption_type)}
                    </span>
                    {d.is_simulated && (
                      <span className="badge badge-simulated">⚠️ Simulated</span>
                    )}
                  </div>
                  {(d.origin || d.destination) && (
                    <div className="text-sm text-surface-400 mt-0.5">
                      {d.origin} {d.destination ? `→ ${d.destination}` : ''}
                      {d.provider && ` · ${d.provider}`}
                    </div>
                  )}
                  {d.description && (
                    <div className="text-xs text-surface-500 mt-1 italic">{d.description}</div>
                  )}
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-surface-500">
                    <Clock size={11} />
                    Detected {fmtRelative(d.detected_at)}
                    {d.original_departure && (
                      <> · Original departure: {fmtTime(d.original_departure)}</>
                    )}
                    {d.delay_minutes && <> · Delay: {d.delay_minutes}min</>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
