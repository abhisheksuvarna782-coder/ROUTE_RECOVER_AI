import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { getTrip, simulateDisruption, generateRecovery } from '@/services/api'
import { apiErrorMessage, fmtDate, fmtTime, fmtINR, bookingStatusClass, bookingStatusLabel, transportIcon } from '@/utils'
import {
  ChevronLeft, AlertTriangle, Clock, MapPin, CreditCard,
} from 'lucide-react'
import type { Booking } from '@/types'

function BookingCard({ booking, onSimulate }: { booking: Booking; onSimulate?: () => void }) {
  const isTransport = booking.booking_type === 'transport'
  const icon = isTransport ? transportIcon(booking.transport_type) : '🏨'

  return (
    <div className={`card p-4 ${booking.status === 'disrupted' ? 'border-danger-700/50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-surface-100 text-sm">{booking.provider}</span>
            <span className={bookingStatusClass(booking.status)}>
              {bookingStatusLabel(booking.status)}
            </span>
          </div>
          <div className="text-xs font-mono text-surface-500 mt-0.5">Ref: {booking.reference}</div>
          {isTransport && booking.origin && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-surface-400">
              <MapPin size={11} />
              {booking.origin} → {booking.destination}
            </div>
          )}
          {booking.departure_time && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-surface-400">
              <Clock size={11} />
              {fmtDate(booking.departure_time)} · {fmtTime(booking.departure_time)}
              {booking.arrival_time && <> → {fmtTime(booking.arrival_time)}</>}
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-1 text-sm text-surface-400">
            <CreditCard size={11} />
            {fmtINR(booking.price_inr)}
            {booking.seat_class && <span className="text-surface-600">· {booking.seat_class}</span>}
          </div>
          {booking.notes && (
            <div className="text-xs text-surface-500 mt-1.5 italic">{booking.notes}</div>
          )}
        </div>
      </div>
      {booking.status === 'confirmed' && onSimulate && booking.booking_type === 'transport' && (
        <div className="mt-3 pt-3 border-t border-surface-700">
          <button onClick={onSimulate} className="btn btn-danger btn-sm gap-1.5 w-full">
            <AlertTriangle size={12} />
            Simulate Cancellation
          </button>
        </div>
      )}
    </div>
  )
}

export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => getTrip(tripId!),
    enabled: !!tripId,
  })

  const simulateMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      if (!trip || !tripId) throw new Error('Trip is no longer available.')
      const booking = trip.bookings.find(b => b.id === bookingId)
      if (!booking) throw new Error('The selected booking is no longer available.')
      const disruptionType = booking.transport_type === 'flight'
        ? 'flight_cancellation'
        : booking.transport_type === 'train'
          ? 'train_delay'
          : booking.transport_type === 'bus'
            ? 'bus_cancellation'
            : undefined
      if (!disruptionType) throw new Error('This booking type cannot be disrupted by the current simulator.')
      const disruption = await simulateDisruption({
        trip_id: tripId,
        disruption_type: disruptionType,
        affected_booking_id: bookingId,
        provider: booking.provider,
        origin: booking.origin,
        destination: booking.destination,
        is_demo: trip.is_demo,
      })
      return generateRecovery({ trip_id: tripId, disruption_id: disruption.id })
    },
    onSuccess: (plan) => {
      qc.invalidateQueries()
      navigate(`/recovery/${plan.id}`)
    },
  })

  if (isLoading) return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-48 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="card p-8 text-center" role="alert">
      <p className="text-danger-500">{apiErrorMessage(error, 'Could not load this trip.')}</p>
    </div>
  )

  if (!trip) return (
    <div className="card p-8 text-center">
      <p className="text-surface-400">Trip not found.</p>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => navigate('/trips')} className="btn btn-ghost btn-sm gap-2">
        <ChevronLeft size={16} /> Back to Trips
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">{trip.name}</h1>
          <div className="flex items-center gap-1.5 mt-1 text-surface-400 text-sm">
            <MapPin size={13} />
            {trip.origin} → {trip.destination} · {fmtDate(trip.departure_date)}
          </div>
        </div>
        {trip.is_demo && <span className="badge badge-processing">Demo Trip</span>}
      </div>

      {trip.bookings.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wide mb-3">
            Bookings ({trip.bookings.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trip.bookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onSimulate={
                  b.booking_type === 'transport' &&
                    ['flight', 'train', 'bus'].includes(b.transport_type ?? '') &&
                    b.status === 'confirmed'
                    ? () => simulateMutation.mutate(b.id)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {simulateMutation.isError && (
        <div className="card p-4 text-danger-500 text-sm" role="alert">
          {apiErrorMessage(simulateMutation.error, 'Could not simulate the disruption.')}
        </div>
      )}

      {simulateMutation.isPending && (
        <div className="card p-4 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-ocean-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-surface-300 text-sm">Simulating disruption and generating recovery plan…</span>
        </div>
      )}

      {trip.recovery_plans.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wide mb-3">
            Recovery Plans
          </h2>
          <div className="space-y-2">
            {trip.recovery_plans.map((p) => (
              <div
                key={p.id}
                className="card p-4 cursor-pointer card-hover flex items-center justify-between"
                onClick={() => navigate(`/recovery/${p.id}`)}
              >
                <div>
                  <span className="text-sm font-medium text-surface-200">
                    Recovery Plan
                  </span>
                  <span className="text-xs text-surface-500 ml-2 font-mono">{p.id.slice(0, 12)}…</span>
                </div>
                <div className="flex items-center gap-2">
                  {fmtINR(p.additional_cost_inr)} extra
                  <span className={`badge ${p.status === 'approved' ? 'badge-approved' : p.status === 'rejected' ? 'badge-rejected' : p.status === 'proposed' ? 'badge-proposed' : 'badge-processing'}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
