import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { getOrganizations, getMembers } from '../api/organizations'
import { getProjects } from '../api/projects'
import { getTasks } from '../api/tasks'

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    activeTasks: 0,
    members: 0,
    completed: 0,
  })
  const [recentProjects, setRecentProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgsRes = await getOrganizations()
        if (orgsRes.data.length === 0) return

        const orgId = orgsRes.data[0].id

        const [projectsRes, membersRes] = await Promise.all([
          getProjects(orgId),
          getMembers(orgId),
        ])

        const projects = projectsRes.data
        setRecentProjects(projects.slice(-3).reverse())

        // fetch tasks for all projects
        const taskResults = await Promise.all(
          projects.map(p => getTasks(orgId, p.id))
        )
        const allTasks = taskResults.flatMap(r => r.data)

        setStats({
          projects: projects.length,
          activeTasks: allTasks.filter(t => t.status !== 'done').length,
          members: membersRes.data.length,
          completed: allTasks.filter(t => t.status === 'done').length,
        })
      } catch (err) {
        console.error('Dashboard fetch error', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Total Projects', value: stats.projects, icon: '◫' },
    { label: 'Active Tasks', value: stats.activeTasks, icon: '✓' },
    { label: 'Team Members', value: stats.members, icon: '◎' },
    { label: 'Completed Tasks', value: stats.completed, icon: '▦' },
  ]

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-8">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">Welcome back — here's what's going on.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm">{stat.label}</span>
                <span className="text-indigo-400 text-lg">{stat.icon}</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {loading ? '...' : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Recent Projects</h3>
          {loading ? (
            <div className="text-slate-500 text-sm text-center py-10">Loading...</div>
          ) : recentProjects.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-10">
              No projects yet. Create your first project to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{project.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {project.description || 'No description.'}
                    </p>
                  </div>
                  <span className="text-xs bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

export default Dashboard