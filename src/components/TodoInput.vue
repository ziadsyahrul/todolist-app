<template>
  <div class="input-wrapper">
    <input
      v-model="inputText"
      type="text"
      placeholder="Tambah tugas baru..."
      @keyup.enter="handleAdd"
    />
    <select v-model="priority" class="priority-select">
      <option value="tinggi">🔴 Tinggi</option>
      <option value="sedang">🟡 Sedang</option>
      <option value="rendah">🟢 Rendah</option>
    </select>
    <button @click="handleAdd">Tambah</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['add-todo'])
const inputText = ref('')
const priority = ref('sedang')

function handleAdd() {
  const text = inputText.value.trim()
  if (!text) return
  emit('add-todo', { text, priority: priority.value })
  inputText.value = ''
}
</script>

<style scoped>
.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
input {
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  background: var(--bg-input);
  outline: none;
  transition: border-color 0.15s;
  color: var(--text-primary);
}
input:focus { border-color: var(--text-muted); }
input::placeholder { color: var(--text-muted); }

.priority-select {
  padding: 10px 8px 10px 8px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-size: 12px;
  background: var(--bg-input);
  color: var(--text-primary);
  cursor: pointer;
  outline: none;
  width: 110px;
  flex-shrink: 0;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23a1a1aa' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}
.priority-select:focus { border-color: #a1a1aa; }

button {
  padding: 10px 18px;
  background: var(--btn-primary);
  color: var(--btn-primary-text);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
button:hover { background: var(--btn-primary-hover); }
</style>