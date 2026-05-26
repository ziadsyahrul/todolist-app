/**
 * Property test for useTodos — whitespace-only input
 *
 * Property 3: Input whitespace-only tidak mengubah todo list
 * Validates: Requirements 1.4
 *
 * For any string consisting only of whitespace characters (spaces, tabs,
 * newlines), calling addTodo with that string must leave the todo list
 * identical to what it was before the call (same length, same content).
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

/** Whitespace characters to sample from */
const WHITESPACE_CHARS = [' ', '\t', '\n', '\r', '\f', '\v']

/**
 * Generate a random non-empty string consisting only of whitespace characters.
 * Length is between 1 and 20.
 */
function randomWhitespaceString() {
  const len = 1 + Math.floor(Math.random() * 20)
  return Array.from(
    { length: len },
    () => WHITESPACE_CHARS[Math.floor(Math.random() * WHITESPACE_CHARS.length)]
  ).join('')
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
 * Generate a random valid (non-whitespace) todo text.
 */
function randomValidText() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const len = 1 + Math.floor(Math.random() * 30)
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/**
 * Generate a random todo object with a valid text.
 */
function randomTodo() {
  return {
    id: randomId(),
    text: randomValidText(),
    completed: Math.random() < 0.5,
  }
}

/**
 * Seed the localStorage mock with a pre-existing todo list so that
 * useTodos() initialises with known state.
 */
function seedTodos(todos) {
  localStorageMock.setItem('todolist-app-todos', JSON.stringify(todos))
}

/**
 * Deep-clone a plain object/array via JSON round-trip.
 */
function deepClone(value) {
  return JSON.parse(JSON.stringify(value))
}

// --- Property 3: whitespace-only input does not mutate the todo list ---

describe('Property 3: Input whitespace-only tidak mengubah todo list', () => {
  /**
   * Validates: Requirements 1.4
   *
   * For any whitespace-only string, addTodo must be a no-op:
   *   - todos.value.length stays the same
   *   - every existing todo is unchanged (id, text, completed)
   */

  it('addTodo dengan string spasi tunggal tidak mengubah list kosong', () => {
    // Empty list
    const { todos, addTodo } = useTodos()
    const before = deepClone(todos.value)

    addTodo(' ')

    expect(todos.value).toHaveLength(before.length)
    expect(todos.value).toEqual(before)
  })

  it('addTodo dengan string tab tunggal tidak mengubah list kosong', () => {
    const { todos, addTodo } = useTodos()
    const before = deepClone(todos.value)

    addTodo('\t')

    expect(todos.value).toHaveLength(before.length)
    expect(todos.value).toEqual(before)
  })

  it('addTodo dengan newline tidak mengubah list kosong', () => {
    const { todos, addTodo } = useTodos()
    const before = deepClone(todos.value)

    addTodo('\n')

    expect(todos.value).toHaveLength(before.length)
    expect(todos.value).toEqual(before)
  })

  it('addTodo dengan whitespace-only tidak mengubah list yang sudah berisi todo (property test)', () => {
    const NUM_RUNS = 100

    for (let run = 0; run < NUM_RUNS; run++) {
      // Reset storage for each run
      localStorageMock.clear()

      // Seed with 0–10 existing todos
      const existingCount = Math.floor(Math.random() * 11)
      const existingTodos = Array.from({ length: existingCount }, randomTodo)
      seedTodos(existingTodos)

      const { todos, addTodo } = useTodos()

      // Snapshot state before the call
      const lengthBefore = todos.value.length
      const snapshotBefore = deepClone(todos.value)

      // Call addTodo with a random whitespace-only string
      const whitespaceInput = randomWhitespaceString()
      addTodo(whitespaceInput)

      // Length must be unchanged
      expect(todos.value).toHaveLength(lengthBefore)

      // Every existing todo must be structurally identical
      for (let i = 0; i < snapshotBefore.length; i++) {
        expect(todos.value[i].id).toBe(snapshotBefore[i].id)
        expect(todos.value[i].text).toBe(snapshotBefore[i].text)
        expect(todos.value[i].completed).toBe(snapshotBefore[i].completed)
      }
    }
  })

  it('addTodo dengan berbagai kombinasi whitespace tidak mengubah list (edge cases)', () => {
    const whitespaceInputs = [
      '',           // empty string (also whitespace-only after trim)
      ' ',          // single space
      '   ',        // multiple spaces
      '\t',         // tab
      '\t\t',       // multiple tabs
      '\n',         // newline
      '\r\n',       // carriage return + newline
      ' \t\n\r ',   // mixed whitespace
      '\f\v',       // form feed + vertical tab
    ]

    for (const input of whitespaceInputs) {
      localStorageMock.clear()

      // Seed with a couple of todos
      const existingTodos = [randomTodo(), randomTodo()]
      seedTodos(existingTodos)

      const { todos, addTodo } = useTodos()
      const snapshotBefore = deepClone(todos.value)

      addTodo(input)

      expect(todos.value).toHaveLength(snapshotBefore.length)
      expect(todos.value).toEqual(snapshotBefore)
    }
  })
})
