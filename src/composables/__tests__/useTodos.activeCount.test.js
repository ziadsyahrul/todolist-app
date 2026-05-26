/**
 * Property test for useTodos — activeCount accuracy
 *
 * Property 12: Jumlah todo aktif selalu akurat
 * Validates: Requirements 7.1, 7.2
 *
 * For any todo list, the value of `activeCount` must always equal the number
 * of todos in the list with `completed === false`, regardless of which
 * operations (addTodo, toggleTodo, deleteTodo) have been performed.
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

/**
 * Helper: verify that activeCount equals the number of todos with completed === false.
 */
function assertActiveCountAccurate({ todos, activeCount }) {
  const expected = todos.value.filter(t => !t.completed).length
  expect(activeCount.value).toBe(expected)
}

// --- Property 12: Jumlah todo aktif selalu akurat ---

describe('Property 12: Jumlah todo aktif selalu akurat', () => {
  /**
   * Validates: Requirements 7.1, 7.2
   *
   * activeCount.value must always equal todos.value.filter(t => !t.completed).length
   * after every operation: initial load, addTodo, toggleTodo, deleteTodo.
   */

  it('activeCount akurat pada list kosong', () => {
    const { todos, activeCount } = useTodos()
    assertActiveCountAccurate({ todos, activeCount })
    expect(activeCount.value).toBe(0)
  })

  it('activeCount akurat setelah inisialisasi dari localStorage', () => {
    const existing = randomNonEmptyTodoList()
    seedTodos(existing)

    const { todos, activeCount } = useTodos()
    assertActiveCountAccurate({ todos, activeCount })
  })

  it('activeCount akurat setelah addTodo', () => {
    const existing = randomNonEmptyTodoList()
    seedTodos(existing)

    const { todos, activeCount, addTodo } = useTodos()

    addTodo(randomValidText())
    assertActiveCountAccurate({ todos, activeCount })
  })

  it('activeCount akurat setelah toggleTodo (aktif → selesai)', () => {
    const todo = { id: randomId(), text: 'Todo aktif', completed: false }
    seedTodos([todo])

    const { todos, activeCount, toggleTodo } = useTodos()

    toggleTodo(todo.id)
    assertActiveCountAccurate({ todos, activeCount })
    expect(activeCount.value).toBe(0)
  })

  it('activeCount akurat setelah toggleTodo (selesai → aktif)', () => {
    const todo = { id: randomId(), text: 'Todo selesai', completed: true }
    seedTodos([todo])

    const { todos, activeCount, toggleTodo } = useTodos()

    toggleTodo(todo.id)
    assertActiveCountAccurate({ todos, activeCount })
    expect(activeCount.value).toBe(1)
  })

  it('activeCount akurat setelah deleteTodo pada todo aktif', () => {
    const activeTodo = { id: randomId(), text: 'Todo aktif', completed: false }
    const completedTodo = { id: randomId(), text: 'Todo selesai', completed: true }
    seedTodos([activeTodo, completedTodo])

    const { todos, activeCount, deleteTodo } = useTodos()

    deleteTodo(activeTodo.id)
    assertActiveCountAccurate({ todos, activeCount })
    expect(activeCount.value).toBe(0)
  })

  it('activeCount akurat setelah deleteTodo pada todo selesai', () => {
    const activeTodo = { id: randomId(), text: 'Todo aktif', completed: false }
    const completedTodo = { id: randomId(), text: 'Todo selesai', completed: true }
    seedTodos([activeTodo, completedTodo])

    const { todos, activeCount, deleteTodo } = useTodos()

    deleteTodo(completedTodo.id)
    assertActiveCountAccurate({ todos, activeCount })
    expect(activeCount.value).toBe(1)
  })

  it('activeCount akurat setelah serangkaian operasi campuran', () => {
    const existing = [
      { id: randomId(), text: 'Todo A', completed: false },
      { id: randomId(), text: 'Todo B', completed: true },
      { id: randomId(), text: 'Todo C', completed: false },
    ]
    seedTodos(existing)

    const { todos, activeCount, addTodo, toggleTodo, deleteTodo } = useTodos()

    // After initial load
    assertActiveCountAccurate({ todos, activeCount })

    // Add a new todo
    addTodo('Todo baru')
    assertActiveCountAccurate({ todos, activeCount })

    // Toggle an active todo to completed
    toggleTodo(existing[0].id)
    assertActiveCountAccurate({ todos, activeCount })

    // Toggle a completed todo to active
    toggleTodo(existing[1].id)
    assertActiveCountAccurate({ todos, activeCount })

    // Delete a todo
    deleteTodo(existing[2].id)
    assertActiveCountAccurate({ todos, activeCount })
  })

  // Property-based: run many random cases with random sequences of operations
  it('property test — activeCount selalu akurat setelah operasi acak (100 runs)', () => {
    const NUM_RUNS = 100

    for (let run = 0; run < NUM_RUNS; run++) {
      localStorageMock.clear()

      // Seed with a random list (0–10 todos)
      const existingCount = Math.floor(Math.random() * 11)
      const existing = Array.from({ length: existingCount }, randomTodo)
      if (existing.length > 0) {
        seedTodos(existing)
      }

      const { todos, activeCount, addTodo, toggleTodo, deleteTodo } = useTodos()

      // Verify accuracy at initial state
      assertActiveCountAccurate({ todos, activeCount })

      // Perform a random sequence of 1–5 operations
      const numOps = 1 + Math.floor(Math.random() * 5)
      for (let op = 0; op < numOps; op++) {
        const opType = Math.floor(Math.random() * 3) // 0=add, 1=toggle, 2=delete

        if (opType === 0) {
          // addTodo with a valid text
          addTodo(randomValidText())
        } else if (opType === 1 && todos.value.length > 0) {
          // toggleTodo on a random existing todo
          const idx = Math.floor(Math.random() * todos.value.length)
          toggleTodo(todos.value[idx].id)
        } else if (opType === 2 && todos.value.length > 0) {
          // deleteTodo on a random existing todo
          const idx = Math.floor(Math.random() * todos.value.length)
          deleteTodo(todos.value[idx].id)
        }

        // After every operation, activeCount must match the actual count
        assertActiveCountAccurate({ todos, activeCount })
      }
    }
  })
})
