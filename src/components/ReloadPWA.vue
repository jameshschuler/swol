<template>
  <div v-if="offlineReady || needRefresh" role="alert">
    <div class="mt-1">
      <span v-if="offlineReady"> App ready to work offline </span>
      <span v-else>New content available, click on reload button to update.</span>
    </div>
    <div class="mt-2">
      <button v-if="needRefresh" @click="updateServiceWorker()">Reload</button>
      <button @click="close">Close</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRegisterSW } from "virtual:pwa-register/vue";

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();

function close() {
  offlineReady.value = false;
  needRefresh.value = false;
}
</script>
<style lang="scss" scoped></style>
