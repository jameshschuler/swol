<template>
  <dialog :open="isOpen" id="modal">
    <article ref="modalContent">
      <header>
        <a aria-label="Close" class="close clickable" @click="close()"></a>
        {{ title }}
      </header>
      <slot></slot>
      <footer>
        <a role="button" class="secondary clickable" data-target="modal" @click="close()">Close</a>
        <!-- <a href="#confirm" role="button" data-target="modal-example" onClick="toggleModal(event)"> Confirm </a> -->
      </footer>
    </article>
  </dialog>
</template>
<script setup lang="ts">
import { PropType, ref, watch } from "vue";

interface ModalOptions {
  // TODO: config for which buttons to show
  size: string;
}

const props = defineProps({
  open: Boolean,
  title: String,
  options: Object as PropType<ModalOptions>,
});

const emit = defineEmits(["close"]);

// Config
const isOpenClass = "modal-is-open";
const openingClass = "modal-is-opening";
const closingClass = "modal-is-closing";
const animationDuration = 200; // ms

const isOpen = ref<boolean>(false);
const modalContent = ref();

function open() {
  document.documentElement.classList.add(isOpenClass, openingClass);
  setTimeout(() => {
    document.documentElement.classList.remove(openingClass);
    isOpen.value = true;
  }, animationDuration);
}

function close() {
  document.documentElement.classList.add(closingClass);
  setTimeout(() => {
    document.documentElement.classList.remove(closingClass, isOpenClass);

    isOpen.value = false;
    emit("close");
  }, animationDuration);
}

// Close with a click outside
document.addEventListener("click", (event) => {
  if (isOpen.value) {
    const isClickInside = modalContent.value.contains(event.target);
    if (!isClickInside) {
      close();
    }
  }
});

// Close with Esc key
// document.addEventListener('keydown', event => {
//   if (event.key === 'Escape' && visibleModal != null) {
//     closeModal(visibleModal);
//   }
// });

watch(
  () => props.open,
  (newValue: boolean, oldValue: boolean) => {
    if (newValue) {
      open();
    }
  }
);
</script>
<style lang="scss" scoped></style>
