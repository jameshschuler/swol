<template>
  <div id="action-bar">
    <div id="actions">
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
<script setup lang="ts"></script>
<style lang="scss" scoped>
#action-bar {
  display: none;
  position: absolute;
  bottom: 0;
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
      }

      a.router-link-active {
        color: var(--primary);
      }
    }
  }
}
</style>
