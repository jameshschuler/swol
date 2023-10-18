<template>
  <li>
    <router-link :to="to" class="d-flex align-items-center">
      <span class="icon">
        <i class="fa-solid fa-fw" :class="icon"></i>
      </span>
      <span class="ml-md">{{ text }}</span>
    </router-link>
  </li>
</template>
<script setup lang="ts">
defineProps({
  icon: {
    type: String,
  },
  to: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});
</script>
<style lang="scss" scoped></style>
