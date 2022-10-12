<template>
  <div class="view">
    <article>
      <h2 class="d-flex justify-space-between align-items-center">
        Barbell Load Calculator
        <span class="clickable" @click="open = true">
          <i class="fa-solid fa-gear fa-fw fa-xs"></i>
        </span>
      </h2>

      <form @submit.prevent="calculateBarLoad">
        <div class="grid">
          <label for="weight">
            Weight
            <input
              id="weight"
              name="weight"
              type="text"
              placeholder="Weight"
              v-model="formData.weight"
              :aria-invalid="errors.weight"
            />
          </label>
          <label for="">
            Unit of Measure
            <input type="text" :value="barLoad.selectedPlateSetUom" readonly />
          </label>
        </div>
        <button class="mt-sm" type="submit" :aria-busy="calculating">Calculate</button>
      </form>
    </article>
    <BarLoadResults
      v-if="results.size !== 0"
      :results="results"
      :unit-of-measure="barLoad.selectedPlateSetUom"
    />
  </div>
  <Modal
    title="Bar Load Calculator Settings"
    :open="open"
    @close="open = false"
    :options="modalConfig"
  >
    <BarLoadCalculatorConfig :selected-plate-uom="barLoad.selectedPlateSetUom" />
  </Modal>
</template>
<script setup lang="ts">
import Modal from '@/components/common/Modal.vue';
import { ToastType, UnitOfMeasure } from '@/models/enums';
import { CalculateBarLoadForm, CalculateBarLoadFormErrors } from '@/models/form';
import { ModalOptions } from '@/models/props';
import { SelectableBarbell } from '@/models/selectableBarbell';
import { SelectablePlate } from '@/models/selectablePlate';
import { useBarLoadStore } from '@/stores/barLoad';
import { useToastStore } from '@/stores/toasts';
import { reactive, ref } from 'vue';
import BarLoadCalculatorConfig from './BarLoadCalculatorConfig.vue';
import BarLoadResults from './BarLoadResults.vue';

const { addToast } = useToastStore();
const barLoad = useBarLoadStore();

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

const selectedBarbell: SelectableBarbell = {
  weight: 45,
  unitOfMeasure: UnitOfMeasure.Pound,
};

function calculateBarLoad() {
  validateFormData(formData.value);

  if (Object.values(errors.value).some((e) => e === true)) {
    return;
  }

  calculating.value = true;

  let selectedPlates = new Array<SelectablePlate>();

  if (barLoad.selectedPlateSetUom === UnitOfMeasure.Pound) {
    selectedPlates = barLoad.selectablePoundPlates.filter((p) => p.selected);
  } else if (barLoad.selectedPlateSetUom === UnitOfMeasure.Kilogram) {
    selectedPlates = barLoad.selectableKilogramPlates.filter((p) => p.selected);
  }

  if (selectedPlates.length === 0) {
    addToast({
      type: ToastType.Error,
      message: 'No plates were selected.',
    });
    calculating.value = false;
    results.clear();
    return;
  }

  let remaining = formData.value.weight! - selectedBarbell.weight;
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
      addToast({
        type: ToastType.Error,
        message: 'Unable to calculate bar load.',
      });
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
    if (weight < selectedBarbell.weight) {
      addToast({
        type: ToastType.Error,
        message: `Weight (${weight}) must be greater than selected bar weight (${selectedBarbell.weight}).`,
      });

      hasError = true;
    }

    // TODO: Need to support decimal weights
    if (weight - Math.floor(weight) !== 0) {
      addToast({
        type: ToastType.Error,
        message: 'Weight must be a whole number',
      });
      hasError = true;
    }
  }

  errors.value.weight = hasError;
}
</script>
<style lang="scss" scoped></style>
