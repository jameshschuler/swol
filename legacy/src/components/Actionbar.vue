<template>
  <div id="action-bar">
    <div id="actions">
      <div class="action clickable">
        <router-link :to="user.isAuthenticated ? '/dashboard' : '/'">
          <i class="fa-solid fa-house fa-fw fa-xl"></i>
        </router-link>
      </div>
      <div class="action clickable" v-if="user.isAuthenticated">
        <router-link to="/gym-checkin">
          <i class="fa-solid fa-calendar-day fa-fw fa-xl"></i>
        </router-link>
      </div>
      <div class="action clickable" v-if="user.isAuthenticated">
        <router-link to="/pr-tracker">
          <i class="fa-solid fa-trophy fa-fw fa-xl"></i>
        </router-link>
      </div>
      <div class="action clickable">
        <router-link to="/orm-calculator">
          <i class="fa-solid fa-calculator fa-fw fa-xl"></i>
        </router-link>
      </div>
      <div class="action clickable">
        <router-link to="/barload-calculator">
          <i class="fa-solid fa-scale-balanced fa-fw fa-xl"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useUserStore } from '@/stores/user';
const user = useUserStore();
</script>
<style lang="scss" scoped>
#action-bar {
  display: none;
  position: fixed;
  bottom: 10px;
  left: 0;
  right: 0;
  background-color: hsl(0, 0%, 100%);

  @include touch {
    display: block;
  }

  #actions {
    display: flex;

    .action {
      height: 60px;
      width: 50%;
      display: flex;
      justify-content: center;
      align-items: center;

      a {
        color: hsl(0, 0%, 80%);
        width: 100%;
        text-align: center;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        &:focus {
          background-color: hsl(0, 0%, 100%);
        }
      }

      a.router-link-active {
        color: var(--primary);
      }
    }
  }
}
</style>
