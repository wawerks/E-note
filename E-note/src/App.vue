<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { bootstrapAuth } from './lib/auth'

onMounted(() => {
  void bootstrapAuth()
})
</script>

<template>
  <RouterView />
</template>