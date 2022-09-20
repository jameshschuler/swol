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
          <li>
            <router-link to="/profile" class="d-flex align-items-center">
              <span class="icon"><i class="fa-solid fa-address-card fa-fw"></i></span>
              <span class="ml-md">Profile</span>
            </router-link>
          </li>
          <hr />
          <li>
            <!-- TODO: make this a component -->
            <router-link to="/privacy" class="d-flex align-items-center">
              <span class="icon"><i class="fa-solid fa-user-lock fa-fw"></i></span>
              <span class="ml-md">Privacy Policy</span>
            </router-link>
          </li>
          <li>
            <router-link to="/terms-conditions" class="d-flex align-items-center">
              <span class="icon"><i class="fa-solid fa-file-lines fa-fw"></i></span>
              <span class="ml-md">Terms & Conditions</span>
            </router-link>
          </li>
          <li>
            <router-link to="/about" class="d-flex align-items-center">
              <span class="icon"><i class="fa-solid fa-circle-info fa-fw"></i></span>
              <span class="ml-md">About</span>
            </router-link>
          </li>
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
