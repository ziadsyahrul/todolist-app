/**
 * Property test for useTodos — deleteTodo
 *
 * Property 9: Penghapusan todo menghilangkan todo dari list
 * Validates: Requirements 4.2
 *
 * For any non-empty todo list, calling deleteTodo(id) with an existing id
 * must result in a todo list that no longer contains the todo with that id,
 * and the list length must decrease by exactly one.
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

// --- Property 9: Penghapusan todo menghilangkan todo dari list ---

describe('Property 9: Penghapusan todo menghilangkan todo dari list', () => {
  /**
   * Validates: Requirements 4.2
   *
   * For any non-empty todo list, calling deleteTodo(id) with an existing id must:
   * - Remove the todo with that id from todos.value
   * - Decrease todos.value.length by exactly 1
   */

  it('menghapus satu-satunya todo dari list menghasilkan list kosong', () => {
    const todo = { id: randomId(), text: 'Satu-satunya todo', completed: false }
    seedTodos([todo])

    const { todos, deleteTodo } = useTodos()
    expect(todos.value.length).toBe(1)

    deleteTodo(todo.id)

    expect(todos.value.length).toBe(0)
    expect(todos.value.find(t => t.id === todo.id)).toBeUndefined()
  })

  it('menghapus todo pertama dari list berisi banyak item', () => {
    const existingTodos = [randomTodo(), randomTodo(), randomTodo()]
    seedTodos(existingTodos)

    const { todos, deleteTodo } = useTodos()
    const targetId = todos.value[0].id
    const before = todos.value.length

    deleteTodo(targetId)

    expect(todos.value.length).toBe(before - 1)
    expect(todos.value.find(t => t.id === targetId)).toBeUndefined()
  })

  it('menghapus todo terakhir dari list berisi banyak item', () => {
    const existingTodos = [randomTodo(), randomTodo(), randomTodo()]
    seedTodos(existingTodos)

    const { todos, deleteTodo } = useTodos()
    const targetId = todos.value[todos.value.length - 1].id
    const before = todos.value.length

    deleteTodo(targetId)

    expect(todos.value.length).toBe(before - 1)
    expect(todos.value.find(t => t.id === targetId)).toBeUndefined()
  })

  it('todo lain tidak terpengaruh setelah penghapusan', () => {
    const existingTodos = [randomTodo(), randomTodo(), randomTodo()]
    seedTodos(existingTodos)

    const { todos, deleteTodo } = useTodos()
    const targetId = todos.value[1].id
    const remainingIds = todos.value
      .filter(t => t.id !== targetId)
      .map(t => t.id)

    deleteTodo(targetId)

    for (const id of remainingIds) {
      expect(todos.value.find(t => t.id === id)).toBeDefined()
    }
  })

  // Property-based: run many random cases
  it('property test — deleteTodo selalu menghilangkan todo dari list dan mengurangi panjang sebesar satu (100 runs)', () => {
    const NUM_RUNS = 100

    for (let run = 0; run < NUM_RUNS; run++) {
      // Reset storage for each run
      localStorageMock.clear()

      // Seed with a non-empty list of random todos
      const existingTodos = randomNonEmptyTodoList()
      seedTodos(existingTodos)

      const { todos, deleteTodo } = useTodos()
      const before = todos.value.length

      // Pick a random todo from the list
      const randomIndex = Math.floor(Math.random() * todos.value.length)
      const targetId = todos.value[randomIndex].id

      deleteTodo(targetId)

      // Length must decrease by exactly 1
      expect(todos.value.length).toBe(before - 1)

      // The deleted todo must no longer be in the list
      expect(todos.value.find(t => t.id === targetId)).toBeUndefined()

      // All other todos must still be present
      for (const todo of existingTodos) {
        if (todo.id !== targetId) {
          expect(todos.value.find(t => t.id === todo.id)).toBeDefined()
        }
      }
    }
  })
})
