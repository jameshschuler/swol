<template>
  <div id="drawer" :class="{ hidden: !common.isDrawerOpen }">
    <div>Display avatar here</div>
    <div>Display name / username</div>
    <div>show sign out icon in top right corner</div>
    <aside>
      <nav>
        <ul>
          <li>Profile</li>
          <li>Preferences</li>
        </ul>
      </nav>
    </aside>
  </div>
  <Overlay />
</template>
<script setup lang="ts">
import Overlay from '@/components/common/Overlay.vue';
import { useCommonStore } from '@/stores/common.js';

const common = useCommonStore();
</script>
<style lang="scss" scoped>
#drawer {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background-color: lightcoral;
  width: 30%;
  box-shadow: 25px 0px 20px -20px rgba(27, 40, 50, 0.45);
  padding: 1rem;
  z-index: 3;
  transition: all 300ms ease-in-out;

  &.hidden {
    left: -32%;
  }

  @include touch {
    width: 77%;

    &.hidden {
      left: -75%;
    }
  }
}
</style>
