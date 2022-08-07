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
          <img :src="profileStore.profile?.avatar_url" alt="" />
        </figure>
      </li>
      <li>
        <router-link to="/about">
          <i class="fa-solid fa-circle-info fa-fw fa-lg"></i>
        </router-link>
      </li>
      <li v-if="user.isAuthenticated">
        <a class="outline" href="#" @click="handleSignOut()">
          <i class="fa-solid fa-right-from-bracket fa-fw fa-lg"></i>
        </a>
      </li>
    </ul>
  </nav>
</template>
<script setup lang="ts">
import { useProfileStore } from '@/stores/profile.js';
import { useUserStore } from '@/stores/user';
import { supabase } from '@/supabase';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const user = useUserStore();
const profileStore = useProfileStore();

const router = useRouter();

const displayAvatar = computed(() => user.isAuthenticated && profileStore.profile?.avatar_url);

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
