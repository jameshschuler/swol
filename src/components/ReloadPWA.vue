<template>
  <div
    v-if="offlineReady || needRefresh"
    class="reload-pwa d-flex align-items-center flex-column"
    role="alert"
  >
    <div>
      <span v-if="offlineReady"> App ready to work offline </span>
      <span v-else>New content available, click on reload button to update.</span>
    </div>
    <div>
      <button v-if="needRefresh" @click="updateServiceWorker()">Reload</button>
      <button @click="close">Close</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue';

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();

function close() {
  offlineReady.value = false;
  needRefresh.value = false;
}
</script>
<style lang="scss" scoped>
.reload-pwa {
  @include mobile {
    align-items: stretch;
  }
}

button {
  width: 10rem;
  margin-top: 0.5rem;

  @include mobile {
    width: 100%;
  }
}
</style>
