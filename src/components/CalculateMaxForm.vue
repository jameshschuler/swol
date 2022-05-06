<template>
  <form @submit.prevent="calculateOneRepMax">
    <span>I lifted</span>
    <div class="grid">
      <input type="text" placeholder="weight" v-model="formData.weight" :aria-invalid="errors.weight" />

      <select v-model="formData.unit">
        <option value="lb">lbs.</option>
        <option value="kg">kgs.</option>
      </select>
    </div>
    <label for="range" class="mt-xs">
      for <b>{{ formData.reps }}</b> rep(s).
      <input type="range" min="1" max="10" id="range" name="range" v-model="formData.reps" />
    </label>
    <button class="mt-sm" type="submit">Calculate Max</button>
  </form>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { CalculateMaxForm, CalculateMaxFormErrors } from "../models/form";
import { store } from "../store";

const formData = ref<CalculateMaxForm>({
  reps: 5,
  unit: "lb",
});

const errors = ref<CalculateMaxFormErrors>({});

function calculateOneRepMax() {
  validateFormData(formData.value);

  if (Object.values(errors.value).some((e) => e === true)) {
    return;
  }

  store.calculateMaxes(formData.value.weight!, formData.value.reps);
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
