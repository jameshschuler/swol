<template>
  <div>
    <span>
      <i class="fa-solid fa-spin" :class="[icon, size]"></i>
    </span>
    <span v-if="text !== ''" class="mt-sm">{{ text }}</span>
  </div>
</template>
<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    default: 'fa-circle-notch',
  },
  size: {
    type: String,
    default: 'fa-lg',
  },
  text: {
    type: String,
    default: '',
  },
});
</script>
<style lang="scss" scoped></style>
