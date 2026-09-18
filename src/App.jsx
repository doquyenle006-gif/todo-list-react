import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import './App.css'

const STORAGE_KEY = 'lesson-05-todos'
const THEME_KEY = 'lesson-05-theme'

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)

  function saveEdit() {
    const text = draft.trim()
    if (text) onEdit(todo.id, text)
    setIsEditing(false)
  }

  function cancelEdit() {
    setDraft(todo.text)
    setIsEditing(false)
  }

  return (
    <li className={`todo-item${todo.completed ? ' todo-item--completed' : ''}`}>
      <input className="todo-item__checkbox" type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} aria-label={`Đánh dấu ${todo.text} là ${todo.completed ? 'chưa hoàn thành' : 'đã hoàn thành'}`} />
      {isEditing ? <input className="todo-item__edit" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') saveEdit(); if (event.key === 'Escape') cancelEdit() }} aria-label="Chỉnh sửa công việc" autoFocus /> : <span className="todo-item__text">{todo.text}</span>}
      <div className="todo-item__actions">
        {isEditing ? <button type="button" className="icon-button icon-button--save" onClick={saveEdit} aria-label="Lưu thay đổi">Lưu</button> : <button type="button" className="icon-button" onClick={() => setIsEditing(true)} aria-label={`Chỉnh sửa ${todo.text}`}>Sửa</button>}
        <button type="button" className="icon-button icon-button--delete" onClick={() => onDelete(todo.id)} aria-label={`Xóa ${todo.text}`}>Xóa</button>
      </div>
    </li>
  )
}

TodoItem.propTypes = {
  todo: PropTypes.shape({ id: PropTypes.string.isRequired, text: PropTypes.string.isRequired, completed: PropTypes.bool.isRequired }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
}

function TodoList({ todos, onToggle, onDelete, onEdit }) {
  if (!todos.length) return <div className="empty-state" role="status"><span className="empty-state__mark">✓</span><strong>Chưa có công việc</strong><span>Thêm một việc mới để bắt đầu ngày hiệu quả.</span></div>
  return <ul className="todo-list" aria-label="Danh sách công việc">{todos.map((todo) => <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />)}</ul>
}

TodoList.propTypes = { todos: PropTypes.arrayOf(PropTypes.object).isRequired, onToggle: PropTypes.func.isRequired, onDelete: PropTypes.func.isRequired, onEdit: PropTypes.func.isRequired }

function FilterBar({ filter, onFilterChange, search, onSearchChange, onClearCompleted, hasCompleted }) {
  const filters = [['all', 'Tất cả'], ['active', 'Đang làm'], ['completed', 'Đã xong']]
  return <div className="filter-bar"><div className="filter-bar__tabs" role="group" aria-label="Bộ lọc công việc">{filters.map(([value, label]) => <button key={value} type="button" className={`filter-button${filter === value ? ' filter-button--active' : ''}`} onClick={() => onFilterChange(value)} aria-pressed={filter === value}>{label}</button>)}</div><label className="search-field"><span className="sr-only">Tìm công việc</span><input type="search" placeholder="Tìm công việc..." value={search} onChange={(event) => onSearchChange(event.target.value)} /></label><button type="button" className="clear-button" onClick={onClearCompleted} disabled={!hasCompleted}>Xóa việc đã xong</button></div>
}

FilterBar.propTypes = { filter: PropTypes.string.isRequired, onFilterChange: PropTypes.func.isRequired, search: PropTypes.string.isRequired, onSearchChange: PropTypes.func.isRequired, onClearCompleted: PropTypes.func.isRequired, hasCompleted: PropTypes.bool.isRequired }

function Stats({ total, completed, active }) {
  return <div className="stats" aria-label="Thống kê công việc"><div><strong>{total}</strong><span>Tổng số</span></div><div><strong>{active}</strong><span>Đang làm</span></div><div><strong>{completed}</strong><span>Hoàn thành</span></div></div>
}

Stats.propTypes = { total: PropTypes.number.isRequired, completed: PropTypes.number.isRequired, active: PropTypes.number.isRequired }

function App() {
  const [todos, setTodos] = useState(readTodos)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [newTodo, setNewTodo] = useState('')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(THEME_KEY) === 'dark')

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)) }, [todos])
  useEffect(() => { document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'; localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light') }, [darkMode])

  const visibleTodos = useMemo(() => todos.filter((todo) => { const matchesFilter = filter === 'all' || (filter === 'active' && !todo.completed) || (filter === 'completed' && todo.completed); return matchesFilter && todo.text.toLowerCase().includes(search.toLowerCase()) }), [todos, filter, search])
  const completed = todos.filter((todo) => todo.completed).length

  function addTodo(event) {
    event.preventDefault()
    const text = newTodo.trim()
    if (!text) return
    setTodos((current) => [{ id: createId(), text, completed: false }, ...current])
    setNewTodo('')
  }

  return <main className="app-shell">
    <header className="app-header"><div><h1>Việc cần làm<span>.</span></h1><p className="subtitle">Tổ chức ngày hôm nay, hoàn thành từng việc một.</p></div><button type="button" className="theme-button" onClick={() => setDarkMode((value) => !value)} aria-label={darkMode ? 'Bật chế độ sáng' : 'Bật chế độ tối'}>{darkMode ? '☼' : '☾'}</button></header>
    <section className="composer-section" aria-labelledby="composer-title"><div><h2 id="composer-title">Bắt đầu một việc mới</h2><p>Viết ra điều bạn muốn hoàn thành.</p></div><form className="composer" onSubmit={addTodo}><label className="sr-only" htmlFor="new-todo">Tên công việc mới</label><input id="new-todo" value={newTodo} onChange={(event) => setNewTodo(event.target.value)} placeholder="Ví dụ: Hoàn thiện bài tập Lesson 5" maxLength="120" /><button type="submit" disabled={!newTodo.trim()}>Thêm việc <span aria-hidden="true">+</span></button></form></section>
    <section className="workspace" aria-labelledby="list-title"><div className="workspace__heading"><div><p className="eyebrow">MY TASKS</p><h2 id="list-title">Danh sách công việc</h2></div><span className="task-count">{todos.length} việc</span></div><FilterBar filter={filter} onFilterChange={setFilter} search={search} onSearchChange={setSearch} onClearCompleted={() => setTodos((current) => current.filter((todo) => !todo.completed))} hasCompleted={completed > 0} /><TodoList todos={visibleTodos} onToggle={(id) => setTodos((current) => current.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo))} onDelete={(id) => setTodos((current) => current.filter((todo) => todo.id !== id))} onEdit={(id, text) => setTodos((current) => current.map((todo) => todo.id === id ? { ...todo, text } : todo))} /></section>
    <Stats total={todos.length} completed={completed} active={todos.length - completed} />
    <footer>Được xây dựng với React <span aria-hidden="true">·</span> Dữ liệu được lưu tự động trên thiết bị này</footer>
  </main>
}

export default App
