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
  </div>
</template>
<script setup lang="ts">
import { poundPlatesSet } from "@/models/constants";
import { UnitOfMeasure } from "@/models/enums";
import { CalculateBarloadForm, CalculateBarloadFormErrors } from "@/models/form";
import { ref } from "vue";

const formData = ref<CalculateBarloadForm>({
  unit: UnitOfMeasure.Pound,
});

const errors = ref<CalculateBarloadFormErrors>({});
const calculating = ref<boolean>(false);

// TODO: need to track which plates from set are selected
const selectedBarWeight = ref<number>(45); // TODO: move to a getter
const selectedPlateSet = ref<number[]>(poundPlatesSet); // TODO: move to a getter

function calculateBarload() {
  validateFormData(formData.value);

  if (Object.values(errors.value).some((e) => e === true)) {
    return;
  }

  calculating.value = true;

  // TODO: what about if the weight entered is a decimal?
  if (formData.value.unit === UnitOfMeasure.Pound) {
    let remaining = formData.value.weight! - selectedBarWeight.value;
    let incrementor = 0;

    const results = new Map<number, number>();
    for (const plate of selectedPlateSet.value) {
      results.set(plate, 0);
    }

    while (remaining > 0) {
      let currentPlate = selectedPlateSet.value[incrementor];
      let totalPlateWeight = currentPlate * 2;

      if (remaining >= totalPlateWeight) {
        remaining -= totalPlateWeight;
        let currentPlateCount = results.get(currentPlate) || 0;
        results.set(currentPlate, (currentPlateCount += 2));
      } else {
        incrementor++;
      }

      if (incrementor > selectedPlateSet.value.length) {
        // TODO: show error message...toast?
        console.error("Unable to calculate barload");
        break;
      }
    }

    console.log(results);
    calculating.value = false;
  }
}

function validateFormData({ weight }: CalculateBarloadForm) {
  let hasError = false;

  if (!weight || weight <= 0 || isNaN(weight)) {
    hasError = true;
  } else {
    if (weight < selectedBarWeight.value) {
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
