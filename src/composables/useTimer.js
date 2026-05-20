import { ref, computed } from 'vue'

export function useTimer() {
  const sessionSeconds = ref(0)
  let timerInterval = null

  function startTimer() {
    stopTimer()
    sessionSeconds.value = 0
    timerInterval = setInterval(() => {
      sessionSeconds.value++
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  const sessionTimeDisplay = computed(() => {
    const mins = Math.floor(sessionSeconds.value / 60)
    const secs = sessionSeconds.value % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  })

  return { sessionSeconds, startTimer, stopTimer, sessionTimeDisplay }
}