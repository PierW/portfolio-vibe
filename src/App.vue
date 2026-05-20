<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, reactive } from 'vue'
import { sections, spinnerChars, heroContent, bioContent, skills, projects, contactLinks } from '../data/portfolio'
import { useTimer } from './composables/useTimer'
import { useCommandPalette } from './composables/useCommandPalette'
import { useChatBot } from './composables/useChatBot'
import { typeWithTyped } from './composables/useTyping'

const SECTION_COUNT = sections.length
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const reducedMotion = ref(false)
const animationsDone = ref(false)
const activeSection = ref(-1)
const scrollRef = ref(null)

// Inizializzazione State
const sectionState = reactive(sections.map((s) => ({
  tools: s.tools.map((t) => ({ text: t.text, detail: t.detail, status: 'pending', spinnerChar: '⠋' })),
  toolsExpanded: false,
  toolsAutoCollapsed: false,
  contentStep: 0,
  done: false,
  visible: false,
})))

// Funzioni Globali (passate ai Composables)
const scrollToBottom = () => nextTick(() => scrollRef.value && (scrollRef.value.scrollTop = scrollRef.value.scrollHeight))
const scrollToTop = () => scrollRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
const scrollToSection = (index) => nextTick(() => document.querySelector(`[data-section-index="${index}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))

const chatInputRef = ref(null)
const focusChatInput = () => {
  setTimeout(() => {
    const input = document.querySelector('input[placeholder="Ask me anything..."]')
    if (input) input.focus()
  }, 100)
}

// Inizializza Composables
const { startTimer, stopTimer, sessionTimeDisplay, sessionSeconds } = useTimer()
const { chatHistory, chatInput, chatStreaming, handleSubmit, resetChat } = useChatBot({ scrollToBottom, sleep, onFocusInput: focusChatInput })
const { commandPaletteOpen, commandPaletteQuery, commandPaletteSelected, commandInputRef, commandPaletteItems, openCommandPalette, closeCommandPalette, executeCommandPaletteItem, handleKeyDown } = useCommandPalette({ scrollToSection, handleNewSession, scrollToTop, scrollToBottom })

watch(chatHistory, () => scrollToBottom(), { deep: true })

// State Connection Screen
const connectionScreenVisible = ref(false)
const connectionSteps = [
  'Establishing secure connection...',
  'Loading session context...',
  'Initializing terminal interface...',
  'Ready.',
]
const connectionStepIndex = ref(0)
const connectionStepDone = ref(false)

async function runConnectionScreen() {
  connectionScreenVisible.value = true
  connectionStepIndex.value = 0
  for (let i = 0; i < connectionSteps.length; i++) {
    connectionStepIndex.value = i
    connectionStepDone.value = false
    await nextTick()
    // Typed.js typing for the connection screen
    await typeWithTyped(`#connection-step-${i}`, connectionSteps[i], 30)
    connectionStepDone.value = true
    await sleep(200)
  }
  await sleep(300)
  connectionScreenVisible.value = false
}

async function runTools(index) {
  const tools = sectionState[index].tools
  for (let i = 0; i < tools.length; i++) {
    tools[i].status = 'running'
    const spinInterval = setInterval(() => {
      const ci = spinnerChars.indexOf(tools[i].spinnerChar)
      tools[i].spinnerChar = spinnerChars[(ci + 1) % spinnerChars.length]
    }, 80)
    await sleep(280)
    clearInterval(spinInterval)
    tools[i].status = 'done'
    tools[i].spinnerChar = '✓'
    await sleep(80)
  }
  await sleep(150)
  sectionState[index].toolsAutoCollapsed = true
}

