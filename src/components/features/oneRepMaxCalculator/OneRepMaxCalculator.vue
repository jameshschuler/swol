<template>
  <div class="view">
    <article>
      <h1>Estimated One-Rep Max</h1>
      <CalculateMaxForm />
    </article>
    <article v-if="store.showResults">
      <Results />
    </article>
  </div>
</template>
<script setup lang="ts">
import { store } from "@/store";
import CalculateMaxForm from "./CalculateMaxForm.vue";
import Results from "./Results.vue";
</script>
<style lang="scss" scoped></style>
