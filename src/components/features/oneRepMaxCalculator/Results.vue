<template>
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
        <td>{{ v }} {{ store.unitOfMeasure }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
import { store } from "@/store";
</script>
<style lang="scss" scoped></style>
