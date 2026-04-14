import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { getOrganizations } from '../api/organizations'
import { getProjects, createProject } from '../api/projects'

const Projects = () => {
  const [organizations, setOrganizations] = useState([])
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [error, setError] = useState(null)

  // Fetch organizations on mount
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

  // Fetch projects when org changes
  useEffect(() => {
    if (!selectedOrg) return
    const fetchProjects = async () => {
      setLoading(true)
      try {
        const res = await getProjects(selectedOrg.id)
        setProjects(res.data)
      } catch {
        setError('Failed to load projects.')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [selectedOrg])

  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      const res = await createProject(selectedOrg.id, newProject)
      setProjects([...projects, res.data])
      setNewProject({ name: '', description: '' })
      setShowForm(false)
    } catch {
      setError('Failed to create project.')
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Projects</h2>
            <p className="text-slate-400 text-sm mt-1">Manage your organization's projects</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
          >
            + New Project
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Org Selector */}
        {organizations.length > 0 && (
          <div className="mb-6">
            <label className="text-slate-400 text-sm mr-3">Organization:</label>
            <select
              value={selectedOrg?.id}
              onChange={(e) => setSelectedOrg(organizations.find(o => o.id === parseInt(e.target.value)))}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Create Project Form */}
        {showForm && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <input
                type="text"
                placeholder="Project name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-white text-sm px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="text-slate-500 text-sm text-center py-10">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm py-10">
            No projects yet. Create your first one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500 transition cursor-pointer">
                <h3 className="text-white font-semibold mb-1">{project.name}</h3>
                <p className="text-slate-400 text-sm">{project.description || 'No description.'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded-full">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}

export default Projects