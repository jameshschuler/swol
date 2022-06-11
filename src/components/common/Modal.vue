<template>
  <dialog :open="isOpen" id="modal">
    <article ref="modalContent" :class="props.options?.size ?? 'normal'">
      <header>
        <a aria-label="Close" class="close clickable" @click="close()"></a>
        {{ title }}
      </header>
      <slot></slot>
      <footer>
        <a v-if="props.options?.buttons?.close" role="button" class="secondary clickable" data-target="modal" href="" @click.prevent="close()">
          Close
        </a>
        <a v-if="props.options?.buttons?.cancel" role="button" class="secondary clickable" data-target="modal" href="" @click.prevent="close()">
          Cancel
        </a>
        <a
          v-if="props.options?.buttons?.save && props.options.onSave"
          role="button"
          class="clickable"
          data-target="modal"
          href=""
          @click.prevent="handleOnSave()"
        >
          Save
        </a>
      </footer>
    </article>
  </dialog>
</template>
<script setup lang="ts">
import { ModalOptions } from "@/models/props";
import { PropType, ref, watch } from "vue";

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

function handleOnSave() {
  // TODO: maybe onSave should return a promise
  props.options?.onSave!();
  close();
}

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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isOpen.value) {
    close();
  }
});

watch(
  () => props.open,
  (newValue: boolean, oldValue: boolean) => {
    if (newValue) {
      open();
    }
  }
);
</script>
<style lang="scss" scoped>
dialog article {
  @include touch {
    width: 95% !important;
  }

  .small {
  }

  &.normal {
    width: 50%;
  }

  .large {
  }
}
</style>
