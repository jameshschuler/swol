<template>
  <div class="view">
    <article>
      <h2>Welcome back {{ profileStore.profile?.username ?? profileStore.profile?.full_name }}!</h2>
    </article>
  </div>
</template>
<script setup lang="ts">
import { useProfileStore } from '@/stores/profile.js';

const profileStore = useProfileStore();
</script>
<style lang="scss" scoped></style>
