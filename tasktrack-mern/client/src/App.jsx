import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Circle, ClipboardList, LoaderCircle, Plus, Trash2 } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export default function App() {
  // State is React's memory for values that affect what appears on screen.
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // A reusable API helper converts non-2xx HTTP responses into useful errors.
  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Something went wrong.");
    return data;
  }, []);

  // Run once when the component mounts to get saved tasks from the API.
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await request("/tasks");
      setTasks(data);
    } catch (err) {
      setError(`${err.message} Check that the backend is running and VITE_API_URL is correct.`);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function addTask(event) {
    event.preventDefault(); // Stop the browser from reloading the page.
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const newTask = await request("/tasks", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), description: description.trim() })
      });
      setTasks((current) => [newTask, ...current]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    setError("");
    try {
      const updated = await request(`/tasks/${task._id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !task.completed })
      });
      setTasks((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTask(id) {
    setError("");
    try {
      await request(`/tasks/${id}`, { method: "DELETE" });
      setTasks((current) => current.filter((task) => task._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  const visibleTasks = useMemo(() => tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  }), [tasks, filter]);

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="TaskTrack home">
          <span className="brand-mark"><ClipboardList size={21} /></span>
          <span>tasktrack</span>
        </a>
        <span className="top-note"><span className="online-dot" /> Your personal workspace</span>
      </header>

      <section className="hero">
        <p className="eyebrow">YOUR SPACE TO GET THINGS DONE</p>
        <h1>Small steps.<br /><span>Real progress.</span></h1>
        <p className="hero-copy">Keep your priorities clear, capture what matters, and celebrate every task you finish.</p>
      </section>

      <section className="stats-grid" aria-label="Task summary">
        <article className="stat-card">
          <span className="stat-label">All tasks</span>
          <strong>{tasks.length.toString().padStart(2, "0")}</strong>
          <span className="stat-foot">Everything on your list</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">In progress</span>
          <strong>{(tasks.length - completedCount).toString().padStart(2, "0")}</strong>
          <span className="stat-foot">One step at a time</span>
        </article>
        <article className="stat-card stat-accent">
          <span className="stat-label">Completed</span>
          <strong>{completedCount.toString().padStart(2, "0")}</strong>
          <span className="stat-foot">Look how far you've come</span>
        </article>
      </section>

      <section className="workspace">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE PLAN</p>
            <h2>Your task list</h2>
          </div>
          <span className="task-count">{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</span>
        </div>

        <form className="add-form" onSubmit={addTask}>
          <div className="form-title-row">
            <div className="input-icon"><Plus size={19} /></div>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What do you want to get done?"
              aria-label="Task title"
              maxLength={120}
              required
            />
            <button className="add-button" type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />}
              Add task
            </button>
          </div>
          <input
            className="description-input"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add a little detail (optional)"
            aria-label="Task description"
            maxLength={500}
          />
        </form>

        {error && <div className="error-message" role="alert">{error}</div>}

        <div className="filter-row" aria-label="Filter tasks">
          {["all", "active", "completed"].map((item) => (
            <button
              key={item}
              className={`filter-button ${filter === item ? "selected" : ""}`}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item[0].toUpperCase() + item.slice(1)}
              {item === "all" && <span>{tasks.length}</span>}
            </button>
          ))}
          <button className="refresh-button" type="button" onClick={loadTasks} title="Refresh tasks">
            Refresh
          </button>
        </div>

        <div className="task-list">
          {loading ? (
            <div className="empty-state"><LoaderCircle className="spin" size={24} /><p>Loading your tasks…</p></div>
          ) : visibleTasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><ClipboardList size={25} /></span>
              <h3>{filter === "completed" ? "Nothing completed yet" : filter === "active" ? "You're all caught up" : "A fresh start"}</h3>
              <p>{filter === "all" ? "Add your first task above and make today count." : "Try another filter or add a new task."}</p>
            </div>
          ) : visibleTasks.map((task) => (
            <article className={`task-item ${task.completed ? "is-complete" : ""}`} key={task._id}>
              <button className="check-button" type="button" onClick={() => toggleTask(task)} aria-label={task.completed ? "Mark as active" : "Mark as completed"}>
                {task.completed ? <span className="checked-icon"><Check size={15} /></span> : <Circle size={21} />}
              </button>
              <div className="task-content">
                <h3>{task.title}</h3>
                {task.description && <p>{task.description}</p>}
                <span className="task-status">{task.completed ? "COMPLETED" : "IN PROGRESS"}</span>
              </div>
              <button className="delete-button" type="button" onClick={() => deleteTask(task._id)} aria-label={`Delete ${task.title}`} title="Delete task">
                <Trash2 size={17} />
              </button>
            </article>
          ))}
        </div>
        <footer className="list-footer">
          <span><span className="online-dot" /> Saved to your database</span>
          <span>Progress over perfection.</span>
        </footer>
      </section>
      <footer className="page-footer">MADE FOR YOUR NEXT SMALL WIN <span>✳</span></footer>
    </main>
  );
}
