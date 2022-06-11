<template>
  <article>
    <h1>Results</h1>
    <table>
      <thead>
        <tr>
          <th scope="col">Plate Weight</th>
          <th scope="col">Count</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="[k, v] of props.results!.entries()">
          <td>{{ k }} {{ props.unitOfMeasure }}</td>
          <td>{{ v }}</td>
        </tr>
      </tbody>
    </table>
  </article>
</template>
<script setup lang="ts">
import { PropType } from "vue";

const props = defineProps({
  results: Object as PropType<Map<number, number>>,
  unitOfMeasure: String,
});
</script>
<style lang="scss" scoped></style>
