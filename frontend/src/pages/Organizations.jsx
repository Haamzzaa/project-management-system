import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import {
  getOrganizations,
  createOrganization,
  getMembers,
  inviteUser,
} from '../api/organizations'

const Organizations = () => {
  const [organizations, setOrganizations] = useState([])
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [newOrg, setNewOrg] = useState({ name: '', description: '' })
  const [inviteEmail, setInviteEmail] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [inviteRole, setInviteRole] = useState('member')

  useEffect(() => {
    fetchOrgs()
  }, [])

  useEffect(() => {
    if (!selectedOrg) return
    fetchMembers(selectedOrg.id)
  }, [selectedOrg])

  const fetchOrgs = async () => {
    setLoading(true)
    try {
      const res = await getOrganizations()
      setOrganizations(res.data)
      if (res.data.length > 0) setSelectedOrg(res.data[0])
    } catch {
      setError('Failed to load organizations.')
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async (orgId) => {
    try {
      const res = await getMembers(orgId)
      setMembers(res.data)
    } catch {
      setError('Failed to load members.')
    }
  }

  const handleCreateOrg = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await createOrganization(newOrg)
      setOrganizations([...organizations, res.data])
      setSelectedOrg(res.data)
      setNewOrg({ name: '', description: '' })
      setShowCreateForm(false)
      setSuccess('Organization created successfully.')
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Failed to create organization.')
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await inviteUser(selectedOrg.id, {
        email: inviteEmail,
        role: inviteRole
      })
      setInviteEmail('')
      setShowInviteForm(false)
      setSuccess('Invite sent successfully.')
      setTimeout(() => setSuccess(null), 3000)
      fetchMembers(selectedOrg.id)
    } catch {
      setError('Failed to send invite. Check the email and try again.')
    }
  }

  const getInitials = (name) =>
    name
      ?.split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Organizations</h2>
            <p className="text-slate-400 text-sm mt-1">Manage your organizations and members</p>
          </div>
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setShowInviteForm(false) }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
          >
            + New Organization
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-3">
            {success}
          </div>
        )}

        {/* Create Org Form */}
        {showCreateForm && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">New Organization</h3>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <input
                type="text"
                placeholder="Organization name"
                value={newOrg.name}
                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                required
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={newOrg.description}
                onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-slate-400 hover:text-white text-sm px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-slate-500 text-sm text-center py-10">Loading...</div>
        ) : organizations.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-500 text-sm">
            No organizations yet. Create your first one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Org List */}
            <div className="lg:col-span-1 space-y-3">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  onClick={() => { setSelectedOrg(org); setShowInviteForm(false) }}
                  className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition ${
                    selectedOrg?.id === org.id
                      ? 'border-indigo-500'
                      : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm font-semibold shrink-0">
                      {getInitials(org.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{org.name}</p>
                      {org.description && (
                        <p className="text-slate-500 text-xs truncate">{org.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Org Detail */}
            {selectedOrg && (
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">

                {/* Org Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-semibold">
                      {getInitials(selectedOrg.name)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{selectedOrg.name}</h3>
                      {selectedOrg.description && (
                        <p className="text-slate-400 text-xs mt-0.5">{selectedOrg.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
                  >
                    + Invite Member
                  </button>
                </div>

                {/* Invite Form */}
                {showInviteForm && (
                  <form onSubmit={handleInvite} className="flex gap-3 mb-6">
                    <input
                      type="email"
                      placeholder="Enter email to invite"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {/* 👇 NEW ROLE SELECT */}
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                    >
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
                    >
                      Send
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowInviteForm(false)}
                      className="text-slate-400 hover:text-white text-sm px-3 py-2.5 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {/* Members */}
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">
                    Members ({members.length})
                  </p>
                  {members.length === 0 ? (
                    <p className="text-slate-600 text-sm text-center py-6">No members yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 bg-slate-800 rounded-lg px-4 py-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold shrink-0">
                            {getInitials(member.user?.username || member.user?.email)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium truncate">
                              {member.user?.username || member.user?.email || 'Unknown'}
                            </p>
                            <p className="text-slate-500 text-xs truncate">{member.user?.email}</p>
                          </div>
                          {member.role && (
                            <span className="text-xs bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded-full shrink-0">
                              {member.role}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default Organizations
