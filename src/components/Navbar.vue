<template>
  <nav>
    <ul>
      <li id="brand">
        <strong>Swol</strong>
      </li>
    </ul>
    <ul>
      <li v-if="!store.user">
        <router-link to="/login">
          <i class="fa-solid fa-user fa-fw fa-lg"></i>
        </router-link>
      </li>
      <li v-if="store.user">
        <a class="outline" href="#" @click="handleSignOut()">
          <i class="fa-solid fa-right-from-bracket fa-fw fa-lg"></i>
        </a>
      </li>
      <li class="clickable" @click="open = true">
        <i class="fa-solid fa-circle-info fa-fw fa-lg"></i>
      </li>
    </ul>
  </nav>
  <Modal title="About Swol" :open="open" @close="open = false" :options="modalConfig">
    <About />
  </Modal>
</template>
<script setup lang="ts">
import { ModalOptions } from '@/models/props';
import { store } from '@/store';
import { supabase } from '@/supabase';
import { ref } from 'vue';
import About from './About.vue';
import Modal from './common/Modal.vue';

const open = ref<boolean>(false);

const modalConfig: ModalOptions = {
  buttons: {
    close: true,
  },
};

async function handleSignOut() {
  await supabase.auth.signOut();
}
</script>
<style lang="scss" scoped>
#brand {
  strong {
    font-size: 1.5rem;
  }
}
</style>
