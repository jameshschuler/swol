<template>
  <div id="sidebar-nav">
    <aside>
      <nav>
        <ul>
          <li>
            <router-link to="/gym-checkin">Daily Gym Check-In</router-link>
          </li>
          <li>
            <router-link to="/orm-calculator">One-Rep Max Calculator</router-link>
          </li>
          <li>
            <router-link to="/barload-calculator">Bar Load Calculator</router-link>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>
<script setup lang="ts"></script>
<style lang="scss" scoped>
#sidebar-nav {
  width: 25%;

  @include touch {
    display: none;
  }
}
</style>
