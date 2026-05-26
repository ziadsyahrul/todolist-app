/**
 * Property tests for useTodos.js — addTodo
 *
 * Property 1: Penambahan todo yang valid menambah panjang list
 * Validates: Requirements 1.2
 *
 * For any todo list and valid text (non-empty after trim), calling addTodo(text)
 * must result in a todo list whose length increased by one, and the last todo
 * must have the trimmed text and completed: false.
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
 * Generate a random non-empty string (valid todo text).
 * Ensures the string is non-empty after trim by always including at least one
 * non-whitespace character.
 */
function randomValidText(minLen = 1, maxLen = 60) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const spaces = '   '
  // Build a core of non-whitespace chars, optionally surrounded by spaces
  const coreLen = minLen + Math.floor(Math.random() * (maxLen - minLen + 1))
  const core = Array.from(
    { length: coreLen },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('')
  // Randomly add leading/trailing spaces to test trimming
  const leadingSpaces = ' '.repeat(Math.floor(Math.random() * 4))
  const trailingSpaces = ' '.repeat(Math.floor(Math.random() * 4))
  return leadingSpaces + core + trailingSpaces
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
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const len = 3 + Math.floor(Math.random() * 20)
  const text = Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return {
    id: randomId(),
    text,
    completed: Math.random() < 0.5,
  }
}

/**
 * Pre-populate localStorage so useTodos() initialises with existing todos.
 */
function seedLocalStorage(todos) {
  localStorageMock.setItem('todolist-app-todos', JSON.stringify(todos))
}

// --- Property 1: Penambahan todo yang valid menambah panjang list ---

describe('Property 1: Penambahan todo yang valid menambah panjang list', () => {
  /**
   * Validates: Requirements 1.2
   *
   * For any todo list and valid text (non-empty after trim):
   * - todos.value.length increases by exactly 1
   * - the last todo has text equal to the trimmed input
   * - the last todo has completed === false
   */

  it('menambah satu todo ke list kosong', () => {
    const { todos, addTodo } = useTodos()
    const text = 'Belajar Vue 3'
    const before = todos.value.length

    addTodo(text)

    expect(todos.value.length).toBe(before + 1)
    expect(todos.value[todos.value.length - 1].text).toBe(text.trim())
    expect(todos.value[todos.value.length - 1].completed).toBe(false)
  })

  it('menambah satu todo ke list yang sudah berisi item', () => {
    const existing = [randomTodo(), randomTodo()]
    seedLocalStorage(existing)

    const { todos, addTodo } = useTodos()
    const text = 'Todo baru'
    const before = todos.value.length

    addTodo(text)

    expect(todos.value.length).toBe(before + 1)
    expect(todos.value[todos.value.length - 1].text).toBe(text.trim())
    expect(todos.value[todos.value.length - 1].completed).toBe(false)
  })

  it('teks todo tersimpan dalam bentuk yang sudah di-trim', () => {
    const { todos, addTodo } = useTodos()
    const rawText = '   Teks dengan spasi di tepi   '

    addTodo(rawText)

    const last = todos.value[todos.value.length - 1]
    expect(last.text).toBe(rawText.trim())
    expect(last.completed).toBe(false)
  })

  // Property-based: run many random cases
  it('property test — teks valid acak selalu menambah panjang list sebesar satu (100 runs)', () => {
    const NUM_RUNS = 100

    for (let run = 0; run < NUM_RUNS; run++) {
      // Fresh state for each run
      localStorageMock.clear()

      // Seed with a random number of existing todos (0–10)
      const existingCount = Math.floor(Math.random() * 11)
      const existing = Array.from({ length: existingCount }, randomTodo)
      if (existing.length > 0) {
        seedLocalStorage(existing)
      }

      const { todos, addTodo } = useTodos()
      const before = todos.value.length
      const text = randomValidText()

      addTodo(text)

      // Length must increase by exactly 1
      expect(todos.value.length).toBe(before + 1)

      // Last todo must have trimmed text
      const last = todos.value[todos.value.length - 1]
      expect(last.text).toBe(text.trim())

      // Last todo must be active (not completed)
      expect(last.completed).toBe(false)
    }
  })
})
