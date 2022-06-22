<template>
  <div id="toast-container">
    <Toast v-for="toast of store.toasts" :duration="toast.duration" :type="toast.type" />
  </div>
</template>
<script setup lang="ts">
import { store } from "@/store";
import Toast from "./Toast.vue";
</script>
<style lang="scss" scoped></style>
