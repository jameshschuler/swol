<template>
  <div id="drawer" :class="{ hidden: !common.isDrawerOpen }">
    <div class="d-flex justify-space-between">
      <div>
        <figure class="mb-none avatar" v-if="profile.profile?.avatar_url">
          <img id="open-drawer-btn" :src="profile.profile?.avatar_url" alt="" />
        </figure>
        <h4 class="mt-sm mb-none">{{ profile.profile?.full_name }}</h4>
        <h5 class="mt-none">{{ profile.profile?.username }}</h5>
      </div>
      <a class="outline" href="#" @click="common.isDrawerOpen = false">
        <i class="fa-solid fa-times fa-fw fa-lg"></i>
      </a>
    </div>
    <aside>
      <nav>
        <ul>
          <DrawerListItem to="/profile" text="Profile" icon="fa-address-card" />
          <DrawerListItem to="/pr-tracker" text="PR Tracker" icon="fa-trophy" />
          <hr />
          <DrawerListItem to="/privacy" text="Privacy Policy" icon="fa-user-lock" />
          <DrawerListItem to="/terms-conditions" text="Terms & Conditions" icon="fa-file-lines" />
          <DrawerListItem to="/about" text="About" icon="fa-circle-info" />
          <hr />
          <li>
            <a class="d-flex align-items-center" href="#" @click="handleSignOut()">
              <span class="icon">
                <i class="fa-solid fa-right-from-bracket fa-fw"></i>
              </span>
              <span class="ml-md">Sign out</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
  <Overlay />
</template>
<script setup lang="ts">
import DrawerListItem from '@/components/common/DrawerListItem.vue';
import Overlay from '@/components/common/Overlay.vue';
import { useCommonStore } from '@/stores/common';
import { useProfileStore } from '@/stores/profile';
import { supabase } from '@/supabase';
import { useRouter } from 'vue-router';

const router = useRouter();

const common = useCommonStore();
const profile = useProfileStore();

async function handleSignOut() {
  await supabase.auth.signOut();
  router.push('/login');
}
</script>
<style lang="scss" scoped>
#drawer {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background-color: #fff;
  width: 30%;
  box-shadow: 25px 0px 20px -20px rgba(27, 40, 50, 0.45);
  padding: 1.25rem;
  z-index: 3;
  transition: all 300ms ease-in-out;

  .icon {
    width: 24px;
  }

  &.hidden {
    left: -32%;
  }

  @include touch {
    width: 75%;

    &.hidden {
      left: -80%;
    }
  }

  .avatar {
    width: 72px;
    img {
      border-radius: 50%;
    }
  }
}
</style>
