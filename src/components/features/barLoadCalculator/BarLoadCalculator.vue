<template>
  <div class="view">
    <article>
      <h1 class="d-flex justify-space-between align-items-center">
        Barbell Load Calculator
        <span class="clickable" @click="open = true">
          <i class="fa-solid fa-gear fa-fw fa-xs"></i>
        </span>
      </h1>

      <form @submit.prevent="calculateBarLoad">
        <div class="grid">
          <label for="weight">
            Weight
            <input id="weight" name="weight" type="text" placeholder="Weight" v-model="formData.weight" :aria-invalid="errors.weight" />
          </label>
          <label for="">
            Unit of Measure
            <input type="text" :value="store.selectedPlateUnitOfMeasure" readonly />
          </label>
        </div>
        <button class="mt-sm" type="submit" :aria-busy="calculating">Calculate</button>
      </form>
    </article>
    <BarLoadResults v-if="results.size !== 0" :results="results" :unit-of-measure="store.selectedPlateUnitOfMeasure" />
  </div>
  <Modal title="Bar Load Calculator Settings" :open="open" @close="open = false" :options="modalConfig">
    <BarLoadCalculatorConfig />
  </Modal>
</template>
<script setup lang="ts">
import Modal from "@/components/common/Modal.vue";
import { UnitOfMeasure } from "@/models/enums";
import { CalculateBarLoadForm, CalculateBarLoadFormErrors } from "@/models/form";
import { ModalOptions } from "@/models/props";
import { SelectablePlate } from "@/models/selectablePlate";
import { store } from "@/store";
import { reactive, ref } from "vue";
import BarLoadCalculatorConfig from "./BarLoadCalculatorConfig.vue";
import BarLoadResults from "./BarLoadResults.vue";

//store.toasts.push({ type: ToastType.Error });

const open = ref<boolean>(false);

const modalConfig: ModalOptions = {
  buttons: {
    close: true,
  },
};

const formData = ref<CalculateBarLoadForm>({});

const errors = ref<CalculateBarLoadFormErrors>({});
const calculating = ref<boolean>(false);

const results = reactive<Map<number, number>>(new Map<number, number>());

function calculateBarLoad() {
  validateFormData(formData.value);

  if (Object.values(errors.value).some((e) => e === true)) {
    return;
  }

  calculating.value = true;

  let selectedPlates = new Array<SelectablePlate>();

  // TODO: what about if the weight entered is a decimal?
  if (store.selectedPlateUnitOfMeasure === UnitOfMeasure.Pound) {
    selectedPlates = store.selectablePoundPlates.filter((p) => p.selected);
  } else if (store.selectedPlateUnitOfMeasure === UnitOfMeasure.Kilogram) {
    selectedPlates = store.selectableKilogramPlates.filter((p) => p.selected);
  }

  if (selectedPlates.length === 0) {
    // TODO: show error message...toast?
    console.error("Unable to calculate barload: no selected plates");
    calculating.value = false;
    results.clear();
    return;
  }

  console.log(selectedPlates);

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

    if (incrementor >= selectedPlates.length) {
      // TODO: show error message...toast?
      console.error("Unable to calculate barload: not enough selected plates");
      calculating.value = false;
      results.clear();
      break;
    }
  }

  calculating.value = false;
}

function validateFormData({ weight }: CalculateBarLoadForm) {
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
