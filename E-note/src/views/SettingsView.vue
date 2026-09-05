<template>
  <div class="grid gap-6">
    <section class="soft-card p-6">
      <p class="eyebrow">Settings</p>
      <h1 class="mt-2 text-3xl font-semibold text-[#344767]">Preferences</h1>
      <p class="mt-2 text-[#67748e]">Profile, theme, and notification controls will live here.</p>
    </section>

    <section class="soft-card p-10 text-center">
      <h2 class="text-2xl font-semibold text-[#344767]">Settings workspace</h2>
      <p class="mt-2 text-[#67748e]">Connect profile editing and preferences here next.</p>
    </section>
  </div>
</template>

<style scoped>
.soft-card {
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.02),
    0 8px 24px rgba(0, 0, 0, 0.04);
}

.eyebrow {
  margin: 0;
  color: #67748e;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
</style>
