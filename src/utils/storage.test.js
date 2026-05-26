/**
 * Property tests for storage.js
 *
 * Property 11: Persistensi localStorage adalah round-trip
 * Validates: Requirements 6.1, 6.2, 6.3
 *
 * For any todo list (including empty list), calling saveTodos(todos) followed
 * by loadTodos() must return an array that is structurally identical to the
 * saved todo list (same id, text, and completed for every element).
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { loadTodos, saveTodos } from './storage.js'

// --- localStorage mock ---
// jsdom is not available in node environment, so we provide a simple in-memory mock.
function createLocalStorageMock() {
  let store = {}
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
    },
    setItem(key, value) {
      store[key] = String(value)
    },
    removeItem(key) {
      delete store[key]
    },
    clear() {
      store = {}
    },
  }
}

const localStorageMock = createLocalStorageMock()

// Stub global localStorage before each test
beforeEach(() => {
  localStorageMock.clear()
  globalThis.localStorage = localStorageMock
})

// --- Generators ---

/**
 * Generate a random string of given length from a character set.
 */
function randomString(minLen = 1, maxLen = 40) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '
  const len = minLen + Math.floor(Math.random() * (maxLen - minLen + 1))
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/**
 * Generate a random UUID-like string.
 */
function randomId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16)
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Generate a single random todo object.
 */
function randomTodo() {
  return {
    id: randomId(),
    text: randomString(1, 60),
    completed: Math.random() < 0.5,
  }
}

/**
 * Generate an array of random todos with a given length.
 */
function randomTodoArray(length) {
  return Array.from({ length }, randomTodo)
}

// --- Property 11: localStorage round-trip ---

describe('Property 11: Persistensi localStorage adalah round-trip', () => {
  /**
   * Validates: Requirements 6.1, 6.2, 6.3
   *
   * For any todo list, saveTodos followed by loadTodos must return a
   * structurally identical array.
   */

  it('round-trip preserves an empty todo list', () => {
    saveTodos([])
    const result = loadTodos()
    expect(result).toEqual([])
  })

  it('round-trip preserves a single todo', () => {
    const todos = [randomTodo()]
    saveTodos(todos)
    const result = loadTodos()
    expect(result).toEqual(todos)
  })

  // Property-based: run many random cases
  it('round-trip is structurally identical for random todo arrays (property test)', () => {
    const NUM_RUNS = 100

    for (let run = 0; run < NUM_RUNS; run++) {
      // Vary list length: 0 to 20 todos
      const length = Math.floor(Math.random() * 21)
      const todos = randomTodoArray(length)

      localStorageMock.clear()
      saveTodos(todos)
      const result = loadTodos()

      // Same length
      expect(result).toHaveLength(todos.length)

      // Each element is structurally identical
      for (let i = 0; i < todos.length; i++) {
        expect(result[i].id).toBe(todos[i].id)
        expect(result[i].text).toBe(todos[i].text)
        expect(result[i].completed).toBe(todos[i].completed)
      }
    }
  })

  it('round-trip preserves completed status correctly', () => {
    const todos = [
      { id: randomId(), text: 'active task', completed: false },
      { id: randomId(), text: 'done task', completed: true },
    ]
    saveTodos(todos)
    const result = loadTodos()
    expect(result[0].completed).toBe(false)
    expect(result[1].completed).toBe(true)
  })

  it('loadTodos returns empty array when localStorage has no data', () => {
    // Nothing saved — localStorage is clear from beforeEach
    const result = loadTodos()
    expect(result).toEqual([])
  })

  it('loadTodos returns empty array when localStorage contains invalid JSON', () => {
    localStorageMock.setItem('todolist-app-todos', 'not-valid-json{{{')
    const result = loadTodos()
    expect(result).toEqual([])
  })
})
