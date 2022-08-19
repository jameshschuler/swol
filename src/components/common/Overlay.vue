<template>
  <div id="overlay"></div>
</template>
<script setup lang="ts">
import { useCommonStore } from '@/stores/common.js';
import { computed } from 'vue';

const common = useCommonStore();
const overlayVisibility = computed(() => (common.isDrawerOpen ? 'visible' : 'hidden'));
</script>
<style lang="scss" scoped>
#overlay {
  visibility: v-bind(overlayVisibility);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
  cursor: pointer;
  position: fixed;
  transition: all 200ms ease-in-out;
}
</style>
