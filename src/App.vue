<script setup lang="ts">
import Actionbar from "@/components/Actionbar.vue";
import Navbar from "@/components/Navbar.vue";
import ReloadPWA from "@/components/ReloadPWA.vue";
import SidebarNav from "@/components/SidebarNav.vue";
import ToastContainer from "@/components/common/ToastContainer.vue";
import "@picocss/pico";
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
