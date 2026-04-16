import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { getOrganizations } from '../api/organizations'
import axiosInstance from '../api/axiosInstance'

const Activity = () => {
  const [organizations, setOrganizations] = useState([])
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await getOrganizations()
        setOrganizations(res.data)
        if (res.data.length > 0) setSelectedOrg(res.data[0])
      } catch {
        setError('Failed to load organizations.')
      }
    }
    fetchOrgs()
  }, [])

  useEffect(() => {
    if (!selectedOrg) return
    const fetchActivity = async () => {
      setLoading(true)
      try {
        const res = await axiosInstance.get(`/api/orgs/${selectedOrg.id}/activity/`)
        setActivities(res.data)
      } catch {
        setError('Failed to load activity.')
      } finally {
        setLoading(false)
      }
    }
    fetchActivity()
  }, [selectedOrg])

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Activity</h2>
            <p className="text-slate-400 text-sm mt-1">Recent actions across your organization</p>
          </div>

          {/* Org Selector */}
          {organizations.length > 0 && (
            <select
              value={selectedOrg?.id}
              onChange={(e) => setSelectedOrg(organizations.find(o => o.id === parseInt(e.target.value)))}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Timeline */}
        {loading ? (
          <div className="text-slate-500 text-sm text-center py-10">Loading activity...</div>
        ) : activities.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-500 text-sm">
            No activity yet.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 px-6 py-4">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-xs font-semibold shrink-0 mt-0.5">
                  {activity.user?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-sm">
                    <span className="text-white font-medium">{activity.user?.username ?? 'Someone'}</span>
                    {' '}{activity.action}
                  </p>
                  {activity.detail && (
                    <p className="text-slate-500 text-xs mt-0.5 truncate">{activity.detail}</p>
                  )}
                </div>
                {/* Time */}
               <span className="text-slate-600 text-xs shrink-0 mt-0.5">
                {timeAgo(activity.timestamp)}
               </span>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}

export default Activity