async function animateSection(index) {
  sectionState[index].visible = true
  await nextTick()
  await sleep(100)
  activeSection.value = index
  await sleep(index === 0 ? 400 : 350)
  
  // Typed.js typing the Prompt
  await typeWithTyped(`#prompt-${index}`, sections[index].prompt, 22)
  await sleep(180)
  await runTools(index)
  await sleep(120)

  // Output Content specific per section
  if (index === 0) {
    sectionState[index].contentStep = 1 // Flag visibilità
    await nextTick()
    await typeWithTyped(`#hero-content-anchor`, heroContent, 10)
  } else if (index === 1) {
    sectionState[index].contentStep = 1
    await nextTick()
    await typeWithTyped(`#bio-content-anchor`, bioContent, 12)
  } else if (index === 2) {
    // Array Reveal logica originale: mantenuta perché Typed.js non genera liste v-for dinamicamente in modo nativo
    for (let i = 0; i < skills.length; i++) { sectionState[index].contentStep = i + 1; await sleep(60) }
  } else if (index === 3) {
    for (let i = 0; i < projects.length; i++) { sectionState[index].contentStep = i + 1; await sleep(80) }
  } else if (index === 4) {
    for (let i = 0; i < contactLinks.length; i++) { sectionState[index].contentStep = i + 1; await sleep(70) }
  }
  
  sectionState[index].done = true
}

async function runSequence() {
  await runConnectionScreen()
  startTimer()
  for (let i = 0; i < SECTION_COUNT; i++) {
    await animateSection(i)
  }
  activeSection.value = SECTION_COUNT
  animationsDone.value = true
}

function resetAllState() {
  stopTimer()
  sessionSeconds.value = 0
  activeSection.value = -1
  animationsDone.value = false
  resetChat()
  sections.forEach((s, i) => {
    // Pulisce l'HTML per typed.js
    const promptEl = document.getElementById(`prompt-${i}`)
    if (promptEl) promptEl.innerHTML = ''
    const heroEl = document.getElementById(`hero-content-anchor`)
    if (heroEl) heroEl.innerHTML = ''
    const bioEl = document.getElementById(`bio-content-anchor`)
    if (bioEl) bioEl.innerHTML = ''

    sectionState[i].tools.forEach((t) => { t.status = 'pending'; t.spinnerChar = '⠋' })
    sectionState[i].toolsExpanded = false
    sectionState[i].toolsAutoCollapsed = false
    sectionState[i].contentStep = 0
    sectionState[i].done = false
    sectionState[i].visible = false
  })
  scrollToTop()
}

async function handleNewSession() {
  resetAllState()
  sessionStorage.removeItem('portfolio-anim-played')
  await nextTick()
  runSequence()
}

