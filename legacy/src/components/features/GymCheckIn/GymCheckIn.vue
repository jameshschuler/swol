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
        <Calendar
          :isExpanded="true"
          titlePosition="left"
          :attributes="attrs"
          @dayclick="onDayClick"
        />

        <button
          class="mt-md"
          :class="{ 'warning-btn': hasCheckIn && currentlySelectedCheckInId !== null }"
          :aria-busy="checkInStore.processing"
          @click="handleCheckInAction()"
        >
          {{ checkInButtonText }}
        </button>
      </div>
    </article>
  </div>
</template>
<script setup lang="ts">
import LoadingIndicator from '@/components/common/LoadingIndicator.vue';
import { Marker } from '@/models/calendar';
import { GymCheckIn } from '@/models/db';
import { useCheckInStore } from '@/stores/checkIn';
import { useToastStore } from '@/stores/toasts';
import dayjs from 'dayjs';
import { computed, onMounted, ref } from 'vue';

const checkInStore = useCheckInStore();
const toast = useToastStore();

const today = {
  key: 'today',
  highlight: {
    fillMode: 'outline',
  },
  dates: new Date(),
  customData: {},
};

const attrs = ref<Array<Marker>>([]);
const loading = ref<boolean>();

const hasCheckIn = ref<boolean>(false);
const currentlySelectedCheckInId = ref<number | null>(null);
const currentlySelectedDate = ref<string | null>(dayjs.utc().format());

const checkInButtonText = computed(() => {
  if (hasCheckIn.value && currentlySelectedCheckInId.value !== null) {
    return 'Undo';
  }
  return 'Check In';
});

async function handleCheckInAction() {
  if (hasCheckIn.value && currentlySelectedCheckInId.value !== null) {
    // TODO: prompt user with are you sure? Modal
    await handleRemoveCheckIn();
  } else {
    await handleCheckIn();
  }
}

async function handleCheckIn() {
  const checkIn = await checkInStore.addCheckIn(currentlySelectedDate.value || '');

  if (checkInStore.error || !checkIn) {
    loading.value = false;
    return;
  }

  hasCheckIn.value = true;
  currentlySelectedCheckInId.value = checkIn.id;

  attrs.value = [
    ...attrs.value,
    {
      key: `checkin_new`,
      highlight: {
        fillMode: 'light',
        color: 'green',
      },
      dates: dayjs(checkIn.checkin_date).local().toDate(),
      customData: { checkInId: checkIn.id },
    },
  ];
}

async function handleRemoveCheckIn() {
  const removed = await checkInStore.removeCheckIn(currentlySelectedCheckInId.value!);
  if (removed) {
    hasCheckIn.value = false;
    currentlySelectedCheckInId.value = null;

    updateMarkers();
  }
}

function updateMarkers() {
  const markers = checkInStore.checkIns.map((checkIn: GymCheckIn, index: number) => {
    const checkInDate = dayjs(checkIn.checkin_date).local();

    return {
      key: `checkIn_${index}`,
      highlight: {
        fillMode: 'light',
        color: 'green',
      },
      dates: checkInDate.toDate(),
      customData: { checkInId: checkIn.id },
    };
  });

  attrs.value = [today, ...markers];
}

async function loadCheckIns() {
  loading.value = true;

  if (checkInStore.checkIns.length === 0) {
    await checkInStore.getCheckIns();
    loading.value = false;
  }

  updateMarkers();
  loading.value = false;
}

function onDayClick(day) {
  currentlySelectedDate.value = dayjs(day.id).utc().format();

  const id = day.attributes[0]?.customData?.checkInId;
  if (id) {
    hasCheckIn.value = true;
    currentlySelectedCheckInId.value = id;
  } else {
    hasCheckIn.value = false;
    currentlySelectedCheckInId.value = null;
  }

  const currentlySelectedAttr = attrs.value.findIndex((a) => a.key === 'currently_selected');
  if (currentlySelectedAttr !== -1) {
    attrs.value.splice(currentlySelectedAttr, 1);
  }

  attrs.value.push({
    key: `currently_selected`,
    highlight: {
      fillMode: 'light',
      color: 'blue',
    },
    dates: dayjs(day.id).local().toDate(),
    customData: {},
  });
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
