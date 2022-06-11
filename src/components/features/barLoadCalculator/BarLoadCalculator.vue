<template>
  <div class="view">
    <article>
      <h1 class="d-flex justify-space-between align-items-center">
        Barload Calculator
        <span class="clickable">
          <i class="fa-solid fa-gear fa-fw fa-xs"></i>
        </span>
      </h1>

      <form @submit.prevent="calculateBarload">
        <div class="grid">
          <label for="weight">
            Weight
            <input id="weight" name="weight" type="text" placeholder="Weight" v-model="formData.weight" :aria-invalid="errors.weight" />
          </label>

          <label for="uom">
            Unit of Measure
            <select id="uom" name="uom" v-model="formData.unit">
              <option :value="UnitOfMeasure.Pound">lbs.</option>
              <option :value="UnitOfMeasure.Kilogram">kgs.</option>
            </select>
          </label>
        </div>
        <button class="mt-sm" type="submit" :aria-busy="calculating">Calculate</button>
      </form>
    </article>
    <BarLoadResults v-if="results.size !== 0" :results="results" :unit-of-measure="store.selectedPlateUnitOfMeasure" />
  </div>
</template>
<script setup lang="ts">
import { UnitOfMeasure } from "@/models/enums";
import { CalculateBarloadForm, CalculateBarloadFormErrors } from "@/models/form";
import { store } from "@/store";
import { reactive, ref } from "vue";
import BarLoadResults from "./BarLoadResults.vue";

const formData = ref<CalculateBarloadForm>({
  unit: UnitOfMeasure.Pound,
});

const errors = ref<CalculateBarloadFormErrors>({});
const calculating = ref<boolean>(false);

const results = reactive<Map<number, number>>(new Map<number, number>());

function calculateBarload() {
  validateFormData(formData.value);

  if (Object.values(errors.value).some((e) => e === true)) {
    return;
  }

  calculating.value = true;

  // TODO: what about if the weight entered is a decimal?
  if (formData.value.unit === UnitOfMeasure.Pound) {
    const selectedPlates = store.selectablePoundPlates.filter((p) => p.selected);
    let remaining = formData.value.weight! - store.selectedBarbell.weight;
    let incrementor = 0;

    for (const plate of selectedPlates) {
      results.set(plate.weight, 0);
    }

    while (remaining > 0) {
      let currentPlate = selectedPlates[incrementor].weight;
      let totalPlateWeight = currentPlate * 2;

      if (remaining >= totalPlateWeight) {
        remaining -= totalPlateWeight;
        let currentPlateCount = results.get(currentPlate) || 0;
        results.set(currentPlate, (currentPlateCount += 2));
      } else {
        incrementor++;
      }

      if (incrementor > selectedPlates.length) {
        // TODO: show error message...toast?
        console.error("Unable to calculate barload");
        break;
      }
    }

    calculating.value = false;
  } else if (formData.value.unit === UnitOfMeasure.Kilogram) {
    console.log("TODO");
  }
}

function validateFormData({ weight }: CalculateBarloadForm) {
  let hasError = false;

  if (!weight || weight <= 0 || isNaN(weight)) {
    hasError = true;
  } else {
    if (weight < store.selectedBarbell.weight) {
      // TODO: add error message
      hasError = true;
    }

    if (weight - Math.floor(weight) !== 0) {
      // TODO: add error message
      hasError = true;
    }
  }

  errors.value.weight = hasError;
}
</script>
<style lang="scss" scoped></style>
