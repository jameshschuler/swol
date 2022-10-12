<template>
  <div id="sidebar-nav">
    <aside>
      <nav>
        <ul>
          <div v-for="section in sidebarNavLinks">
            <li v-if="section.requiresAuth ? userStore.isAuthenticated : true">
              <h6 class="mb-none">{{ section.title }}</h6>
            </li>
            <li v-for="link in section.links">
              <router-link
                :to="link.to"
                v-if="link.requiresAuth ? userStore.isAuthenticated : true"
                >{{ link.label }}</router-link
              >
            </li>
          </div>
        </ul>
      </nav>
    </aside>
  </div>
</template>
<script setup lang="ts">
import { sidebarNavLinks } from '@/models/links';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
</script>
<style lang="scss" scoped>
#sidebar-nav {
  width: 25%;

  @include touch {
    display: none;
  }
}
</style>
