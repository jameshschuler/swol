<template>
  <div id="sidebar-nav">
    <aside>
      <nav>
        <ul>
          <li v-if="isAuthenticated">
            <h6 class="mb-none">Features</h6>
          </li>
          <li v-if="isAuthenticated">
            <router-link to="/gym-checkin">Daily Gym Check-In</router-link>
          </li>
          <li>
            <h6 class="mb-none">Tools</h6>
          </li>
          <li>
            <router-link to="/orm-calculator">One-Rep Max Calculator</router-link>
          </li>
          <li>
            <router-link to="/barload-calculator">Bar Load Calculator</router-link>
          </li>
          <li>
            <h6 class="mb-none">Other</h6>
          </li>
          <li>
            <router-link to="/privacy">Privacy Policy</router-link>
          </li>
          <li>
            <router-link to="/terms-conditions">Terms & Conditions</router-link>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>
<script setup lang="ts">
import { useUserStore } from '@/stores/user.js';
const { isAuthenticated } = useUserStore();
</script>
<style lang="scss" scoped>
#sidebar-nav {
  width: 25%;

  @include touch {
    display: none;
  }
}
</style>
