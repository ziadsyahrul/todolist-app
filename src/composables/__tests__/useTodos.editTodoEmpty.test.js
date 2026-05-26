/**
 * Property test for useTodos — editTodo dengan teks kosong
 *
 * Property 6: Konfirmasi edit dengan teks kosong menghapus todo
 * Validates: Requirements 2.4
 *
 * For any todo in the todo list and a string consisting only of whitespace,
 * calling editTodo(id, whitespaceString) must result in the todo with that id
 * no longer being in the todo list, and the list length must decrease by exactly one.
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
 * Generate a random whitespace-only string (spaces, tabs, newlines).
 * Always at least one whitespace character.
 */
function randomWhitespaceString() {
  const whitespaceChars = [' ', '\t', '\n', '\r']
  const len = 1 + Math.floor(Math.random() * 10)
  return Array.from(
    { length: len },
    () => whitespaceChars[Math.floor(Math.random() * whitespaceChars.length)]
  ).join('')
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

// --- Property 6: Konfirmasi edit dengan teks kosong menghapus todo ---

describe('Property 6: Konfirmasi edit dengan teks kosong menghapus todo', () => {
  /**
   * Validates: Requirements 2.4
   *
   * For any todo in the todo list and a whitespace-only string,
   * calling editTodo(id, whitespaceString) must:
   * - Remove the todo with that id from todos.value
   * - Decrease todos.value.length by exactly 1
   */

  it('editTodo dengan string kosong ("") menghapus todo', () => {
    const todo = { id: randomId(), text: 'Todo yang akan dihapus', completed: false }
    seedTodos([todo])

    const { todos, editTodo } = useTodos()
    const before = todos.value.length

    editTodo(todo.id, '')

    expect(todos.value.length).toBe(before - 1)
    expect(todos.value.find(t => t.id === todo.id)).toBeUndefined()
  })

  it('editTodo dengan string spasi saja menghapus todo', () => {
    const todo = { id: randomId(), text: 'Todo yang akan dihapus', completed: false }
    seedTodos([todo])

    const { todos, editTodo } = useTodos()
    const before = todos.value.length

    editTodo(todo.id, '   ')

    expect(todos.value.length).toBe(before - 1)
    expect(todos.value.find(t => t.id === todo.id)).toBeUndefined()
  })

  it('editTodo dengan string tab saja menghapus todo', () => {
    const todo = { id: randomId(), text: 'Todo yang akan dihapus', completed: false }
    seedTodos([todo])

    const { todos, editTodo } = useTodos()
    const before = todos.value.length

    editTodo(todo.id, '\t\t')

    expect(todos.value.length).toBe(before - 1)
    expect(todos.value.find(t => t.id === todo.id)).toBeUndefined()
  })

  it('editTodo dengan whitespace menghapus todo dari list berisi banyak item', () => {
    const existingTodos = [randomTodo(), randomTodo(), randomTodo()]
    seedTodos(existingTodos)

    const { todos, editTodo } = useTodos()
    const targetId = todos.value[1].id
    const before = todos.value.length

    editTodo(targetId, '   ')

    expect(todos.value.length).toBe(before - 1)
    expect(todos.value.find(t => t.id === targetId)).toBeUndefined()
  })

  it('editTodo dengan whitespace tidak menghapus todo lain dalam list', () => {
    const existingTodos = [randomTodo(), randomTodo(), randomTodo()]
    seedTodos(existingTodos)

    const { todos, editTodo } = useTodos()
    const targetId = todos.value[0].id
    const remainingIds = todos.value
      .filter(t => t.id !== targetId)
      .map(t => t.id)

    editTodo(targetId, '  ')

    for (const id of remainingIds) {
      expect(todos.value.find(t => t.id === id)).toBeDefined()
    }
  })

  // Property-based: run many random cases
  it('property test — editTodo dengan whitespace-only selalu menghapus todo dan mengurangi panjang sebesar satu (100 runs)', () => {
    const NUM_RUNS = 100

    for (let run = 0; run < NUM_RUNS; run++) {
      // Reset storage for each run
      localStorageMock.clear()

      // Seed with a non-empty list of random todos
      const existingTodos = randomNonEmptyTodoList()
      seedTodos(existingTodos)

      const { todos, editTodo } = useTodos()
      const before = todos.value.length

      // Pick a random todo from the list
      const randomIndex = Math.floor(Math.random() * todos.value.length)
      const targetId = todos.value[randomIndex].id

      // Generate a whitespace-only string
      const whitespaceText = randomWhitespaceString()

      editTodo(targetId, whitespaceText)

      // Length must decrease by exactly 1
      expect(todos.value.length).toBe(before - 1)

      // The todo must no longer be in the list
      expect(todos.value.find(t => t.id === targetId)).toBeUndefined()
    }
  })
})
