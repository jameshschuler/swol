<script setup lang="ts">
import Actionbar from '@/components/Actionbar.vue';
import ToastContainer from '@/components/common/ToastContainer.vue';
import Navbar from '@/components/Navbar.vue';
import ReloadPWA from '@/components/ReloadPWA.vue';
import SidebarNav from '@/components/SidebarNav.vue';
import '@picocss/pico';
import 'v-calendar/dist/style.css';
import { store } from './store';
import { supabase } from './supabase';

store.user = supabase.auth.user();
supabase.auth.onAuthStateChange((_, session) => {
  store.user = session?.user;
  if (store.user) {
    // TODO: update profile
    // console.log(session?.user?.user_metadata);
  }
});
</script>

<template>
  <ReloadPWA />
  <Navbar />
  <div class="content mb-sm">
    <SidebarNav />
    <router-view></router-view>
  </div>
  <Actionbar />
  <ToastContainer />
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
