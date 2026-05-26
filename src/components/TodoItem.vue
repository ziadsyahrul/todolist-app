<template>
  <li :class="['todo-item', { completed: todo.completed }]">
  <div v-if="!isEditing" class="todo-view">
    <span class="drag-handle">⠿</span>
    <input
      type="checkbox"
      :checked="todo.completed"
      @change="emit('toggle-todo', todo.id)"
    />
    <span @dblclick="startEdit">{{ todo.text }}</span>
    <span class="priority-badge" :class="todo.priority">
    {{ priorityLabel }}
    </span>
    <button class="edit-btn" @click="startEdit" title="Edit">✎</button>
    <button class="delete-btn" @click="emit('delete-todo', todo.id)" title="Hapus">✕</button>
  </div>

    <div v-else class="todo-edit">
      <input
        v-model="editText"
        type="text"
        @keyup.enter="confirmEdit"
        @keyup.escape="cancelEdit"
        ref="editInput"
      />
      <div class="edit-actions">
        <button class="confirm-btn" @click="confirmEdit">Simpan</button>
        <button class="cancel-btn" @click="cancelEdit">Batal</button>
      </div>
    </div>
  </li>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'

const props = defineProps({ todo: { type: Object, required: true } })
const emit = defineEmits(['toggle-todo', 'delete-todo', 'edit-todo'])

const isEditing = ref(false)
const editText = ref('')
const editInput = ref(null)

async function startEdit() {
  editText.value = props.todo.text
  isEditing.value = true
  await nextTick()
  editInput.value?.focus()
}

function confirmEdit() {
  emit('edit-todo', { id: props.todo.id, newText: editText.value })
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

const priorityLabel = computed(() => {
  const map = { tinggi: '🔴 Tinggi', sedang: '🟡 Sedang', rendah: '🟢 Rendah' }
  return map[props.todo.priority] || '🟡 Sedang'
})
</script>

<style scoped>
.todo-item {
  list-style: none;
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  margin-bottom: 8px;
  transition: border-color 0.15s, background 0.3s;
}
.todo-item:hover { border-color: var(--border-hover); }
.todo-view {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
}

input[type="checkbox"] {
  width: 17px;
  height: 17px;
  accent-color: var(--text-primary);
  cursor: pointer;
  flex-shrink: 0;
}

span {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  line-height: 1.5;
}
.completed span {
  text-decoration: line-through;
  color: var(--text-muted);
}
.edit-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 15px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.15s;
  line-height: 1;
}

.edit-btn:hover { color: var(--text-secondary); }

.delete-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.15s;
  line-height: 1;
}
.delete-btn:hover { color: #ef4444; }
.todo-edit {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.todo-edit input {
  width: 100%;
  padding: 8px 10px;
  border: 1.5px solid var(--text-muted);
  border-radius: 7px;
  font-size: 14px;
  outline: none;
  color: var(--text-primary);
  background: var(--bg-input);
  transition: border-color 0.15s;
}
.todo-edit input:focus { border-color: var(--text-primary); }
.edit-actions { display: flex; gap: 8px; }

.confirm-btn {
  padding: 6px 14px;
  background: var(--btn-primary);
  color: var(--btn-primary-text);
  border: none;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.confirm-btn:hover { background: var(--btn-primary-hover); }

.cancel-btn {
  padding: 6px 14px;
  background: transparent;
  color: var(--text-secondary);
  border: 1.5px solid var(--border);
  border-radius: 7px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.cancel-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }

.drag-handle {
  cursor: grab;
  color: var(--text-muted);
  font-size: 16px;
  padding: 0 2px;
  user-select: none;
  flex: none;
}
.drag-handle:hover { color: var(--text-secondary); }
.drag-handle:active { cursor: grabbing; }
.priority-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 500;
  flex: none;
  white-space: nowrap;
}
.priority-badge.tinggi { background: #fee2e2; color: #dc2626; }
.priority-badge.sedang { background: #fef9c3; color: #ca8a04; }
.priority-badge.rendah { background: #dcfce7; color: #16a34a; }
</style>