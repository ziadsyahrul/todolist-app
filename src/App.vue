<template>
  <div>
    <div class="header">
      <h1>Todo List</h1>
      <button class="theme-toggle" @click="toggleTheme">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </div>
    <TodoInput @add-todo="({ text, priority }) => addTodo(text, priority)" />
    <TodoList
      :todos="filteredTodos"
      @toggle-todo="toggleTodo"
      @delete-todo="deleteTodo"
      @edit-todo="(e) => editTodo(e.id, e.newText)"
      @reorder="reorderTodos"
    />
    <TodoFooter
      :active-count="activeCount"
      :current-filter="filter"
      @change-filter="setFilter"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTodos } from './composables/useTodos'
import TodoInput from './components/TodoInput.vue'
import TodoList from './components/TodoList.vue'
import TodoFooter from './components/TodoFooter.vue'

const {
  filteredTodos, activeCount, filter,
  addTodo, deleteTodo, toggleTodo, editTodo, setFilter, reorderTodos
} = useTodos()

const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (saved === 'dark' || (!saved && prefersDark)) {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.header h1 { margin-bottom: 0; }

.theme-toggle {
  background: none;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 18px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.theme-toggle:hover { border-color: var(--border-hover); }
</style>