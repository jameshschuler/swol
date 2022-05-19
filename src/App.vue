<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import ReloadPWA from "@/components/ReloadPWA.vue";
import SidebarNav from "@/components/SidebarNav.vue";
import "@picocss/pico";
</script>

<template>
  <ReloadPWA />
  <Navbar />
  <div class="content">
    <SidebarNav />
    <router-view></router-view>
  </div>
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
