<script setup>
const props = defineProps({
  currentFilter: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['change-filter'])

const filters = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'completed', label: 'Selesai' }
]
</script>

<template>
  <div class="todo-filter">
    <button
      v-for="filter in filters"
      :key="filter.value"
      :class="{ active: currentFilter === filter.value }"
      @click="emit('change-filter', filter.value)"
    >
      {{ filter.label }}
    </button>
  </div>
</template>
