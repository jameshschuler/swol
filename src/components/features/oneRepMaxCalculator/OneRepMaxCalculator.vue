<template>
  <div class="view">
    <article>
      <h2>Estimated One-Rep Max</h2>
      <form @submit.prevent="calculateOneRepMax">
        <span>I lifted</span>
        <div class="grid">
          <input
            type="text"
            placeholder="Weight"
            v-model="formData.weight"
            :aria-invalid="errors.weight"
          />

          <select v-model="formData.unit">
            <option value="lbs">lbs.</option>
            <option value="kgs">kgs.</option>
          </select>
        </div>
        <label for="range" class="mt-xs">
          for <b>{{ formData.reps }}</b> rep(s).
          <input type="range" min="1" max="10" id="range" name="range" v-model="formData.reps" />
        </label>
        <button class="mt-sm" type="submit">Calculate Max</button>
      </form>
    </article>
    <OneRepMaxResults v-if="showResults" :unit-of-measure="calculatedUnitOfMeasure" />
  </div>
</template>
<script setup lang="ts">
import { CalculateMaxForm, CalculateMaxFormErrors } from '@/models/form';
import { store } from '@/store';
import { ref } from 'vue';
import OneRepMaxResults from './OneRepMaxResults.vue';

const formData = ref<CalculateMaxForm>({
  reps: 5,
  unit: 'lbs',
});

const calculatedUnitOfMeasure = ref<string>();
const showResults = ref<boolean>(false);

const errors = ref<CalculateMaxFormErrors>({});

function calculateOneRepMax() {
  validateFormData(formData.value);

  if (Object.values(errors.value).some((e) => e === true)) {
    return;
  }

  calculatedUnitOfMeasure.value = formData.value.unit;

  // TODO: move this logic to component
  store.calculateMaxes(formData.value.weight!, formData.value.reps);

  showResults.value = true;
}

function validateFormData({ weight }: CalculateMaxForm) {
  if (!weight || weight <= 0 || isNaN(weight)) {
    errors.value.weight = true;
  } else {
    errors.value.weight = false;
  }
}
</script>
<style lang="scss" scoped></style>
