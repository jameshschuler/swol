<script setup lang="ts">
import "@picocss/pico";
import CalculateMaxForm from "./components/CalculateMaxForm.vue";
import Results from "./components/Results.vue";
import { store } from "./store";
import "./styles/app.scss";
</script>

<template>
  <article>
    <h1>Estimated One Rep Max</h1>
    <CalculateMaxForm />
  </article>
  <article v-if="store.showResults">
    <Results />
  </article>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
