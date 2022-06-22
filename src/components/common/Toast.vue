<template>
  <div class="toast d-flex align-items-center" v-if="showing" :class="[{ show: showing }, props.type]">
    <div class="icon pr-md">
      <span>
        <i class="fa-solid fa-fw fa-xl" :class="typeIcon"></i>
      </span>
    </div>
    <div class="toast-content">
      <h5 class="title mb-none">Error</h5>
      <p class="message">Hello I'm a Toast!</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ToastType } from "@/models/enums";
import { computed, PropType, ref } from "vue";

const props = defineProps({
  duration: {
    type: Number,
    default: 3500,
  },
  type: {
    type: String as PropType<ToastType>,
    default: ToastType.Default,
  },
});

const showing = ref<boolean>(true);
const typeIcon = computed(() => {
  switch (props.type) {
    case ToastType.Default:
      return "fa-circle-info";
    case ToastType.Error:
      return "fa-circle-exclamation";
    case ToastType.Warning:
      return "fa-triangle-exclamation";
    case ToastType.Success:
      return "fa-circle-check";
    default:
      return "fa-circle-info";
  }
});

setTimeout(() => {
  showing.value = false;
}, props.duration);
</script>
<style lang="scss" scoped>
.toast {
  color: hsl(0, 0%, 100%);
  position: fixed;
  width: 400px;
  right: 20px;
  bottom: 20px;
  padding: 0.75rem;
  border-radius: 0.5rem;
  z-index: 2;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px 0px;

  @include mobile {
    width: 90%;
    bottom: 30px;
  }

  &.default {
    background-color: #2f96b4;
  }

  &.error {
    background-color: #bd362f;
  }

  &.warning {
    background-color: #f89406;
  }

  &.success {
    background-color: #51a351;
  }

  &.show {
    -webkit-animation: fadein 0.5s, fadeout 0.5s 3s;
    animation: fadein 0.5s, fadeout 0.5s 3s;
  }

  .icon,
  .title,
  .message {
    color: hsl(0, 0%, 100%);
  }

  .message {
    margin-bottom: 0.5rem;
  }
}

@-webkit-keyframes fadein {
  from {
    bottom: 0;
    opacity: 0;
  }
  to {
    bottom: 20px;
    opacity: 1;
  }
}

@keyframes fadein {
  from {
    bottom: 0;
    opacity: 0;
  }
  to {
    bottom: 20px;
    opacity: 1;
  }
}

@-webkit-keyframes fadeout {
  from {
    bottom: 20px;
    opacity: 1;
  }
  to {
    bottom: 0;
    opacity: 0;
  }
}

@keyframes fadeout {
  from {
    bottom: 20px;
    opacity: 1;
  }
  to {
    bottom: 0;
    opacity: 0;
  }
}
</style>
