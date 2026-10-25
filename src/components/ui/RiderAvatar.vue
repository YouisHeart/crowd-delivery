<script setup>
defineProps({
  size: { type: [Number, String], default: 48 },
  ring: { type: Boolean, default: true },
})
</script>

<template>
  <span
    class="rider-avatar"
    :class="{ 'has-ring': ring }"
    :style="{ width: `${size}px`, height: `${size}px` }"
    aria-hidden="true"
  >
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient id="avatar-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#F0FFA8" />
          <stop offset="1" stop-color="#C8F35A" />
        </linearGradient>
        <linearGradient id="avatar-visor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#1D222A" />
          <stop offset="1" stop-color="#3D4855" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill="url(#avatar-bg)" />
      <circle cx="32" cy="32" r="28.5" fill="none" stroke="#FFFFFF" stroke-opacity=".48" />
      <path d="M16 34c0-11.4 7.2-19.5 17-19.5 9.3 0 16 7.2 16 18.3" fill="#FFD100" />
      <path d="M13 34.5h39" stroke="#20242B" stroke-width="4" stroke-linecap="round" />
      <rect x="21" y="30" width="25" height="15" rx="7.5" fill="url(#avatar-visor)" />
      <path d="M26 34.2c3.4-4.2 9.5-4.2 13 0" stroke="#C9FF58" stroke-width="2.6" stroke-linecap="round" fill="none" />
      <path d="M38.5 48c0 2.2 1.8 4 4 4s4-1.8 4-4" fill="none" stroke="#20242B" stroke-width="1.7" stroke-linecap="round" />
      <circle cx="49" cy="17" r="2" fill="#FFF9B0" />
      <path d="M49 12.8v1.5M49 19.7v1.5M44.8 17h1.5M51.7 17h1.5" stroke="#FFF9B0" stroke-width="1.2" stroke-linecap="round" />
      <path d="M20 23c2.5-4.2 6-6.5 11.2-7.4" stroke="#FFF2A3" stroke-width="2.2" stroke-linecap="round" opacity=".9" />
    </svg>
  </span>
</template>

<style scoped>
.rider-avatar {
  display: inline-flex;
  flex: none;
  overflow: hidden;
  border-radius: 50%;
  background: #eaff9a;
}
.rider-avatar.has-ring {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.92), 0 4px 12px rgba(17, 20, 18, 0.16);
}
</style>
