<template>
  <fieldset>
    <legend>Unit of Measure</legend>
    <div class="mb-md">
      <label for="lbs">
        <input type="radio" id="lbs" name="uom" value="lbs" checked />
        Lbs.
      </label>
      <fieldset class="ml-lg mt-sm grid">
        <label v-for="plate of store.selectablePoundPlates" :for="'lb-' + plate.weight.toString()">
          <input type="checkbox" :id="'lb-' + plate.weight.toString()" :name="plate.weight.toString()" :checked="plate.selected" />
          {{ plate.weight }}
        </label>
      </fieldset>
    </div>
    <div>
      <label for="kgs">
        <input type="radio" id="kgs" name="uom" value="kgs" />
        Kgs.
      </label>
      <fieldset class="ml-lg mt-sm grid">
        <label v-for="plate of store.selectableKilogramPlates" :for="'kg-' + plate.weight.toString()">
          <input type="checkbox" :id="'kg-' + plate.weight.toString()" :name="plate.weight.toString()" :checked="plate.selected" />
          {{ plate.weight }}
        </label>
      </fieldset>
    </div>
  </fieldset>
</template>
<script setup lang="ts">
import { store } from "@/store";
</script>
<style lang="scss" scoped>
.grid {
  display: grid;
  grid-gap: 0px;
  grid-template-columns: 1fr 1fr;
}
</style>
