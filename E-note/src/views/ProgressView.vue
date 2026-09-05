<template>
  <div class="grid gap-6">
    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-xs uppercase tracking-[0.24em] text-slate-500">Study tracking</p>
      <h1 class="mt-2 text-3xl font-semibold text-slate-900">Progress</h1>
      <p class="mt-2 text-slate-600">Track study time, completed documents, and review streaks.</p>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-slate-500">Total study time</p>
        <strong class="mt-3 block text-2xl text-slate-900">0h</strong>
      </div>
      <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-slate-500">Weekly study time</p>
        <strong class="mt-3 block text-2xl text-slate-900">0h</strong>
      </div>
      <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-slate-500">Study streak</p>
        <strong class="mt-3 block text-2xl text-slate-900">0 days</strong>
      </div>
      <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-slate-500">Completed documents</p>
        <strong class="mt-3 block text-2xl text-slate-900">0</strong>
      </div>
    </section>
  </div>
</template>
