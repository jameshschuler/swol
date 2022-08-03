<template>
  <div class="view">
    <article>
      <h2>Welcome back {{ user.profile?.username ?? user.profile?.full_name }}!</h2>
    </article>
  </div>
</template>
<script setup lang="ts">
import { useUserStore } from '@/stores/user.js';

const user = useUserStore();
</script>
<style lang="scss" scoped></style>
