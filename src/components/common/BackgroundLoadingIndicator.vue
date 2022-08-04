<template>
  <div class="background-loading-indicator">
    <LoadingIndicator icon="fa-cog" />
  </div>
</template>
<script setup lang="ts">
import LoadingIndicator from '@/components/common/LoadingIndicator.vue';
</script>
<style lang="scss" scoped>
.background-loading-indicator {
  position: absolute;
  top: 5px;
  left: 5px;
}
</style>
