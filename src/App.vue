<script setup lang="ts">
import Actionbar from '@/components/Actionbar.vue';
import ToastContainer from '@/components/common/ToastContainer.vue';
import Navbar from '@/components/Navbar.vue';
import ReloadPWA from '@/components/ReloadPWA.vue';
import SidebarNav from '@/components/SidebarNav.vue';
import { useUserStore } from '@/stores/user';
import '@picocss/pico';
import 'v-calendar/dist/style.css';
import BackgroundLoadingIndicator from './components/common/BackgroundLoadingIndicator.vue';
import Drawer from './components/common/Drawer.vue';
import PageLoadingIndicator from './components/common/PageLoadingIndicator.vue';
import { useCommonStore } from './stores/common';
import { useProfileStore } from './stores/profile';
import { supabase } from './supabase';

const userStore = useUserStore();
const common = useCommonStore();
const profileStore = useProfileStore();

userStore.user = supabase.auth.user();
supabase.auth.onAuthStateChange(async (_, session) => {
  userStore.user = session?.user;

  if (userStore.isAuthenticated && profileStore.profile === null) {
    common.isAppLoading = true;
    await profileStore.getProfile();

    if (profileStore.error === null && !profileStore.profile!.synced_profile) {
      await profileStore.updateProfile();
      common.isAppLoading = false;
    } else {
      common.isAppLoading = false;
    }
  }
});

document.addEventListener('click', (e: any) => {
  if (
    common.isDrawerOpen &&
    e.target.id !== 'drawer' &&
    e.target.id !== 'open-drawer-btn' &&
    e.target.parentNode.id !== 'open-drawer-btn'
  ) {
    common.toggleDrawer();
  }
});
</script>

<template>
  <ReloadPWA />
  <BackgroundLoadingIndicator v-if="common.isBackgroundLoading" />
  <Navbar />
  <div class="content mb-sm" v-if="!common.isAppLoading">
    <SidebarNav />
    <router-view></router-view>
  </div>

  <PageLoadingIndicator v-if="common.isAppLoading" size="fa-3x" />
  <Actionbar />
  <ToastContainer />
  <Drawer />
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
