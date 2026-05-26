// src/utils/storage.js
const STORAGE_KEY = 'todolist-app-todos'

/**
 * Load todos from localStorage.
 * Returns an empty array if no data exists or if parsing fails.
 * @returns {Array} Array of todo objects
 */
export function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Save todos to localStorage as a JSON string.
 * @param {Array} todos - Array of todo objects to persist
 */
export function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}
