<template>
  <article>
    <h2>Results</h2>
    <table>
      <thead>
        <tr>
          <th scope="col">Plate Weight</th>
          <th scope="col">Total Count</th>
          <th scope="col">Per Side</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="[k, v] of props.results!.entries()">
          <td>{{ k }} {{ props.unitOfMeasure }}</td>
          <td>{{ v }}</td>
          <td>{{ v / 2 }}</td>
        </tr>
      </tbody>
    </table>
  </article>
</template>
<script setup lang="ts">
import { PropType } from 'vue';

const props = defineProps({
  results: Object as PropType<Map<number, number>>,
  unitOfMeasure: String,
});
</script>
<style lang="scss" scoped></style>
