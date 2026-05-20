import { ref, computed, nextTick } from 'vue'
import { sections } from '../../data/portfolio'

export function useCommandPalette(callbacks) {
  const commandPaletteOpen = ref(false)
  const commandPaletteQuery = ref('')
  const commandPaletteSelected = ref(0)
  const commandInputRef = ref(null)

  const commandPaletteItems = computed(() => {
    const q = commandPaletteQuery.value.toLowerCase().trim()
    const allItems = [
      ...sections.map((s, i) => ({
        type: 'section', index: i, label: s.prompt, description: `Scroll to "${s.id}" section`
      })),
      { type: 'action', label: 'new session', description: 'Reset and replay animations' },
      { type: 'action', label: 'scroll to top', description: 'Scroll to the top of the page' },
      { type: 'action', label: 'scroll to bottom', description: 'Scroll to the bottom of the page' },
    ]
    if (!q) return allItems
    return allItems.filter((item) =>
      item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    )
  })

  function openCommandPalette() {
    commandPaletteOpen.value = true
    commandPaletteQuery.value = ''
    commandPaletteSelected.value = 0
    nextTick(() => commandInputRef.value?.focus())
  }

  function closeCommandPalette() {
    commandPaletteOpen.value = false
    commandPaletteQuery.value = ''
  }

  function executeCommandPaletteItem(item) {
    closeCommandPalette()
    if (item.type === 'section') callbacks.scrollToSection(item.index)
    else if (item.label === 'new session') callbacks.handleNewSession()
    else if (item.label === 'scroll to top') callbacks.scrollToTop()
    else if (item.label === 'scroll to bottom') callbacks.scrollToBottom()
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      commandPaletteOpen.value ? closeCommandPalette() : openCommandPalette()
      return
    }
    if (e.key === 'Escape' && commandPaletteOpen.value) {
      closeCommandPalette()
      return
    }
    if (!commandPaletteOpen.value) return

    const items = commandPaletteItems.value
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      commandPaletteSelected.value = Math.min(commandPaletteSelected.value + 1, items.length - 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      commandPaletteSelected.value = Math.max(commandPaletteSelected.value - 1, 0)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (items[commandPaletteSelected.value]) {
        executeCommandPaletteItem(items[commandPaletteSelected.value])
      }
    }
  }

  return {
    commandPaletteOpen, commandPaletteQuery, commandPaletteSelected, commandInputRef,
    commandPaletteItems, openCommandPalette, closeCommandPalette, executeCommandPaletteItem, handleKeyDown
  }
}