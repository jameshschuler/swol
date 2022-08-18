<template>
  <fieldset>
    <legend>Selected Plate Set</legend>
    <div class="mb-md uom-container">
      <label for="lbs">
        <input type="radio" id="lbs" name="uom" value="lbs" v-model="barLoad.selectedPlateSetUom" />
        Lbs.
      </label>
      <fieldset class="ml-lg mt-sm grid">
        <label
          v-for="(plate, index) of barLoad.selectablePoundPlates"
          :style="
            index >= barLoad.selectablePoundPlates.length / 2
              ? 'grid-column-start: 2;'
              : 'grid-column-start: 1;'
          "
          :for="'lb-' + plate.weight.toString()"
        >
          <input
            type="checkbox"
            :id="'lb-' + plate.weight.toString()"
            :name="plate.weight.toString()"
            :checked="plate.selected"
            :disabled="barLoad.selectedPlateSetUom !== UnitOfMeasure.Pound"
            v-model="barLoad.selectablePoundPlates[index].selected"
          />
          {{ plate.weight }}
        </label>
      </fieldset>
    </div>
    <div class="uom-container">
      <label for="kgs">
        <input type="radio" id="kgs" name="uom" value="kgs" v-model="barLoad.selectedPlateSetUom" />
        Kgs.
      </label>
      <fieldset class="ml-lg mt-sm grid">
        <label
          v-for="(plate, index) of barLoad.selectableKilogramPlates"
          :style="
            index >= barLoad.selectableKilogramPlates.length / 2
              ? 'grid-column-start: 2;'
              : 'grid-column-start: 1;'
          "
          :for="'kg-' + plate.weight.toString()"
        >
          <input
            type="checkbox"
            :id="'kg-' + plate.weight.toString()"
            :name="plate.weight.toString()"
            :checked="plate.selected"
            :disabled="barLoad.selectedPlateSetUom !== UnitOfMeasure.Kilogram"
            v-model="barLoad.selectableKilogramPlates[index].selected"
          />
          {{ plate.weight }}
        </label>
      </fieldset>
    </div>
  </fieldset>
</template>
<script setup lang="ts">
import { UnitOfMeasure } from '@/models/enums';
import { useBarLoadStore } from '@/stores/barLoad';

const barLoad = useBarLoadStore();
</script>
<style lang="scss" scoped>
.grid {
  display: grid;
  grid-gap: 0px;
  grid-template-columns: 1fr 1fr;
  grid-auto-flow: row dense;
}

.uom-container {
  border: 1px solid black;
  border-radius: 0.75rem;
  padding: 1rem;
}
</style>