const showReturnToTop = ref(false)
function handleScroll() {
  if (scrollRef.value) showReturnToTop.value = scrollRef.value.scrollTop > 300
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const played = sessionStorage.getItem('portfolio-anim-played')

  if (reducedMotion.value || played) {
    sections.forEach(async (s, i) => {
      sectionState[i].tools.forEach((_, j) => {
        sectionState[i].tools[j].status = 'done'
        sectionState[i].tools[j].spinnerChar = '✓'
      })
      sectionState[i].toolsAutoCollapsed = true
      sectionState[i].done = true
      sectionState[i].visible = true

      // Ripristino dati per utenti ritornanti (instant load senza typed js)
      await nextTick()
      document.getElementById(`prompt-${i}`).innerHTML = s.prompt
      if (i === 0) { sectionState[i].contentStep = 1; await nextTick(); document.getElementById(`hero-content-anchor`).innerHTML = heroContent }
      else if (i === 1) { sectionState[i].contentStep = 1; await nextTick(); document.getElementById(`bio-content-anchor`).innerHTML = bioContent }
      else if (i === 2) sectionState[i].contentStep = skills.length
      else if (i === 3) sectionState[i].contentStep = projects.length
      else if (i === 4) sectionState[i].contentStep = contactLinks.length
    })
    activeSection.value = SECTION_COUNT
    animationsDone.value = true
    startTimer()
    return
  }

  sessionStorage.setItem('portfolio-anim-played', '1')
  runSequence()
})

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  if (scrollRef.value) scrollRef.value.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  stopTimer()
  window.removeEventListener('keydown', handleKeyDown)
  if (scrollRef.value) scrollRef.value.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen bg-background p-3 sm:p-4">
    <div class="terminal-frame relative rounded-lg border border-border bg-background overflow-hidden flex flex-col" style="height: 100vh;">
      
      <!-- Chrome Bar -->
      <div class="border-b border-border px-4 py-2.5 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-[#ff5f57]" aria-hidden="true"></span>
          <span class="w-3 h-3 rounded-full bg-[#febc2e]" aria-hidden="true"></span>
          <span class="w-3 h-3 rounded-full bg-[#28c840]" aria-hidden="true"></span>
          <span class="text-dim text-sm ml-2 font-mono">pierpaolo@terminal — {{ sessionTimeDisplay }}</span>
        </div>
        <div class="flex items-center gap-3">
          <button @click="handleNewSession" class="inline-flex items-center px-3 py-1 rounded-full border border-accent text-accent text-xs font-mono hover:bg-accent/10 transition-colors cursor-pointer">new session</button>
          <button @click="openCommandPalette" class="inline-flex items-center gap-1 px-2 py-1 rounded border border-border text-dim text-xs font-mono hover:text-accent hover:border-accent/50 transition-colors cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>K</button>
          <span class="inline-flex items-center gap-1.5 text-dim text-xs font-mono"><span class="w-2 h-2 rounded-full bg-success" aria-hidden="true"></span>online</span>
        </div>
      </div>

      <!-- Connection Screen -->
      <Transition name="fade">
        <div v-if="connectionScreenVisible" class="absolute inset-0 z-30 bg-background flex items-center justify-center">
          <div class="font-mono text-sm space-y-2 max-w-md px-6">
            <div v-for="(step, idx) in connectionSteps" :key="idx" class="flex items-center gap-2" :class="{ 'opacity-40': idx > connectionStepIndex, 'opacity-100': idx <= connectionStepIndex }">
              <span v-if="idx < connectionStepIndex" class="text-success w-4 text-center">✓</span>
              <span v-else-if="idx === connectionStepIndex && !connectionStepDone" class="text-accent w-4 text-center"><span class="inline-block animate-spin-char">{{ spinnerChars[connectionStepIndex % spinnerChars.length] }}</span></span>
              <span v-else-if="idx === connectionStepIndex && connectionStepDone" class="text-success w-4 text-center">✓</span>
              <span v-else class="w-4" />
              <span v-if="idx < connectionStepIndex" :class="'text-dim'" :id="'connection-step-' + idx">{{ step }}</span>
              <span v-else-if="idx === connectionStepIndex" :class="'text-foreground'" :id="'connection-step-' + idx">
                <!-- Typed JS anchor - kept empty, Typed.js will populate it -->
              </span>
              <span v-else :class="'text-muted'" :id="'connection-step-' + idx">
                <!-- Future step placeholder -->
              </span>
              <span v-if="idx === connectionStepIndex && !connectionStepDone" class="inline-block w-2 h-4 bg-accent cursor-blink ml-0.5 align-middle" />
            </div>
          </div>
        </div>
      </Transition>

      <!-- Scrollable body -->
      <div ref="scrollRef" class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-8 scrollable-content">
        
        <!-- Section 0: who is pierpaolo? -->
        <section v-show="sectionState[0].visible" data-section-index="0" class="space-y-3 transition-all duration-500" :class="sectionState[0].visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
          <div class="text-accent text-sm font-mono">&gt; <span :id="'prompt-0'"></span><span v-if="activeSection === 0 && !sectionState[0].done" class="inline-block w-2 h-4 bg-accent cursor-blink ml-0.5 align-middle" /></div>
          <div class="border-l border-border pl-4">
            <div v-if="sectionState[0].tools.some(t => t.status !== 'pending')">
               <!-- Tools Header / Lista Tools Omissis (stessa tua identica struttura) -->
               <div v-if="sectionState[0].toolsAutoCollapsed && !sectionState[0].toolsExpanded" class="cursor-pointer text-dim text-xs font-mono mb-2 hover:text-accent select-none flex items-center gap-2" @click="sectionState[0].toolsExpanded = true"><span class="text-success">✓</span> {{ sections[0].tools.length }} tool uses</div>
               <div v-else-if="sectionState[0].toolsExpanded" class="mb-3"><div class="cursor-pointer text-dim text-xs font-mono mb-2 hover:text-accent select-none flex items-center gap-2" @click="sectionState[0].toolsExpanded = false"><span class="text-success">✓</span> {{ sections[0].tools.length }} tool uses <span class="text-muted">▾</span></div><div class="space-y-2 pl-1 border-l border-border/50 ml-2"><div v-for="(tool, j) in sectionState[0].tools" :key="j" class="py-1"><div class="flex items-center gap-2 text-xs font-mono"><span v-if="tool.status === 'running'" class="text-accent w-4 text-center">{{ tool.spinnerChar }}</span><span v-else-if="tool.status === 'done'" class="text-success w-4 text-center">✓</span><span v-else class="w-4" /><span :class="tool.status === 'done' ? 'text-foreground' : 'text-dim'">{{ tool.text }}</span></div><div v-if="tool.status === 'done'" class="text-muted text-[10px] font-mono mt-0.5 ml-6">{{ tool.detail }}</div></div></div></div>
            </div>
            <!-- Typed.js Anchor for Hero -->
            <div v-show="sectionState[0].contentStep > 0" id="hero-content-anchor" />
            <span v-if="activeSection === 0 && sectionState[0].tools.every(t => t.status === 'done') && !sectionState[0].done" class="inline-block w-2 h-4 bg-accent cursor-blink ml-0.5 align-middle" />
          </div>
        </section>

        <!-- Section 1: tell me more about his background -->
        <section v-show="sectionState[1].visible" data-section-index="1" class="space-y-3 transition-all duration-500" :class="sectionState[1].visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
          <div class="text-accent text-sm font-mono">&gt; <span :id="'prompt-1'"></span><span v-if="activeSection === 1 && !sectionState[1].done" class="inline-block w-2 h-4 bg-accent cursor-blink ml-0.5 align-middle" /></div>
          <div class="border-l border-border pl-4">
             <!-- Tools omissis (stessi di sopra ma con index 1) -->
             <div v-if="sectionState[1].tools.some(t => t.status !== 'pending')"><div v-if="sectionState[1].toolsAutoCollapsed && !sectionState[1].toolsExpanded" class="cursor-pointer text-dim text-xs font-mono mb-2 hover:text-accent select-none flex items-center gap-2" @click="sectionState[1].toolsExpanded = true"><span class="text-success">✓</span> {{ sections[1].tools.length }} tool uses</div><div v-else-if="sectionState[1].toolsExpanded" class="mb-3"><div class="cursor-pointer text-dim text-xs font-mono mb-2 hover:text-accent select-none flex items-center gap-2" @click="sectionState[1].toolsExpanded = false"><span class="text-success">✓</span> {{ sections[1].tools.length }} tool uses <span class="text-muted">▾</span></div><div class="space-y-2 pl-1 border-l border-border/50 ml-2"><div v-for="(tool, j) in sectionState[1].tools" :key="j" class="py-1"><div class="flex items-center gap-2 text-xs font-mono"><span v-if="tool.status === 'running'" class="text-accent w-4 text-center">{{ tool.spinnerChar }}</span><span v-else-if="tool.status === 'done'" class="text-success w-4 text-center">✓</span><span v-else class="w-4" /><span :class="tool.status === 'done' ? 'text-foreground' : 'text-dim'">{{ tool.text }}</span></div><div v-if="tool.status === 'done'" class="text-muted text-[10px] font-mono mt-0.5 ml-6">{{ tool.detail }}</div></div></div></div></div>
            <!-- Typed.js Anchor for Bio -->
            <p v-show="sectionState[1].contentStep > 0" id="bio-content-anchor" class="text-lg leading-relaxed max-w-3xl text-foreground" />
            <span v-if="activeSection === 1 && sectionState[1].tools.every(t => t.status === 'done') && !sectionState[1].done" class="inline-block w-2 h-4 bg-accent cursor-blink ml-0.5 align-middle" />
          </div>
        </section>

        <!-- Section 2: skills -->
        <section v-show="sectionState[2].visible" data-section-index="2" class="space-y-3 transition-all duration-500" :class="sectionState[2].visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
          <div class="text-accent text-sm font-mono">&gt; <span :id="'prompt-2'"></span><span v-if="activeSection === 2 && !sectionState[2].done" class="inline-block w-2 h-4 bg-accent cursor-blink ml-0.5 align-middle" /></div>
          <div class="border-l border-border pl-4">
            <!-- Tools omissis -->
            <div v-if="sectionState[2].tools.some(t => t.status !== 'pending')"><div v-if="sectionState[2].toolsAutoCollapsed && !sectionState[2].toolsExpanded" class="cursor-pointer text-dim text-xs font-mono mb-2 hover:text-accent select-none flex items-center gap-2" @click="sectionState[2].toolsExpanded = true"><span class="text-success">✓</span> {{ sections[2].tools.length }} tool uses</div><div v-else-if="sectionState[2].toolsExpanded" class="mb-3"><div class="cursor-pointer text-dim text-xs font-mono mb-2 hover:text-accent select-none flex items-center gap-2" @click="sectionState[2].toolsExpanded = false"><span class="text-success">✓</span> {{ sections[2].tools.length }} tool uses <span class="text-muted">▾</span></div><div class="space-y-2 pl-1 border-l border-border/50 ml-2"><div v-for="(tool, j) in sectionState[2].tools" :key="j" class="py-1"><div class="flex items-center gap-2 text-xs font-mono"><span v-if="tool.status === 'running'" class="text-accent w-4 text-center">{{ tool.spinnerChar }}</span><span v-else-if="tool.status === 'done'" class="text-success w-4 text-center">✓</span><span v-else class="w-4" /><span :class="tool.status === 'done' ? 'text-foreground' : 'text-dim'">{{ tool.text }}</span></div><div v-if="tool.status === 'done'" class="text-muted text-[10px] font-mono mt-0.5 ml-6">{{ tool.detail }}</div></div></div></div></div>
            <!-- Lists -->
            <ul v-if="sectionState[2].contentStep > 0" class="space-y-1.5 font-mono text-sm">
              <li v-for="skill in skills.slice(0, sectionState[2].contentStep)" :key="skill" class="text-highlight">{{ skill }}</li>
            </ul>
            <span v-if="activeSection === 2 && sectionState[2].tools.every(t => t.status === 'done') && !sectionState[2].done" class="inline-block w-2 h-4 bg-accent cursor-blink ml-0.5 align-middle" />
          </div>
        </section>

        <!-- Section 3: projects -->
        <section v-show="sectionState[3].visible" data-section-index="3" class="space-y-3 transition-all duration-500" :class="sectionState[3].visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
           <div class="text-accent text-sm font-mono">&gt; <span :id="'prompt-3'"></span><span v-if="activeSection === 3 && !sectionState[3].done" class="inline-block w-2 h-4 bg-accent cursor-blink ml-0.5 align-middle" /></div>
           <div class="border-l border-border pl-4">
            <!-- Tools omissis -->
            <div v-if="sectionState[3].tools.some(t => t.status !== 'pending')"><div v-if="sectionState[3].toolsAutoCollapsed && !sectionState[3].toolsExpanded" class="cursor-pointer text-dim text-xs font-mono mb-2 hover:text-accent select-none flex items-center gap-2" @click="sectionState[3].toolsExpanded = true"><span class="text-success">✓</span> {{ sections[3].tools.length }} tool uses</div><div v-else-if="sectionState[3].toolsExpanded" class="mb-3"><div class="cursor-pointer text-dim text-xs font-mono mb-2 hover:text-accent select-none flex items-center gap-2" @click="sectionState[3].toolsExpanded = false"><span class="text-success">✓</span> {{ sections[3].tools.length }} tool uses <span class="text-muted">▾</span></div><div class="space-y-2 pl-1 border-l border-border/50 ml-2"><div v-for="(tool, j) in sectionState[3].tools" :key="j" class="py-1"><div class="flex items-center gap-2 text-xs font-mono"><span v-if="tool.status === 'running'" class="text-accent w-4 text-center">{{ tool.spinnerChar }}</span><span v-else-if="tool.status === 'done'" class="text-success w-4 text-center">✓</span><span v-else class="w-4" /><span :class="tool.status === 'done' ? 'text-foreground' : 'text-dim'">{{ tool.text }}</span></div><div v-if="tool.status === 'done'" class="text-muted text-[10px] font-mono mt-0.5 ml-6">{{ tool.detail }}</div></div></div></div></div>
            <ul v-if="sectionState[3].contentStep > 0" class="space-y-4">
              <li v-for="project in projects.slice(0, sectionState[3].contentStep)" :key="project.name">
                <div class="flex items-baseline justify-between max-w-lg"><span class="font-bold text-highlight">{{ project.name }}</span><span class="text-dim text-xs font-mono">★ {{ project.stars }}</span></div>
                <div class="text-foreground text-sm mt-0.5">{{ project.description }}</div>
              </li>
            </ul>
             <span v-if="activeSection === 3 && sectionState[3].tools.every(t => t.status === 'done') && !sectionState[3].done" class="inline-block w-2 h-4 bg-accent cursor-blink ml-0.5 align-middle" />
           </div>
        </section>

        <!-- Section 4: contact -->
        <section v-show="sectionState[4].visible" data-section-index="4" class="space-y-3 transition-all duration-500" :class="sectionState[4].visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
           <div class="text-accent text-sm font-mono">&gt; <span :id="'prompt-4'"></span><span v-if="activeSection === 4 && !sectionState[4].done" class="inline-block w-2 h-4 bg-accent cursor-blink ml-0.5 align-middle" /></div>
           <div class="border-l border-border pl-4">
             <!-- Tools omissis -->
            <div v-if="sectionState[4].tools.some(t => t.status !== 'pending')"><div v-if="sectionState[4].toolsAutoCollapsed && !sectionState[4].toolsExpanded" class="cursor-pointer text-dim text-xs font-mono mb-2 hover:text-accent select-none flex items-center gap-2" @click="sectionState[4].toolsExpanded = true"><span class="text-success">✓</span> {{ sections[4].tools.length }} tool uses</div><div v-else-if="sectionState[4].toolsExpanded" class="mb-3"><div class="cursor-pointer text-dim text-xs font-mono mb-2 hover:text-accent select-none flex items-center gap-2" @click="sectionState[4].toolsExpanded = false"><span class="text-success">✓</span> {{ sections[4].tools.length }} tool uses <span class="text-muted">▾</span></div><div class="space-y-2 pl-1 border-l border-border/50 ml-2"><div v-for="(tool, j) in sectionState[4].tools" :key="j" class="py-1"><div class="flex items-center gap-2 text-xs font-mono"><span v-if="tool.status === 'running'" class="text-accent w-4 text-center">{{ tool.spinnerChar }}</span><span v-else-if="tool.status === 'done'" class="text-success w-4 text-center">✓</span><span v-else class="w-4" /><span :class="tool.status === 'done' ? 'text-foreground' : 'text-dim'">{{ tool.text }}</span></div><div v-if="tool.status === 'done'" class="text-muted text-[10px] font-mono mt-0.5 ml-6">{{ tool.detail }}</div></div></div></div></div>
            <ul v-if="sectionState[4].contentStep > 0" class="space-y-2 font-mono text-sm max-w-md">
              <li v-for="link in contactLinks.slice(0, sectionState[4].contentStep)" :key="link.label" class="flex">
                <span class="w-24 text-dim shrink-0">{{ link.label }}</span>
                <a :href="link.url" target="_blank" rel="noopener" class="text-highlight hover:text-accent hover:underline decoration-accent/50 truncate">{{ link.value }}</a>
              </li>
            </ul>
             <span v-if="activeSection === 4 && sectionState[4].tools.every(t => t.status === 'done') && !sectionState[4].done" class="inline-block w-2 h-4 bg-accent cursor-blink ml-0.5 align-middle" />
           </div>
        </section>

        <!-- CHAT HISTORY (scrollable area only) -->
        <div v-if="animationsDone" class="pt-8 space-y-6">
          <div class="border-t border-border/50 pt-8" />
          <div v-for="(chat, index) in chatHistory" :key="index" class="space-y-3">
            <div class="text-accent font-mono text-sm">&gt; {{ chat.question }}</div>
            <div class="border-l border-border pl-4 text-foreground leading-relaxed whitespace-pre-wrap">
              <span :id="chat.targetId"></span>
              <span v-if="index === chatHistory.length - 1 && chatStreaming" class="inline-block w-2 h-4 bg-accent cursor-blink ml-0.5 align-middle" />
            </div>
          </div>
        </div>
      </div>

      <!-- Fixed Chat Input Bar -->
      <div v-if="animationsDone" class="border-t border-border/50 px-5 sm:px-6 py-3 bg-background shrink-0">
        <div class="flex items-center gap-2 text-accent font-mono text-sm">
          <span>&gt;</span>
          <input
            ref="chatInputRef"
            v-model="chatInput"
            @keydown.enter="handleSubmit"
            type="text"
            class="flex-1 bg-transparent border-none outline-none text-foreground placeholder-dim focus:ring-0 p-0"
            placeholder="Ask me anything..."
            :disabled="chatStreaming"
            autocomplete="off"
            spellcheck="false"
          />
        </div>
      </div>

      <!-- Return to Top Button -->
      <Transition name="fade">
        <button
          v-if="showReturnToTop"
          @click="scrollToTop"
          class="absolute bottom-16 right-4 z-20 w-8 h-8 rounded-full border border-border/60 bg-background/95 backdrop-blur-sm flex items-center justify-center text-dim hover:text-accent hover:border-accent/50 transition-colors cursor-pointer shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
      </Transition>
      
      <!-- Command Palette Overlay Omissis (Mantiene la tua esatta struttura) -->
      <Transition name="fade"><div v-if="commandPaletteOpen" class="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-32 px-4" @click.self="closeCommandPalette"><div class="bg-[#1e1e1e] border border-border rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"><div class="p-3 border-b border-border flex items-center gap-3"><span class="text-dim">❯</span><input ref="commandInputRef" v-model="commandPaletteQuery" type="text" class="flex-1 bg-transparent border-none outline-none text-foreground font-mono text-sm placeholder-muted focus:ring-0 p-0" placeholder="Type a command or search..." autocomplete="off" spellcheck="false" /></div><div class="max-h-64 overflow-y-auto py-2"><template v-if="commandPaletteItems.length > 0"><div v-for="(item, idx) in commandPaletteItems" :key="idx" class="px-3 py-2 flex items-center justify-between cursor-pointer font-mono text-sm transition-colors" :class="idx === commandPaletteSelected ? 'bg-accent/10 text-accent' : 'text-foreground hover:bg-white/5'" @click="executeCommandPaletteItem(item)" @mouseenter="commandPaletteSelected = idx"><div class="flex flex-col gap-0.5"><span>{{ item.label }}</span><span class="text-xs" :class="idx === commandPaletteSelected ? 'text-accent/70' : 'text-dim'">{{ item.description }}</span></div><span v-if="item.type === 'action'" class="text-xs px-1.5 py-0.5 rounded bg-white/5 text-dim border border-border">action</span></div></template><div v-else class="px-4 py-8 text-center text-dim font-mono text-sm">No results found.</div></div><div class="border-t border-border p-2 bg-black/20 flex items-center justify-between text-[10px] text-dim font-mono select-none"><span><kbd class="px-1 py-0.5 rounded border border-border bg-white/5 mr-1">↑</kbd><kbd class="px-1 py-0.5 rounded border border-border bg-white/5 mr-2">↓</kbd> to navigate</span><span><kbd class="px-1 py-0.5 rounded border border-border bg-white/5 mr-1">↵</kbd> to select</span><span><kbd class="px-1 py-0.5 rounded border border-border bg-white/5 mr-1">esc</kbd> to close</span></div></div></div></Transition>
    </div>
  </div>
</template>

<style scoped>
.scrollable-content {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollable-content::-webkit-scrollbar {
  display: none;
}
</style>