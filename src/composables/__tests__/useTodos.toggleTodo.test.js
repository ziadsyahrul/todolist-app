/**
 * Property test for useTodos — toggleTodo round-trip
 *
 * Property 8: Toggle status adalah operasi round-trip
 * Validates: Requirements 3.2, 3.3
 *
 * For any todo in the todo list, calling toggleTodo twice with the same id
 * must result in the todo's `completed` status being identical to what it was
 * before the first toggle.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useTodos } from '../useTodos.js'

// --- localStorage mock ---
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

beforeEach(() => {
  localStorageMock.clear()
  globalThis.localStorage = localStorageMock
})

// --- Generators ---

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
 * Generate a random valid (non-whitespace) todo text.
 */
function randomValidText() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const len = 1 + Math.floor(Math.random() * 30)
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/**
 * Generate a random todo object.
 */
function randomTodo() {
  return {
    id: randomId(),
    text: randomValidText(),
    completed: Math.random() < 0.5,
  }
}

/**
 * Generate a non-empty array of random todos (1–10 items).
 */
function randomNonEmptyTodoList() {
  const count = 1 + Math.floor(Math.random() * 10)
  return Array.from({ length: count }, randomTodo)
}

/**
 * Seed the localStorage mock with a pre-existing todo list so that
 * useTodos() initialises with known state.
 */
function seedTodos(todos) {
  localStorageMock.setItem('todolist-app-todos', JSON.stringify(todos))
}

// --- Property 8: Toggle status adalah operasi round-trip ---

describe('Property 8: Toggle status adalah operasi round-trip', () => {
  /**
   * Validates: Requirements 3.2, 3.3
   *
   * For any todo in the list, calling toggleTodo(id) twice must restore
   * the original `completed` value:
   *   - After first toggle: completed === !originalCompleted
   *   - After second toggle: completed === originalCompleted
   */

  it('toggle dua kali pada todo aktif (completed: false) mengembalikan ke false', () => {
    const todo = { id: randomId(), text: 'Todo aktif', completed: false }
    seedTodos([todo])

    const { todos, toggleTodo } = useTodos()
    const originalCompleted = todos.value[0].completed

    toggleTodo(todo.id)
    expect(todos.value[0].completed).toBe(!originalCompleted)

    toggleTodo(todo.id)
    expect(todos.value[0].completed).toBe(originalCompleted)
  })

  it('toggle dua kali pada todo selesai (completed: true) mengembalikan ke true', () => {
    const todo = { id: randomId(), text: 'Todo selesai', completed: true }
    seedTodos([todo])

    const { todos, toggleTodo } = useTodos()
    const originalCompleted = todos.value[0].completed

    toggleTodo(todo.id)
    expect(todos.value[0].completed).toBe(!originalCompleted)

    toggleTodo(todo.id)
    expect(todos.value[0].completed).toBe(originalCompleted)
  })

  it('toggle dua kali tidak mengubah properti lain (id dan text tetap sama)', () => {
    const todo = { id: randomId(), text: 'Teks tidak berubah', completed: false }
    seedTodos([todo])

    const { todos, toggleTodo } = useTodos()

    toggleTodo(todo.id)
    toggleTodo(todo.id)

    expect(todos.value[0].id).toBe(todo.id)
    expect(todos.value[0].text).toBe(todo.text)
  })

  it('toggle dua kali tidak mengubah panjang todo list', () => {
    const existingTodos = randomNonEmptyTodoList()
    seedTodos(existingTodos)

    const { todos, toggleTodo } = useTodos()
    const lengthBefore = todos.value.length

    // Pick a random todo from the list
    const randomIndex = Math.floor(Math.random() * todos.value.length)
    const targetId = todos.value[randomIndex].id

    toggleTodo(targetId)
    toggleTodo(targetId)

    expect(todos.value.length).toBe(lengthBefore)
  })

  // Property-based: run many random cases
  it('property test — toggle dua kali selalu mengembalikan status semula (100 runs)', () => {
    const NUM_RUNS = 100

    for (let run = 0; run < NUM_RUNS; run++) {
      // Reset storage for each run
      localStorageMock.clear()

      // Seed with a non-empty list of random todos
      const existingTodos = randomNonEmptyTodoList()
      seedTodos(existingTodos)

      const { todos, toggleTodo } = useTodos()

      // Pick a random todo from the list
      const randomIndex = Math.floor(Math.random() * todos.value.length)
      const targetId = todos.value[randomIndex].id
      const originalCompleted = todos.value[randomIndex].completed

      // First toggle: status must flip
      toggleTodo(targetId)
      const afterFirstToggle = todos.value.find(t => t.id === targetId)
      expect(afterFirstToggle.completed).toBe(!originalCompleted)

      // Second toggle: status must return to original
      toggleTodo(targetId)
      const afterSecondToggle = todos.value.find(t => t.id === targetId)
      expect(afterSecondToggle.completed).toBe(originalCompleted)

      // Other todos must remain unchanged
      for (const todo of todos.value) {
        if (todo.id !== targetId) {
          const original = existingTodos.find(t => t.id === todo.id)
          expect(todo.completed).toBe(original.completed)
        }
      }
    }
  })
})
