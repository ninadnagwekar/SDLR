'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from '../../components/StatusBadge';
import {
  createEscalation,
  fetchAuditLogs,
  fetchEscalationHistory,
  fetchOverdueTasks,
  fetchTasks,
  triggerNotification,
  updateEscalationStatus,
} from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (currentUser) => {
    setLoading(true);
    setError('');

    try {
      const taskData = await fetchTasks();
      setTasks(taskData);

      if (currentUser.role === 'manager' || currentUser.role === 'admin') {
        const overdue = await fetchOverdueTasks();
        setOverdueTasks(overdue);
      }

      const history = await fetchEscalationHistory();
      setEscalations(history);

      if (currentUser.role === 'admin') {
        const logs = await fetchAuditLogs();
        setAuditLogs(logs);
      }
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('Authentication')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    loadData(parsedUser);
  }, [router, loadData]);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.replace('/login');
  }

  async function handleEscalate(taskId) {
    setMessage('');
    setError('');
    try {
      const escalation = await createEscalation(taskId, 'Automatically escalated from dashboard');
      setMessage(`Escalation ${escalation.id} created`);
      if (user) await loadData(user);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleNotify(escalationId) {
    setMessage('');
    setError('');
    try {
      const result = await triggerNotification(escalationId);
      setMessage(result.message);
      if (user) await loadData(user);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatusChange(id, status) {
    setMessage('');
    setError('');
    try {
      await updateEscalationStatus(id, status);
      setMessage(`Escalation ${id} updated to ${status}`);
      if (user) await loadData(user);
    } catch (err) {
      setError(err.message);
    }
  }

  const canManage = user?.role === 'manager' || user?.role === 'admin';

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Smart Task Escalation Engine</h1>
            <p className="text-sm text-slate-500">
              {user.email} · <span className="capitalize">{user.role}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {(message || error) && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              error ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}
          >
            {error || message}
          </div>
        )}

        {loading && <p className="text-slate-500">Refreshing data...</p>}

        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-medium mb-4">My Tasks</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="pb-2 pr-4">Title</th>
                  <th className="pb-2 pr-4">Due</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium">{task.title}</td>
                    <td className="py-3 pr-4 text-slate-600">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={task.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {canManage && (
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-medium mb-4">Overdue Tasks</h2>
            {overdueTasks.length === 0 ? (
              <p className="text-slate-500 text-sm">No overdue tasks.</p>
            ) : (
              <ul className="space-y-3">
                {overdueTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-red-50 border border-red-100"
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-slate-600">{task.id}</p>
                    </div>
                    <button
                      onClick={() => handleEscalate(task.id)}
                      className="text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Escalate
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-medium mb-4">Escalation History</h2>
          {escalations.length === 0 ? (
            <p className="text-slate-500 text-sm">No escalations yet.</p>
          ) : (
            <div className="space-y-3">
              {escalations.map((esc) => (
                <div
                  key={esc.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border border-slate-100"
                >
                  <div>
                    <p className="font-medium">{esc.id}</p>
                    <p className="text-sm text-slate-600">
                      Task {esc.taskId} · {esc.reason}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(esc.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={esc.status} />
                    {canManage && esc.status === 'OPEN' && (
                      <>
                        <button
                          onClick={() => handleNotify(esc.id)}
                          className="text-xs px-2 py-1 rounded bg-slate-800 text-white hover:bg-slate-900"
                        >
                          Notify
                        </button>
                        <button
                          onClick={() => handleStatusChange(esc.id, 'IN_PROGRESS')}
                          className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
                        >
                          Start
                        </button>
                      </>
                    )}
                    {canManage && esc.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusChange(esc.id, 'RESOLVED')}
                        className="text-xs px-2 py-1 rounded border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {user.role === 'admin' && (
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-medium mb-4">Audit Log</h2>
            <ul className="space-y-2 text-sm">
              {auditLogs.slice(0, 10).map((log) => (
                <li key={log.id} className="flex justify-between gap-4 text-slate-600">
                  <span>
                    <span className="font-medium text-slate-800">{log.action}</span>
                    {log.metadata?.escalationId && ` · ${log.metadata.escalationId}`}
                  </span>
                  <span className="text-xs">{new Date(log.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
