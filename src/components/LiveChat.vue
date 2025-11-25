<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { ChatBubbleOvalLeftIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/vue/24/outline'

const isOpen = ref(false)
const input = ref('')
const messages = ref([])
const containerRef = ref(null)
const STORAGE_KEY = 'liveChatMessages'

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    messages.value = Array.isArray(saved) ? saved : []
  } catch (e) {
    messages.value = []
  }
  if (!messages.value.length) {
    messages.value.push({ id: Date.now(), role: 'system', text: 'Hi! Need help with an order or product? Ask here and we\'ll respond shortly.' })
  }
})

watch(messages, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  } catch (e) {
    /* ignore */
  }
  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  })
}, { deep: true })

function toggleChat() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      const inputEl = document.getElementById('livechat-input')
      if (inputEl) inputEl.focus()
    })
  }
}

function sendMessage() {
  const text = input.value.trim()
  if (!text) return
  messages.value.push({ id: Date.now(), role: 'user', text })
  input.value = ''
  // Simulated automated acknowledgement
  setTimeout(() => {
    messages.value.push({ id: Date.now()+1, role: 'system', text: 'Thanks! A support agent will review shortly.' })
  }, 600)
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <!-- Floating button -->
  <button
    @click="toggleChat"
    aria-label="Live chat"
    class="fixed bottom-4 right-4 z-50 rounded-full shadow-[4px_4px_10px_rgba(56,72,87,0.5)] bg-[#68A4FE] hover:bg-[#384857] text-white w-14 h-14 flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#68A4FE]"
  >
    <span v-if="!isOpen" class="text-xl">
      <ChatBubbleOvalLeftIcon class="w-7 h-7" />
    </span>
    <span v-else class="text-xl">
      <XMarkIcon class="w-7 h-7" />
    </span>
  </button>

  <!-- Chat panel -->
  <div
    v-show="isOpen"
    class="fixed bottom-20 right-4 w-[25rem] max-h-[28rem] z-50 flex flex-col bg-white border-2 border-[#68A4FE] rounded-md rounded-tl-none rounded-br-none shadow-[4px_4px_10px_rgba(56,72,87,0.5)] overflow-hidden animate-fadeIn"
    role="dialog"
    aria-label="Live chat window"
  >
    <div class="flex items-center justify-between bg-[#68A4FE] text-white px-4 py-2">
      <div class="font-semibold tracking-wide">Live Support</div>
      <button @click="toggleChat" aria-label="Close chat" class="text-white hover:text-gray-200">
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>
    <div ref="containerRef" class="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm bg-[#f7f9fb] custom-scroll">
      <div
        v-for="m in messages"
        :key="m.id"
        class="flex"
        :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="px-3 py-2 rounded-md max-w-[75%] whitespace-pre-wrap break-words"
          :class="m.role === 'user' ? 'bg-[#68A4FE] text-white' : 'bg-[#384857] text-white'"
        >
          {{ m.text }}
        </div>
      </div>
    </div>
    <div class="border-t p-2 bg-white">
      <div class="relative">
        <input
          id="livechat-input"
          v-model="input"
          @keydown="handleKey"
          type="text"
          placeholder="Type your message..."
          class="w-full pr-12 text-sm px-3 py-3 border-2 rounded-md outline-none focus:border-[#68A4FE] transition-colors duration-300"
        />
        <button
          @click="sendMessage"
          class="absolute right-2 top-1/2 -translate-y-1/2 bg-[#68A4FE] hover:bg-[#384857] text-white w-9 h-9 rounded-md flex items-center justify-center transition-colors duration-300 disabled:opacity-40"
          :disabled="!input.trim()"
          aria-label="Send message"
        >
          <PaperAirplaneIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.15s ease-out; }
.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: #68A4FE; border-radius: 4px; }
</style>
