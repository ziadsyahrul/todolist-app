<template>
  <div class="footer">
    <span class="count">{{ activeCount }} tugas tersisa</span>
    <div class="filters">
      <button
        v-for="f in filters"
        :key="f.value"
        :class="{ active: currentFilter === f.value }"
        @click="emit('change-filter', f.value)"
      >
        {{ f.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({ activeCount: Number, currentFilter: String })
const emit = defineEmits(['change-filter'])
const filters = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'completed', label: 'Selesai' },
]
</script>

<style scoped>
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 4px;
}
.count {
  font-size: 13px;
  color: var(--text-muted);
}
.filters { display: flex; gap: 4px; }
button {
  padding: 6px 12px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}
button:hover { border-color: var(--border-hover); color: var(--text-primary); }
button.active {
  background: var(--btn-primary);
  border-color: var(--btn-primary);
  color: var(--btn-primary-text);
}
</style>