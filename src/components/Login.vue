<template>
  <div class="view">
    <article>
      <form>
        <h2 class="text-center">Log in</h2>
        <button class="outline d-flex justify-center align-items-center">
          <img
            class="mr-sm"
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          />
          Continue with Google
        </button>
        <button class="github-button">
          <i class="fa-brands fa-github fa-fw fa-lg mr-xs"></i>
          Continue with GitHub
        </button>
      </form>
    </article>
  </div>
</template>
<script setup lang="ts"></script>
<style lang="scss" scoped>
.github-button {
  background-color: rgb(36, 41, 47);
}
</style>
