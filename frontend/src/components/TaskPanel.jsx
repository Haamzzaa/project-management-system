import { useEffect, useState, useRef } from 'react'
import { getComments, createComment, deleteComment } from '../api/comments'

const priorityColors = {
  low: 'text-slate-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
}

const statusColors = {
  todo: 'bg-slate-700 text-slate-300',
  in_progress: 'bg-indigo-600/20 text-indigo-400',
  done: 'bg-emerald-600/20 text-emerald-400',
}

const statusLabel = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

const TaskPanel = ({ task, onClose, orgId, projectId }) => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!task) return
    const fetchComments = async () => {
      setLoading(true)
      try {
        const res = await getComments(orgId, projectId, task.id)
        setComments(res.data)
      } catch {
        setError('Failed to load comments.')
      } finally {
        setLoading(false)
      }
    }
    fetchComments()
  }, [task])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      const res = await createComment(orgId, projectId, task.id, { content: newComment })
      setComments([...comments, res.data])
      setNewComment('')
    } catch {
      setError('Failed to post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(orgId, projectId, task.id, commentId)
      setComments(comments.filter(c => c.id !== commentId))
    } catch {
      setError('Failed to delete comment.')
    }
  }

  if (!task) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 z-50 flex flex-col shadow-2xl">

        {/* Panel Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex-1 pr-4">
            <h3 className="text-white font-semibold text-lg leading-snug">{task.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[task.status]}`}>
                {statusLabel[task.status]}
              </span>
              <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>
                ● {task.priority}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition text-xl leading-none">
            ✕
          </button>
        </div>

        {/* Description */}
        {task.description && (
          <div className="px-6 py-4 border-b border-slate-800">
            <p className="text-slate-400 text-sm leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Comments Section */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <h4 className="text-slate-300 text-sm font-semibold">
            Comments {comments.length > 0 && `(${comments.length})`}
          </h4>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-slate-500 text-sm text-center py-6">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-6">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {comment.author?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs font-semibold">
                      {comment.author?.username ?? 'Unknown'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-xs">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-slate-600 hover:text-red-400 text-xs transition opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm mt-1 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Comment Input */}
        <div className="px-6 py-4 border-t border-slate-800">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
            >
              {submitting ? '...' : 'Send'}
            </button>
          </form>
        </div>

      </div>
    </>
  )
}

export default TaskPanel
