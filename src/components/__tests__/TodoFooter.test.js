import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoFooter from '../TodoFooter.vue'

/**
 * Tests for TodoFooter.vue
 * Validates: Requirements 7.1, 7.2, 5.1
 */
describe('TodoFooter.vue', () => {
  it('menampilkan jumlah todo aktif dengan teks "X tugas tersisa"', () => {
    const wrapper = mount(TodoFooter, {
      props: { activeCount: 3, currentFilter: 'all' }
    })
    expect(wrapper.find('.todo-count').text()).toBe('3 tugas tersisa')
  })

  it('menampilkan "0 tugas tersisa" ketika tidak ada todo aktif', () => {
    const wrapper = mount(TodoFooter, {
      props: { activeCount: 0, currentFilter: 'all' }
    })
    expect(wrapper.find('.todo-count').text()).toBe('0 tugas tersisa')
  })

  it('merender komponen TodoFilter di dalamnya', () => {
    const wrapper = mount(TodoFooter, {
      props: { activeCount: 1, currentFilter: 'active' }
    })
    expect(wrapper.find('.todo-filter').exists()).toBe(true)
  })

  it('meneruskan prop currentFilter ke TodoFilter', () => {
    const wrapper = mount(TodoFooter, {
      props: { activeCount: 2, currentFilter: 'completed' }
    })
    // The active button in TodoFilter should be "Selesai"
    const buttons = wrapper.findAll('.todo-filter button')
    const activeButton = buttons.find(b => b.classes('active'))
    expect(activeButton.text()).toBe('Selesai')
  })

  it('meneruskan event change-filter dari TodoFilter ke parent', async () => {
    const wrapper = mount(TodoFooter, {
      props: { activeCount: 1, currentFilter: 'all' }
    })
    // Click the "Aktif" filter button inside TodoFilter
    const buttons = wrapper.findAll('.todo-filter button')
    const activeButton = buttons.find(b => b.text() === 'Aktif')
    await activeButton.trigger('click')

    const emitted = wrapper.emitted('change-filter')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toBe('active')
  })
})
