/**
 * Property test for useTodos — filteredTodos
 *
 * Property 10: Filter menampilkan subset yang tepat
 * Validates: Requirements 5.2, 5.3, 5.4
 *
 * For any todo list with a mix of active and completed todos:
 * - Filter 'all'       → returns all todos (length equals full list)
 * - Filter 'active'    → returns only todos with completed === false
 * - Filter 'completed' → returns only todos with completed === true
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
 * Generate a random todo object with a given completed status.
 */
function randomTodo(completed = Math.random() < 0.5) {
  return {
    id: randomId(),
    text: randomValidText(),
    completed,
  }
}

/**
 * Generate a todo list with a guaranteed mix of active and completed todos.
 * Returns at least one active and one completed todo.
 */
function randomMixedTodoList(minTotal = 2, maxTotal = 15) {
  const total = minTotal + Math.floor(Math.random() * (maxTotal - minTotal + 1))
  const todos = []
  // Guarantee at least one active and one completed
  todos.push(randomTodo(false))
  todos.push(randomTodo(true))
  for (let i = 2; i < total; i++) {
    todos.push(randomTodo())
  }
  // Shuffle so the guaranteed items aren't always first
  for (let i = todos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[todos[i], todos[j]] = [todos[j], todos[i]]
  }
  return todos
}

/**
 * Seed the localStorage mock with a pre-existing todo list so that
 * useTodos() initialises with known state.
 */
function seedTodos(todos) {
  localStorageMock.setItem('todolist-app-todos', JSON.stringify(todos))
}

// --- Property 10: Filter menampilkan subset yang tepat ---

describe('Property 10: Filter menampilkan subset yang tepat', () => {
  /**
   * Validates: Requirements 5.2, 5.3, 5.4
   */

  it("filter 'all' mengembalikan semua todo", () => {
    const todos = randomMixedTodoList()
    seedTodos(todos)

    const { filteredTodos, setFilter } = useTodos()

    setFilter('all')

    expect(filteredTodos.value.length).toBe(todos.length)
  })

  it("filter 'active' mengembalikan hanya todo dengan completed === false", () => {
    const todos = [
      randomTodo(false),
      randomTodo(true),
      randomTodo(false),
      randomTodo(true),
    ]
    seedTodos(todos)

    const { filteredTodos, setFilter } = useTodos()

    setFilter('active')

    const expectedCount = todos.filter(t => !t.completed).length
    expect(filteredTodos.value.length).toBe(expectedCount)
    for (const todo of filteredTodos.value) {
      expect(todo.completed).toBe(false)
    }
  })

  it("filter 'completed' mengembalikan hanya todo dengan completed === true", () => {
    const todos = [
      randomTodo(false),
      randomTodo(true),
      randomTodo(false),
      randomTodo(true),
    ]
    seedTodos(todos)

    const { filteredTodos, setFilter } = useTodos()

    setFilter('completed')

    const expectedCount = todos.filter(t => t.completed).length
    expect(filteredTodos.value.length).toBe(expectedCount)
    for (const todo of filteredTodos.value) {
      expect(todo.completed).toBe(true)
    }
  })

  it("filter 'all' pada list kosong mengembalikan array kosong", () => {
    seedTodos([])

    const { filteredTodos, setFilter } = useTodos()

    setFilter('all')

    expect(filteredTodos.value.length).toBe(0)
  })

  it("filter 'active' pada list yang semua todo-nya selesai mengembalikan array kosong", () => {
    const todos = [randomTodo(true), randomTodo(true), randomTodo(true)]
    seedTodos(todos)

    const { filteredTodos, setFilter } = useTodos()

    setFilter('active')

    expect(filteredTodos.value.length).toBe(0)
  })

  it("filter 'completed' pada list yang semua todo-nya aktif mengembalikan array kosong", () => {
    const todos = [randomTodo(false), randomTodo(false), randomTodo(false)]
    seedTodos(todos)

    const { filteredTodos, setFilter } = useTodos()

    setFilter('completed')

    expect(filteredTodos.value.length).toBe(0)
  })

  it('filter berubah secara reaktif saat setFilter dipanggil', () => {
    const todos = randomMixedTodoList()
    seedTodos(todos)

    const { filteredTodos, setFilter } = useTodos()

    // Start with 'all'
    setFilter('all')
    expect(filteredTodos.value.length).toBe(todos.length)

    // Switch to 'active'
    setFilter('active')
    for (const todo of filteredTodos.value) {
      expect(todo.completed).toBe(false)
    }

    // Switch to 'completed'
    setFilter('completed')
    for (const todo of filteredTodos.value) {
      expect(todo.completed).toBe(true)
    }

    // Switch back to 'all'
    setFilter('all')
    expect(filteredTodos.value.length).toBe(todos.length)
  })

  // Property-based: run many random cases
  it('property test — semua filter mengembalikan subset yang tepat untuk todo list acak (100 runs)', () => {
    const NUM_RUNS = 100

    for (let run = 0; run < NUM_RUNS; run++) {
      localStorageMock.clear()

      const todos = randomMixedTodoList()
      seedTodos(todos)

      const { filteredTodos, setFilter } = useTodos()

      const expectedActive = todos.filter(t => !t.completed)
      const expectedCompleted = todos.filter(t => t.completed)

      // --- Filter 'all' ---
      setFilter('all')
      expect(filteredTodos.value.length).toBe(todos.length)
      // Every todo in the original list must appear in filteredTodos
      for (const todo of todos) {
        expect(filteredTodos.value.some(t => t.id === todo.id)).toBe(true)
      }

      // --- Filter 'active' ---
      setFilter('active')
      expect(filteredTodos.value.length).toBe(expectedActive.length)
      // Every returned todo must be active
      for (const todo of filteredTodos.value) {
        expect(todo.completed).toBe(false)
      }
      // Every active todo from the original list must appear
      for (const todo of expectedActive) {
        expect(filteredTodos.value.some(t => t.id === todo.id)).toBe(true)
      }

      // --- Filter 'completed' ---
      setFilter('completed')
      expect(filteredTodos.value.length).toBe(expectedCompleted.length)
      // Every returned todo must be completed
      for (const todo of filteredTodos.value) {
        expect(todo.completed).toBe(true)
      }
      // Every completed todo from the original list must appear
      for (const todo of expectedCompleted) {
        expect(filteredTodos.value.some(t => t.id === todo.id)).toBe(true)
      }
    }
  })
})
