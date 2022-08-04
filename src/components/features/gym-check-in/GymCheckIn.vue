<template>
  <div class="view">
    <article>
      <h2>Daily Gym Check-In</h2>
      <LoadingIndicator
        v-if="loading"
        class="text-center d-flex justify-center flex-column align-items-center"
        size="fa-3x"
        text="Loading gym check-ins"
      />
      <div v-if="!loading">
        <Calendar :isExpanded="true" titlePosition="left" :attributes="attrs" />
        <button
          class="mt-md"
          :aria-busy="checkInStore.processing"
          :disabled="checkedInToday"
          @click="handleCheckIn()"
        >
          {{ checkedInToday ? 'Checked In!' : 'Check In' }}
        </button>
      </div>
    </article>
  </div>
</template>
<script setup lang="ts">
import LoadingIndicator from '@/components/common/LoadingIndicator.vue';
import { Marker } from '@/models/calendar';
import { GymCheckIn } from '@/models/db';
import { useCheckInStore } from '@/stores/checkIn.js';
import dayjs from 'dayjs';
import { onMounted, ref } from 'vue';

const checkInStore = useCheckInStore();

const today = {
  key: 'today',
  highlight: {
    fillMode: 'outline',
  },
  dates: new Date(),
};

const attrs = ref<Array<Marker>>([]);
const checkedInToday = ref<boolean>(false);
const loading = ref<boolean>();

async function handleCheckIn() {
  const checkIn = await checkInStore.addCheckIn();

  if (checkInStore.error || !checkIn) {
    // TODO: display error message
    loading.value = false;
    return;
  }

  checkedInToday.value = true;

  attrs.value = [
    ...attrs.value,
    {
      key: `checkin_new`,
      highlight: {
        fillMode: 'light',
        color: 'green',
      },
      dates: dayjs(checkIn.checkin_date).local().toDate(),
    },
  ];
}

async function loadCheckIns() {
  loading.value = true;

  if (checkInStore.checkIns.length === 0) {
    await checkInStore.getCheckIns();

    if (checkInStore.error) {
      loading.value = false;
      // TODO: display error message
      return;
    }
  }

  const markers = checkInStore.checkIns.map((checkIn: GymCheckIn, index: number) => {
    const checkInDate = dayjs(checkIn.checkin_date).local();
    if (checkInDate.isToday()) {
      checkedInToday.value = true;
    }

    return {
      key: `checkIn_${index}`,
      highlight: {
        fillMode: 'light',
        color: 'green',
      },
      dates: checkInDate.toDate(),
    };
  });

  attrs.value = [today, ...markers];
  loading.value = false;
}

onMounted(() => {
  loadCheckIns();
});
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
