<template>
  <div class="view">
    <article>
      <h2>Daily Gym Check-In</h2>
      <Alert
        v-if="!loggedIn"
        class="info-light"
        :alertType="AlertType.Info"
        :message="dailyCheckInNotLoggedInMessage"
      />
      <Calendar is-expanded title-position="left" :attributes="attrs" v-if="loggedIn" />
      <button class="mt-md" v-if="loggedIn">Check-In</button>
    </article>
  </div>
</template>
<script setup lang="ts">
import Alert from '@/components/common/Alert.vue';
import { dailyCheckInNotLoggedInMessage } from '@/models/constants';
import { AlertType } from '@/models/enums';
import { Calendar } from 'v-calendar';
import { ref } from 'vue';

const loggedIn = ref<boolean>(false);

const attrs = [
  {
    key: 'today',
    highlight: true,
    dates: new Date(),
  },
];
</script>
<style lang="scss" scoped>
:deep(.vc-header) {
  padding-bottom: 0.5rem;
}

:deep(div.vc-arrow[role='button']) {
  padding: 0;
  background-color: hsl(0, 0%, 100%);

  &:hover {
    background-color: #ccd6e04d !important;
  }
}

:deep(span.vc-nav-title[role='button']) {
  padding: 4px 8px;
  background-color: #2d3748;
  font-size: 0.75rem;
}

:deep(span.vc-nav-arrow[role='button']) {
  padding: 0.5rem;
  background-color: #2d3748;

  &:hover {
    background-color: var(--gray-900);
  }
}

:deep(span.vc-nav-item[role='button']) {
  padding: 4px 0;
  background-color: #2d3748;
  font-size: 0.75rem;

  &.is-active {
    color: var(--accent-900);
    background: var(--accent-100);
    font-weight: var(--font-bold);
    box-shadow: var(--shadow);
  }

  &:hover {
    background-color: var(--gray-900);
  }
}

:deep(span.vc-day-content[role='button']) {
  background-color: inherit;
  color: rgb(26, 32, 44);
  border: 0 solid #e2e8f0;

  &:hover {
    background-color: #ccd6e04d !important;
  }
}
</style>
