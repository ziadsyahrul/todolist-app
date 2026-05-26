import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoInput from '../TodoInput.vue'

/**
 * Property 2: Input dikosongkan setelah penambahan berhasil
 * Validates: Requirements 1.3
 *
 * For any valid text, after handleAdd is successfully called,
 * the inputText value in TodoInput should become an empty string
 * and the add-todo event should be emitted with the correct text.
 */
describe('TodoInput.vue — Property 2: Input dikosongkan setelah penambahan berhasil', () => {
  // Helper: generate array of valid (non-empty, non-whitespace) strings
  const validTexts = [
    'Belajar Vue 3',
    'Buat TodoApp',
    'a',
    '  hello world  ',
    'Task with numbers 123',
    '!@#$%',
    'x'.repeat(100),
  ]

  it('mengosongkan inputText setelah handleAdd dipanggil via klik tombol', async () => {
    for (const text of validTexts) {
      const wrapper = mount(TodoInput)

      // Set input value
      const input = wrapper.find('input')
      await input.setValue(text)

      // Trigger handleAdd via button click
      await wrapper.find('button').trigger('click')

      // inputText should be cleared
      expect(input.element.value).toBe('')

      // add-todo event should have been emitted with trimmed text
      const emitted = wrapper.emitted('add-todo')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toBe(text.trim())
    }
  })

  it('mengosongkan inputText setelah handleAdd dipanggil via Enter keyup', async () => {
    for (const text of validTexts) {
      const wrapper = mount(TodoInput)

      // Set input value
      const input = wrapper.find('input')
      await input.setValue(text)

      // Trigger handleAdd via Enter key
      await input.trigger('keyup.enter')

      // inputText should be cleared
      expect(input.element.value).toBe('')

      // add-todo event should have been emitted with trimmed text
      const emitted = wrapper.emitted('add-todo')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toBe(text.trim())
    }
  })

  it('tidak mengosongkan input dan tidak emit event jika teks kosong', async () => {
    const wrapper = mount(TodoInput)
    const input = wrapper.find('input')

    // Set empty value
    await input.setValue('')
    await wrapper.find('button').trigger('click')

    // inputText should remain empty (no change)
    expect(input.element.value).toBe('')

    // add-todo event should NOT be emitted
    expect(wrapper.emitted('add-todo')).toBeFalsy()
  })

  it('tidak mengosongkan input dan tidak emit event jika teks hanya whitespace', async () => {
    const whitespaceTexts = ['   ', '\t', '\n', '  \t  \n  ']

    for (const text of whitespaceTexts) {
      const wrapper = mount(TodoInput)
      const input = wrapper.find('input')

      await input.setValue(text)
      await wrapper.find('button').trigger('click')

      // add-todo event should NOT be emitted
      expect(wrapper.emitted('add-todo')).toBeFalsy()
    }
  })
})
