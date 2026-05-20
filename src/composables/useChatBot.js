import { ref, nextTick } from 'vue'
import qaData from '../../data/qa.json' // Assicurati che il path sia corretto
import { typeWithTyped } from './useTyping'

export function useChatBot(callbacks) {
  const chatHistory = ref([])
  const chatInput = ref('')
  const chatStreaming = ref(false)

  const fallbackAnswer = `Hmm, I don't have a canned answer for that. Try asking about my <span class="text-accent">tech stack</span>, <span class="text-accent">availability</span>, <span class="text-accent">location</span>, <span class="text-accent">contact info</span>, or <span class="text-accent">current projects</span>.\n\nOr just reach me at <span class="text-accent">info@themillennials.it</span> — I'm way better at email than regex.`

  function matchQA(input) {
    const lower = input.toLowerCase().trim()
    if (!lower) return null
    for (const qa of qaData) {
      for (const pattern of qa.patterns) {
        try {
          if (new RegExp(pattern, 'i').test(lower)) return qa.answer
        } catch {
          if (lower.includes(pattern.toLowerCase())) return qa.answer
        }
      }
    }
    return null
  }

  async function handleSubmit() {
    const input = chatInput.value.trim()
    if (!input || chatStreaming.value) return
    chatInput.value = ''
    
    const typedId = `chat-ans-${Date.now()}`
    chatHistory.value.push({ question: input, targetId: typedId })
    
    await nextTick()
    callbacks.scrollToBottom()

    const answer = matchQA(input) || fallbackAnswer
    chatStreaming.value = true

    await callbacks.sleep(300)
    await typeWithTyped(`#${typedId}`, answer, 12)
    
    chatStreaming.value = false
    await nextTick()
    callbacks.scrollToBottom()
    callbacks.onFocusInput?.()
  }

  function resetChat() {
    chatHistory.value = []
    chatInput.value = ''
    chatStreaming.value = false
  }

  return { chatHistory, chatInput, chatStreaming, handleSubmit, resetChat }
}