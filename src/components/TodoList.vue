<template>
  <div class="list-wrapper">
    <VueDraggable
      v-if="todos.length > 0"
      v-model="draggableTodos"
      tag="ul"
      handle=".drag-handle"
      animation="200"
      ghost-class="ghost"
    >
      <TodoItem
        v-for="todo in draggableTodos"
        :key="todo.id"
        :todo="todo"
        @toggle-todo="emit('toggle-todo', $event)"
        @delete-todo="emit('delete-todo', $event)"
        @edit-todo="emit('edit-todo', $event)"
      />
    </VueDraggable>

    <Transition name="empty">
      <div v-if="todos.length === 0" class="empty">
        <p>Tidak ada tugas 🎉</p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import TodoItem from './TodoItem.vue'

const props = defineProps({ todos: { type: Array, required: true } })
const emit = defineEmits(['toggle-todo', 'delete-todo', 'edit-todo', 'reorder'])

const draggableTodos = computed({
  get: () => props.todos,
  set: (val) => emit('reorder', val)
})
</script>

<style scoped>
.list-wrapper { margin-bottom: 16px; }
ul { padding: 0; list-style: none; }

.empty {
  text-align: center;
  padding: 32px;
  color: #a1a1aa;
  font-size: 14px;
  background: #fff;
  border: 1.5px dashed #e5e5e5;
  border-radius: 10px;
}

.ghost {
  opacity: 0.4;
  background: #f4f4f5;
  border: 1.5px dashed #a1a1aa;
}

.empty-enter-active { transition: all 0.3s ease; }
.empty-enter-from { opacity: 0; transform: translateY(8px); }

/* animasi todo */
.todo-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.todo-leave-active { transition: all 0.2s ease-in; }
.todo-enter-from { opacity: 0; transform: translateY(-12px) scale(0.97); }
.todo-leave-to { opacity: 0; transform: translateX(20px) scale(0.97); }
.todo-move { transition: transform 0.3s ease; }
</style>