import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '▦' },
  { label: 'Organizations', path: '/organizations', icon: '⬡' },
  { label: 'Projects', path: '/projects', icon: '◫' },
  { label: 'Tasks', path: '/tasks', icon: '✓' },
  { label: 'Activity', path: '/activity', icon: '◎' },
]

const Sidebar = () => {
  const { logout, user } = useAuth()
  const location = useLocation()

  return (
    <aside className="w-60 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">

      {/* Brand */}
      <div className="px-6 py-5 border-b border-slate-800">
        <h1 className="text-white font-bold text-lg tracking-tight">ProjectFlow</h1>
        <p className="text-slate-500 text-xs mt-0.5">{user?.username ?? 'Workspace'}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                ${isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <span>⇤</span> Logout
        </button>
      </div>

    </aside>
  )
}

export default Sidebar