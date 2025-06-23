<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="p-5">
      <div class="flex items-center">
        <div :class="`flex-shrink-0 ${color} rounded-md p-3`">
          <i :class="`${icon} text-white text-2xl`"></i>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ title }}
            </dt>
            <dd class="text-lg font-semibold text-gray-900">
              {{ value }}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  color: String
})
</script>