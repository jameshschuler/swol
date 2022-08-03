<template>
  <nav>
    <ul>
      <li id="brand">
        <strong>Swol</strong>
      </li>
    </ul>
    <ul>
      <li v-if="!user.isAuthenticated">
        <router-link to="/login">
          <i class="fa-solid fa-user fa-fw fa-lg"></i>
        </router-link>
      </li>
      <li v-if="displayAvatar">
        <figure class="avatar">
          <img :src="user.profile?.avatar_url" :alt="user.profile?.avatar_url" />
        </figure>
      </li>
      <li v-if="user.isAuthenticated">
        <a class="outline" href="#" @click="handleSignOut()">
          <i class="fa-solid fa-right-from-bracket fa-fw fa-lg"></i>
        </a>
      </li>
      <li class="clickable" @click="open = true">
        <i class="fa-solid fa-circle-info fa-fw fa-lg"></i>
      </li>
    </ul>
  </nav>
  <!-- TODO: move to dedicated page (under 'Other') -->
  <Modal title="About Swol" :open="open" @close="open = false" :options="modalConfig">
    <About />
  </Modal>
</template>
<script setup lang="ts">
import { ModalOptions } from '@/models/props';
import { useUserStore } from '@/stores/user';
import { supabase } from '@/supabase';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import About from './About.vue';
import Modal from './common/Modal.vue';

const user = useUserStore();

const router = useRouter();
const open = ref<boolean>(false);

const modalConfig: ModalOptions = {
  buttons: {
    close: true,
  },
};

const displayAvatar = computed(() => user.isAuthenticated && user.profile?.avatar_url);

async function handleSignOut() {
  await supabase.auth.signOut();
  router.push('/');
}
</script>
<style lang="scss" scoped>
#brand {
  strong {
    font-size: 1.5rem;
  }
}

.avatar {
  width: 32px;
  //height: 24px;
  margin-bottom: 0;
}
</style>
