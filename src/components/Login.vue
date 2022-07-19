<template>
  <div class="view">
    <article>
      <h2 class="text-center">Log in</h2>
      <button
        class="outline d-flex justify-center align-items-center"
        :aria-busy="loading && clickedProvider === LoginProvider.Google"
        :disabled="loading && clickedProvider !== LoginProvider.Google"
        @click="handleLogIn(LoginProvider.Google)"
      >
        <img
          class="mr-sm"
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
        />
        Continue with Google
      </button>
      <button
        class="github-button"
        :aria-busy="loading && clickedProvider === LoginProvider.GitHub"
        :disabled="loading && clickedProvider !== LoginProvider.GitHub"
        @click="handleLogIn(LoginProvider.GitHub)"
      >
        <i class="fa-brands fa-github fa-fw fa-lg mr-xs"></i>
        Continue with GitHub
      </button>
    </article>
  </div>
</template>
<script setup lang="ts">
import { LoginProvider } from '@/models/enums';
import { supabase } from '@/supabase';
import { ref } from 'vue';

const loading = ref<boolean>(false);
const clickedProvider = ref<LoginProvider | null>();

// TODO: do we need a profile table?
// TODO: actionbar position messed up after auth for first time

async function handleLogIn(provider: LoginProvider) {
  try {
    clickedProvider.value = provider;
    loading.value = true;

    const { error } = await supabase.auth.signIn({ provider: provider });
    console.error(error?.message);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
    clickedProvider.value = null;
  }
}
</script>
<style lang="scss" scoped>
.github-button {
  background-color: rgb(36, 41, 47);
}
</style>
