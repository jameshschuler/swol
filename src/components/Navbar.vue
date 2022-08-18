<template>
  <nav>
    <ul>
      <li id="brand">
        <router-link
          :to="user.isAuthenticated ? '/dashboard' : '/'"
          class="d-flex align-items-center"
        >
          <figure id="logo">
            <img src="../assets/SWOLa192.png" alt="" />
          </figure>
          <strong class="ml-sm">Swol</strong>
        </router-link>
      </li>
    </ul>
    <ul>
      <li v-if="!user.isAuthenticated">
        <router-link to="/login" role="button" class="outline">
          <!-- <i class="fa-solid fa-user fa-fw fa-lg"></i> -->
          Log in
        </router-link>
      </li>
      <li v-if="user.isAuthenticated">
        <figure
          class="avatar clickable"
          @click="common.toggleDrawer()"
          v-if="displayCustomAvatar && profileStore.profile?.avatar_url"
        >
          <img id="open-drawer-btn" :src="profileStore.profile?.avatar_url" alt="" />
        </figure>
        <span class="clickable" @click="common.toggleDrawer()" v-else>
          <i id="open-drawer-btn" class="fa-solid fa-user fa-fw fa-lg"></i>
        </span>
      </li>
      <!-- <li>
        <router-link to="/about">
          <i class="fa-solid fa-circle-info fa-fw fa-lg"></i>
        </router-link>
      </li> -->
      <li v-if="user.isAuthenticated">
        <a class="outline" href="#" @click="handleSignOut()">
          <i class="fa-solid fa-right-from-bracket fa-fw fa-lg"></i>
        </a>
      </li>
    </ul>
  </nav>
</template>
<script setup lang="ts">
import { useCommonStore } from '@/stores/common.js';
import { useProfileStore } from '@/stores/profile';
import { useUserStore } from '@/stores/user';
import { supabase } from '@/supabase';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const user = useUserStore();
const profileStore = useProfileStore();
const common = useCommonStore();

const router = useRouter();

// TODO: pull this from user preferences
const displayCustomAvatar = ref<boolean>(false);

async function handleSignOut() {
  await supabase.auth.signOut();
  router.push('/login');
}
</script>
<style lang="scss" scoped>
#brand {
  a {
    strong {
      font-size: 1.5rem;
      color: rgb(65, 84, 98);
    }
  }
}

#logo {
  width: 36px;
  margin: 0;
}

.avatar {
  width: 36px;
  //height: 24px;
  margin-bottom: 0;
}
</style>
