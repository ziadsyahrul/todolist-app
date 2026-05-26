import { ref, computed, watch } from 'vue'
import { loadTodos, saveTodos } from '../utils/storage'

export function useTodos() {
  const todos = ref(loadTodos())
  const filter = ref('all')

  const filteredTodos = computed(() => {
    if (filter.value === 'active') return todos.value.filter(t => !t.completed)
    if (filter.value === 'completed') return todos.value.filter(t => t.completed)
    return todos.value
  })

  const activeCount = computed(() => todos.value.filter(t => !t.completed).length)

  watch(todos, (val) => {
    saveTodos(val)

    // trigger confetti kalau semua selesai dan list tidak kosong
    if (val.length > 0 && val.every(t => t.completed)) {
      triggerConfetti()
    }
  }, { deep: true })

  function triggerConfetti() {
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#1c1c1c', '#a1a1aa', '#e5e5e5', '#facc15', '#4ade80']
      })

      // tembak lagi dari kiri dan kanan biar lebih meriah
      setTimeout(() => {
        confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.6 } })
        confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.6 } })
      }, 300)
    })
  }

  function addTodo(text, priority = 'sedang') {
    const trimmed = text.trim()
    if (!trimmed) return
    todos.value.push({
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
      priority
    })
  }

  function deleteTodo(id) {
    todos.value = todos.value.filter(t => t.id !== id)
  }

  function toggleTodo(id) {
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.completed = !todo.completed
  }

  function editTodo(id, newText) {
    const trimmed = newText.trim()
    if (!trimmed) { deleteTodo(id); return }
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.text = trimmed
  }

  function setFilter(newFilter) {
    filter.value = newFilter
  }

  function reorderTodos(newOrder) {
    todos.value = newOrder
  }

  return {
    todos, filteredTodos, activeCount, filter,
    addTodo, deleteTodo, toggleTodo, editTodo, setFilter, reorderTodos
  }
}