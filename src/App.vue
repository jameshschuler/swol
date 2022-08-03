<script setup lang="ts">
import Actionbar from '@/components/Actionbar.vue';
import ToastContainer from '@/components/common/ToastContainer.vue';
import Navbar from '@/components/Navbar.vue';
import ReloadPWA from '@/components/ReloadPWA.vue';
import SidebarNav from '@/components/SidebarNav.vue';
import { useUserStore } from '@/stores/user';
import '@picocss/pico';
import 'v-calendar/dist/style.css';
import { ref } from 'vue';
import LoadingIndicator from './components/common/LoadingIndicator.vue';
import { useLoadUserProfile } from './composables/useLoadUserProfile';
import { useUpdateUserProfile } from './composables/useUpdateUserProfile';
import { useCommonStore } from './stores/common';
import { supabase } from './supabase';

const ready = ref<boolean>(false);
const user = useUserStore();
const common = useCommonStore();

user.user = supabase.auth.user();
supabase.auth.onAuthStateChange(async (_, session) => {
  user.user = session?.user;

  if (user.isAuthenticated) {
    const { fetch, error } = useLoadUserProfile();
    const profile = await fetch();

    ready.value = true;

    if (!error.value && !profile?.synced_profile) {
      const { updateUserProfile } = useUpdateUserProfile();
      await updateUserProfile();
    }
  }
});
</script>

<template>
  <ReloadPWA />
  <div class="background-loading-indicator" v-if="common.isBackgroundLoading">
    <LoadingIndicator icon="fa-cog" />
  </div>
  <Navbar />
  <div class="content mb-sm" v-if="ready">
    <SidebarNav />
    <router-view></router-view>
  </div>

  <!-- TODO: Create page view loader -->
  <LoadingIndicator v-if="!ready" size="fa-3x" />
  <Actionbar />
  <ToastContainer />
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.background-loading-indicator {
  position: absolute;
  top: 5px;
  left: 5px;
}

.content {
  display: flex;

  .view {
    width: 72.5%;
    margin-left: 2.5%;

    @include touch {
      margin-left: 0;
      width: 100%;
    }
  }
}
</style>
