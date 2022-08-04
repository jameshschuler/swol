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
import BackgroundLoadingIndicator from './components/common/BackgroundLoadingIndicator.vue';
import PageLoadingIndicator from './components/common/PageLoadingIndicator.vue';
import { useLoadUserProfile } from './composables/useLoadUserProfile';
import { useUpdateUserProfile } from './composables/useUpdateUserProfile';
import { useCommonStore } from './stores/common';
import { supabase } from './supabase';

const loading = ref<boolean>(false);
const userStore = useUserStore();
const common = useCommonStore();

userStore.user = supabase.auth.user();
supabase.auth.onAuthStateChange(async (_, session) => {
  userStore.user = session?.user;

  if (userStore.isAuthenticated) {
    loading.value = true;
    const { fetch, error } = useLoadUserProfile();
    const profile = await fetch();

    if (!error.value && !profile?.synced_profile) {
      const { updateUserProfile } = useUpdateUserProfile();
      await updateUserProfile();
      loading.value = false;
    } else {
      loading.value = false;
    }
  }
});
</script>

<template>
  <ReloadPWA />
  <BackgroundLoadingIndicator v-if="common.isBackgroundLoading" />
  <Navbar />
  <div class="content mb-sm" v-if="!loading">
    <SidebarNav />
    <router-view></router-view>
  </div>

  <PageLoadingIndicator v-if="loading" size="fa-3x" />
  <Actionbar />
  <ToastContainer />
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
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
