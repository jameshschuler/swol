<template>
  <div class="view">
    <article>
      <h2>Welcome back {{ profileStore.profile?.username ?? profileStore.profile?.full_name }}!</h2>
      <!-- TODO: quick link to check in if user hasn't check in yet? -->
    </article>
  </div>
</template>
<script setup lang="ts">
import { useProfileStore } from '@/stores/profile';

const profileStore = useProfileStore();
</script>
<style lang="scss" scoped></style>
