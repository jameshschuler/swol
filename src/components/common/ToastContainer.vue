<template>
  <div id="toast-container" class="d-flex">
    <Toast
      v-for="toast of store.toasts"
      :duration="toast.duration"
      :delay="toast.delay"
      :message="toast.message"
      :type="toast.type"
    />
  </div>
</template>
<script setup lang="ts">
import { store } from '@/store';
import Toast from './Toast.vue';
</script>
<style lang="scss" scoped>
#toast-container {
  flex-direction: column;
  position: fixed;
  right: 20px;
  bottom: 20px;

  @include mobile {
    right: 0;
    width: 90%;
  }
}
</style>
