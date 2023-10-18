<template>
  <div class="page-loading-indicator d-flex justify-center flex-column align-items-center">
    <LoadingIndicator size="fa-3x" />
  </div>
</template>
<script setup lang="ts">
import LoadingIndicator from './LoadingIndicator.vue';
</script>
<style lang="scss" scoped>
.page-loading-indicator {
  height: 50vh;
}
</style>
