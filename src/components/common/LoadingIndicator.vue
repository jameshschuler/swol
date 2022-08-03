<template>
  <div>
    <span>
      <i class="fa-solid fa-spin" :class="[icon, size]"></i>
    </span>
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
});
</script>
<style lang="scss" scoped></style>
