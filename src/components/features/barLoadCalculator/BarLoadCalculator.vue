<template>
  <div class="view">
    <article>
      <h1>Barload Calculator</h1>
      <form @submit.prevent="calculateBarload">
        <div class="grid">
          <label for="weight">
            Weight
            <input id="weight" name="weight" type="text" placeholder="Weight" />
          </label>

          <label for="uom">
            Unit of Measure
            <select id="uom" name="uom">
              <option value="lbs">lbs.</option>
              <option value="kgs">kgs.</option>
            </select>
          </label>
        </div>
        <button class="mt-sm" type="submit">Calculate</button>
      </form>
    </article>
  </div>
</template>
<script setup lang="ts">
import { CalculateBarloadForm, CalculateBarloadFormErrors } from "@/models/form";
import { ref } from "vue";

const formData = ref<CalculateBarloadForm>({
  unit: "lbs",
});

const errors = ref<CalculateBarloadFormErrors>({});

function calculateBarload() {
  validateFormData(formData.value);

  if (Object.values(errors.value).some((e) => e === true)) {
    return;
  }
}

function validateFormData({ weight }: CalculateBarloadForm) {
  if (!weight || weight <= 0 || isNaN(weight)) {
    errors.value.weight = true;
  } else {
    errors.value.weight = false;
  }
}
</script>
<style lang="scss" scoped></style>
