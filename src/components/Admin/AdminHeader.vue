<script setup>

</script>
<template>
      <!-- Top Navigation -->
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Search Bar -->
          <div class="flex-1 max-w-md relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products, orders, customers..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#042EFF] focus:border-[#042EFF]"
            />
          </div>

          <!-- Profile -->
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">Kennedy Muendo</p>
              <p class="text-xs text-gray-500">kennedy@admin.com</p>
            </div>
            <img
              class="h-10 w-10 rounded-full border-2 border-[#042EFF]"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="Admin Profile"
            />
          </div>
        </div>
      </header>
</template>
