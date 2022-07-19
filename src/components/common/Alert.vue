<template>
  <div class="alert">
    <div class="icon pl-sm pr-sm">
      <span>
        <i class="fa-solid fa-circle-info fa-fw fa-xl"></i>
      </span>
    </div>
    <div class="alert-body">
      <strong class="title">Info!</strong>
      <p class="mb-none">
        {{ props.message }}
      </p>
      <router-link class="mt-sm outline" to="/login" role="button">Login</router-link>
    </div>
  </div>
</template>
<script setup lang="ts">
import { AlertType } from '@/models/enums';
import { PropType } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String as PropType<AlertType>,
    required: false,
  },
  icon: {
    type: String,
    required: false,
  },
});
</script>
<style lang="scss" scoped>
.alert {
  background-color: #f5f5f5;
  border-radius: 0.375em;
  position: relative;
  padding: 1.25rem 2.5rem 1.25rem 1.5rem;
  display: flex;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px 0px;

  .title {
    font-size: 1.25rem;
    line-height: 0.25rem;
  }

  &.warning {
    background-color: #ffe08a;
    color: rgba(0, 0, 0, 0.7);
  }

  &.info {
    background-color: #3e8ed0;
    color: #fff;
  }

  &.info-light {
    background-color: #eff5fb;
    color: #296fa8;
  }

  .delete {
    right: 0.5rem;
    position: absolute;
    top: 0.5rem;
  }
}
</style>
