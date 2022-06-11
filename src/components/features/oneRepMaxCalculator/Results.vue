<template>
  <article>
    <h1>Results</h1>
    <table>
      <thead>
        <tr>
          <th scope="col">Formula</th>
          <th scope="col">Estimated One Rep Max</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="[k, v] of store.calculatedMaxes.entries()">
          <td>{{ k }}</td>
          <td>{{ v }} {{ props.unitOfMeasure }}</td>
        </tr>
      </tbody>
    </table>
  </article>
</template>
<script setup lang="ts">
import { store } from "@/store";

const props = defineProps({
  unitOfMeasure: String,
});
</script>
<style lang="scss" scoped></style>
