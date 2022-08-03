<template>
  <div
    class="toast d-flex align-items-center mt-xs mb-xs"
    v-if="showing"
    :class="[{ show: showing }, props.type]"
  >
    <div class="icon pr-md">
      <span>
        <i class="fa-solid fa-fw fa-xl" :class="typeIcon"></i>
      </span>
    </div>
    <div class="toast-content">
      <h5 class="title mb-none">Error</h5>
      <p class="message">{{ props.message }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ToastType } from '@/models/enums';
import { useToastStore } from '@/stores/toasts.js';
import { computed, PropType, ref } from 'vue';

const { removeToast } = useToastStore();

const props = defineProps({
  duration: {
    type: Number,
    default: 500,
    required: false,
  },
  delay: {
    type: Number,
    default: 3000,
    required: false,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String as PropType<ToastType>,
    default: ToastType.Default,
  },
});

const animationDuration = ref<string>(`${props.duration / 1000}s`);
const animationDelay = ref<string>(`${props.delay / 1000}s`);

const showing = ref<boolean>(true);
const typeIcon = computed(() => {
  switch (props.type) {
    case ToastType.Default:
      return 'fa-circle-info';
    case ToastType.Error:
      return 'fa-circle-exclamation';
    case ToastType.Warning:
      return 'fa-triangle-exclamation';
    case ToastType.Success:
      return 'fa-circle-check';
    default:
      return 'fa-circle-info';
  }
});

setTimeout(() => {
  showing.value = false;
  removeToast();
}, props.delay + props.duration);
</script>
<style lang="scss" scoped>
.toast {
  color: hsl(0, 0%, 100%);
  width: 400px;
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
    -webkit-animation: fadein v-bind(animationDuration),
      fadeout v-bind(animationDuration) v-bind(animationDelay);
    animation: fadein v-bind(animationDuration),
      fadeout v-bind(animationDuration) v-bind(animationDelay);
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
