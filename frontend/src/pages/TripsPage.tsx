import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { listTrips } from '@/services/api'
import { apiErrorMessage, fmtDate } from '@/utils'
import { Plane, ArrowRight, MapPin } from 'lucide-react'

export default function TripsPage() {
  const navigate = useNavigate()
  const { data: trips, isLoading, error } = useQuery({
    queryKey: ['trips'],
    queryFn: () => listTrips(),
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-50 flex items-center gap-2">
            <Plane size={22} className="text-navy-400" />
            My Trips
          </h1>
          <p className="text-surface-400 text-sm mt-0.5">Manage your bookings and travel itineraries</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      ) : error ? (
        <div className="card p-8 text-center" role="alert">
          <p className="text-danger-500">{apiErrorMessage(error, 'Could not load trips.')}</p>
        </div>
      ) : !trips?.length ? (
        <div className="card p-12 text-center">
          <Plane size={36} className="text-surface-600 mx-auto mb-3" />
          <p className="text-surface-300 font-medium">No trips found</p>
          <p className="text-surface-500 text-sm mt-1">Run the demo scenario from the sidebar to create a sample trip.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              id={`trip-${trip.id}`}
              className="card card-hover p-5 cursor-pointer group"
              onClick={() => navigate(`/trips/${trip.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-100 truncate">{trip.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-surface-400">
                    <MapPin size={12} />
                    <span>{trip.origin}</span>
                    <ArrowRight size={12} />
                    <span>{trip.destination}</span>
                  </div>
                </div>
                {trip.is_demo && <span className="badge badge-processing ml-2 flex-shrink-0">Demo</span>}
              </div>
              <div className="text-sm text-surface-500">
                Departs: <span className="text-surface-300">{fmtDate(trip.departure_date)}</span>
                {trip.return_date && (
                  <> · Returns: <span className="text-surface-300">{fmtDate(trip.return_date)}</span></>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-surface-700 flex items-center justify-between">
                <span className="text-xs text-surface-500 font-mono">{trip.id.slice(0, 16)}…</span>
                <ArrowRight size={14} className="text-surface-500 group-hover:text-navy-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
