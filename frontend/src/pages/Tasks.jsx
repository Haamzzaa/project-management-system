import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { getOrganizations } from '../api/organizations'
import { getProjects } from '../api/projects'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks'
import TaskPanel from '../components/TaskPanel'

const STATUS_COLUMNS = ['todo', 'in_progress', 'done']

const statusLabel = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

const statusColors = {
  todo: 'bg-slate-700 text-slate-300',
  in_progress: 'bg-indigo-600/20 text-indigo-400',
  done: 'bg-emerald-600/20 text-emerald-400',
}

const priorityColors = {
  low: 'text-slate-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
}

const Tasks = () => {
  const [organizations, setOrganizations] = useState([])
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
  })
  const [selectedTask, setSelectedTask] = useState(null)

  // Fetch orgs on mount
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
      try {
        const res = await getProjects(selectedOrg.id)
        setProjects(res.data)
        if (res.data.length > 0) setSelectedProject(res.data[0])
      } catch {
        setError('Failed to load projects.')
      }
    }
    fetchProjects()
  }, [selectedOrg])

  // Fetch tasks when project changes
  useEffect(() => {
    if (!selectedProject) return
    const fetchTasks = async () => {
      setLoading(true)
      try {
        const res = await getTasks(selectedOrg.id, selectedProject.id)
        setTasks(res.data)
      } catch {
        setError('Failed to load tasks.')
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [selectedProject])

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      const res = await createTask(selectedOrg.id, selectedProject.id, newTask)
      setTasks([...tasks, res.data])
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium' })
      setShowForm(false)
    } catch {
      setError('Failed to create task.')
    }
  }

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await updateTask(selectedOrg.id, selectedProject.id, task.id, { status: newStatus })
      setTasks(tasks.map(t => t.id === task.id ? res.data : t))
    } catch {
      setError('Failed to update task.')
    }
  }

  const handleDelete = async (task) => {
    try {
      await deleteTask(selectedOrg.id, selectedProject.id, task.id)
      setTasks(tasks.filter(t => t.id !== task.id))
    } catch {
      setError('Failed to delete task.')
    }
  }

  const tasksByStatus = (status) => tasks.filter(t => t.status === status)

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Tasks</h2>
            <p className="text-slate-400 text-sm mt-1">Manage tasks across your projects</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
          >
            + New Task
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Selectors */}
        <div className="flex gap-4 mb-6">
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
          {projects.length > 0 && (
            <select
              value={selectedProject?.id}
              onChange={(e) => setSelectedProject(projects.find(p => p.id === parseInt(e.target.value)))}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Create Task Form */}
        {showForm && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex gap-3">
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  Create Task
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

        {/* Kanban Board */}
        {loading ? (
          <div className="text-slate-500 text-sm text-center py-10">Loading tasks...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STATUS_COLUMNS.map((status) => (
              <div key={status} className="bg-slate-900 border border-slate-800 rounded-xl p-4">

                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[status]}`}>
                    {statusLabel[status]}
                  </span>
                  <span className="text-slate-500 text-xs">{tasksByStatus(status).length}</span>
                </div>

                {/* Task Cards */}
                <div className="space-y-3">
                  {tasksByStatus(status).length === 0 ? (
                    <p className="text-slate-600 text-xs text-center py-6">No tasks</p>
                  ) : (
                    tasksByStatus(status).map((task) => (
                      <div key={task.id} onClick={() => setSelectedTask(task)} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-indigo-500 transition cursor-pointer">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-white text-sm font-medium">{task.title}</h4>
                          <button
                            onClick={() => handleDelete(task)}
                            className="text-slate-600 hover:text-red-400 text-xs transition shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                        {task.description && (
                          <p className="text-slate-400 text-xs mb-3">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>
                            ● {task.priority}
                          </span>
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task, e.target.value)}
                            className="bg-slate-700 border border-slate-600 text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <TaskPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          orgId={selectedOrg?.id}
          projectId={selectedProject?.id}
        />

      </main>
    </div>
  )
}

export default Tasks