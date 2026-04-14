import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <h1 className="text-white font-bold text-xl tracking-tight">ProjectFlow</h1>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition">
                Sign in
              </Link>
              <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-2xl">
          <span className="text-indigo-400 text-sm font-medium bg-indigo-600/10 border border-indigo-600/20 px-3 py-1 rounded-full">
            Project Management, Simplified
          </span>
          <h2 className="text-5xl font-bold text-white mt-6 leading-tight">
            Manage your team's work in one place
          </h2>
          <p className="text-slate-400 text-lg mt-5 leading-relaxed">
            ProjectFlow helps teams organize projects, track tasks, and collaborate
            seamlessly — all with a clean, distraction-free interface.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition text-sm"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition text-sm">
                  Create free account
                </Link>
                <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition">
                  Already have an account →
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-3xl w-full">
          {[
            { icon: '◫', title: 'Projects', desc: 'Organize work into projects and keep everything structured.' },
            { icon: '✓', title: 'Tasks', desc: 'Track tasks on a kanban board with priorities and statuses.' },
            { icon: '◎', title: 'Teams', desc: 'Invite members to your organization and collaborate in real time.' },
          ].map((f) => (
            <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left">
              <span className="text-indigo-400 text-xl">{f.icon}</span>
              <h3 className="text-white font-semibold mt-3 mb-1">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-slate-600 text-xs py-6 border-t border-slate-800">
        © 2026 ProjectFlow. Built with Django + React.
      </footer>

    </div>
  )
}

export default Home