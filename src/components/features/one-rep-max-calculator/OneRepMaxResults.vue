<template>
  <article>
    <h2>Results</h2>
    <table>
      <thead>
        <tr>
          <th scope="col">Formula</th>
          <th scope="col">Estimated One Rep Max</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="[k, v] of calculatedMaxes.entries()">
          <td>{{ k }}</td>
          <td>{{ v }} {{ unitOfMeasure }}</td>
        </tr>
      </tbody>
    </table>
  </article>
</template>
<script setup lang="ts">
import { PropType } from 'vue';

defineProps({
  unitOfMeasure: String,
  calculatedMaxes: {
    type: Object as PropType<Map<string, string>>,
    required: true,
  },
});
</script>
<style lang="scss" scoped></style>
