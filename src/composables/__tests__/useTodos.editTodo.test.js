/**
 * Property test for useTodos — editTodo
 *
 * Property 5: Konfirmasi edit menyimpan teks baru
 * Validates: Requirements 2.3
 *
 * For any todo and valid new text (non-empty after trim), calling editTodo(id, newText)
 * must result in the todo with that id having text equal to newText.trim(),
 * and the total count of todos must remain unchanged.
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
 * Ensures the string is non-empty after trim by always including at least one
 * non-whitespace character.
 */
function randomValidText(minLen = 1, maxLen = 60) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
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
 * Generate a random todo object.
 */
function randomTodo() {
  return {
    id: randomId(),
    text: randomValidText(1, 30).trim(), // stored text is always trimmed
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

// --- Property 5: Konfirmasi edit menyimpan teks baru ---

describe('Property 5: Konfirmasi edit menyimpan teks baru', () => {
  /**
   * Validates: Requirements 2.3
   *
   * For any todo and valid new text (non-empty after trim), calling editTodo(id, newText) must:
   * - Update the todo's text to newText.trim()
   * - Leave todos.value.length unchanged
   */

  it('edit todo tunggal menyimpan teks baru', () => {
    const todo = { id: randomId(), text: 'Teks lama', completed: false }
    seedTodos([todo])

    const { todos, editTodo } = useTodos()
    const newText = 'Teks baru'
    const before = todos.value.length

    editTodo(todo.id, newText)

    const edited = todos.value.find(t => t.id === todo.id)
    expect(edited).toBeDefined()
    expect(edited.text).toBe(newText.trim())
    expect(todos.value.length).toBe(before)
  })

  it('edit menyimpan teks yang sudah di-trim', () => {
    const todo = { id: randomId(), text: 'Teks lama', completed: false }
    seedTodos([todo])

    const { todos, editTodo } = useTodos()
    const rawNewText = '   Teks dengan spasi di tepi   '
    const before = todos.value.length

    editTodo(todo.id, rawNewText)

    const edited = todos.value.find(t => t.id === todo.id)
    expect(edited).toBeDefined()
    expect(edited.text).toBe(rawNewText.trim())
    expect(todos.value.length).toBe(before)
  })

  it('edit salah satu todo dari list berisi banyak item tidak mengubah jumlah todo', () => {
    const existingTodos = [randomTodo(), randomTodo(), randomTodo()]
    seedTodos(existingTodos)

    const { todos, editTodo } = useTodos()
    const targetId = todos.value[1].id
    const newText = 'Teks yang diperbarui'
    const before = todos.value.length

    editTodo(targetId, newText)

    expect(todos.value.length).toBe(before)
    const edited = todos.value.find(t => t.id === targetId)
    expect(edited).toBeDefined()
    expect(edited.text).toBe(newText.trim())
  })

  it('edit tidak mengubah status completed todo', () => {
    const todo = { id: randomId(), text: 'Teks lama', completed: true }
    seedTodos([todo])

    const { todos, editTodo } = useTodos()

    editTodo(todo.id, 'Teks baru')

    const edited = todos.value.find(t => t.id === todo.id)
    expect(edited).toBeDefined()
    expect(edited.completed).toBe(true)
  })

  it('edit tidak mengubah todo lain dalam list', () => {
    const existingTodos = [randomTodo(), randomTodo(), randomTodo()]
    seedTodos(existingTodos)

    const { todos, editTodo } = useTodos()
    const targetId = todos.value[0].id
    const otherTodosBefore = todos.value
      .filter(t => t.id !== targetId)
      .map(t => ({ ...t }))

    editTodo(targetId, 'Teks baru untuk todo pertama')

    for (const original of otherTodosBefore) {
      const current = todos.value.find(t => t.id === original.id)
      expect(current).toBeDefined()
      expect(current.text).toBe(original.text)
      expect(current.completed).toBe(original.completed)
    }
  })

  // Property-based: run many random cases
  it('property test — editTodo dengan teks valid selalu menyimpan teks baru dan tidak mengubah jumlah todo (100 runs)', () => {
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

      // Generate a new valid text (different from current to ensure change is detectable)
      const newText = randomValidText()

      editTodo(targetId, newText)

      // Total count must remain unchanged
      expect(todos.value.length).toBe(before)

      // The edited todo must have the trimmed new text
      const edited = todos.value.find(t => t.id === targetId)
      expect(edited).toBeDefined()
      expect(edited.text).toBe(newText.trim())
    }
  })
})
