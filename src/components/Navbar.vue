<template>
  <nav>
    <ul>
      <li id="brand">
        <strong>Swol</strong>
      </li>
    </ul>
    <ul>
      <li class="clickable" @click="open = true">
        <i class="fa-solid fa-circle-info fa-fw fa-lg"></i>
      </li>
    </ul>
  </nav>
  <Modal title="About Swol" :open="open" @close="open = false">
    <About />
  </Modal>
</template>
<script setup lang="ts">
import { ref } from "vue";
import About from "./About.vue";
import Modal from "./common/Modal.vue";

const open = ref<boolean>(false);
</script>
<style lang="scss" scoped>
#brand {
  strong {
    font-size: 1.5rem;
  }
}
</style>
