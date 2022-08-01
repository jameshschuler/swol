<template>
  <div class="view">
    <article>
      <h2>Daily Gym Check-In</h2>
      <Alert
        v-if="!store.user"
        class="info-light"
        :alertType="AlertType.Info"
        :message="dailyCheckInNotLoggedInMessage"
      />
      <div v-if="loading" class="text-center d-flex justify-center flex-column align-items-center">
        <span>
          <i class="fa-solid fa-circle-notch fa-spin fa-3x"></i>
        </span>
        <span class="mt-sm">Loading gym check-ins</span>
      </div>
      <div v-if="store.user && !loading">
        <Calendar :isExpanded="true" titlePosition="left" :attributes="attrs" />
        <button
          class="mt-md"
          :aria-busy="fetching"
          :disabled="checkedInToday"
          @click="handleCheckIn()"
        >
          {{ checkedInToday ? "You've already checked in today!" : 'Check In' }}
        </button>
      </div>
    </article>
  </div>
</template>
<script setup lang="ts">
import Alert from '@/components/common/Alert.vue';
import { useGymCheckin } from '@/composables/useGymCheckin';
import { Marker } from '@/models/calendar';
import { dailyCheckInNotLoggedInMessage } from '@/models/constants';
import { GymCheckIn } from '@/models/db';
import { AlertType } from '@/models/enums';
import { store } from '@/store';
import { supabase } from '@/supabase';
import dayjs from 'dayjs';
import { ref } from 'vue';

const { error, fetching, addCheckin } = useGymCheckin();

const today = {
  key: 'today',
  highlight: {
    fillMode: 'outline',
  },
  dates: new Date(),
};

const attrs = ref<Array<Marker>>([]);
const checkedInToday = ref<boolean>(false);
const allCheckIns = ref<Array<GymCheckIn>>([]);
const loading = ref<boolean>();

async function handleCheckIn() {
  const checkIn = await addCheckin();
  if (checkIn && !error.value) {
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
  } else {
    console.log('TODO: handle error case');
  }
}

async function fetchCheckIns() {
  loading.value = true;

  // TODO: Move to reusable fetch composable
  // TODO: Store in state after initial load
  const { data, error } = await supabase.from<GymCheckIn>('gym_checkin');
  if (error) {
    console.log('TODO: handle error case');
  }

  allCheckIns.value = data || [];

  const markers = allCheckIns.value.map((checkIn: GymCheckIn, index: number) => {
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

fetchCheckIns();
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
