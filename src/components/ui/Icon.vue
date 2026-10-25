<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  strokeWidth: { type: [Number, String], default: 1.9 },
})
</script>

<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'home'">
      <path d="M3 10.8 12 3l9 7.8" />
      <path d="M5.4 9.5V21h13.2V9.5" />
      <path d="M9.6 21v-6.2h4.8V21" />
    </template>
    <template v-else-if="name === 'orders'">
      <path d="M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8z" />
      <path d="M9 8h6M9 11.5h6M9 15h3.5" />
    </template>
    <template v-else-if="name === 'route'">
      <circle cx="6.2" cy="5.5" r="2.2" />
      <circle cx="17.8" cy="18.5" r="2.2" />
      <path d="M8.4 5.5h4.4a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.6" />
    </template>
    <template v-else-if="name === 'earnings' || name === 'wallet'">
      <path d="M4 6.5h14.2A1.8 1.8 0 0 1 20 8.3v9.2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h11.2" />
      <path d="M16.4 12.7h3.6v4h-3.6a2 2 0 0 1 0-4Z" />
      <path d="M3 6.5h13.3" />
    </template>
    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c.8-4 3.4-6 7.5-6s6.7 2 7.5 6" />
    </template>
    <template v-else-if="name === 'menu'">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </template>
    <template v-else-if="name === 'bell'">
      <path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 4 1.5 5.2 2 6.2H4.5c.5-1 2-2.2 2-6.2Z" />
      <path d="M9.5 19a2.8 2.8 0 0 0 5 0" />
    </template>
    <template v-else-if="name === 'chevron-left'">
      <path d="m15 5-7 7 7 7" />
    </template>
    <template v-else-if="name === 'chevron-right'">
      <path d="m9 5 7 7-7 7" />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <path d="m5 9 7 7 7-7" />
    </template>
    <template v-else-if="name === 'arrow-right'">
      <path d="M4 12h16M14 6l6 6-6 6" />
    </template>
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </template>
    <template v-else-if="name === 'location'">
      <path d="M19 10c0 5-7 10.5-7 10.5S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2.4" />
    </template>
    <template v-else-if="name === 'navigation'">
      <path d="m20.5 3.5-8 17-2.2-6.8-6.8-2.2z" />
    </template>
    <template v-else-if="name === 'phone'">
      <path d="M7 4.5 9.7 8 8 10.4c1 2.4 3.2 4.6 5.6 5.6l2.4-1.7 3.5 2.7c.2.2.3.5.2.8-.5 1.7-2 2.9-3.8 2.6C9.5 19.3 4.7 14.5 3.6 8.1c-.3-1.8.9-3.3 2.6-3.8.3-.1.6 0 .8.2Z" />
    </template>
    <template v-else-if="name === 'alert'">
      <path d="M12 3.5 21 20H3z" />
      <path d="M12 9v5M12 17.2v.2" />
    </template>
    <template v-else-if="name === 'transfer'">
      <path d="M4 8h14M14 4l4 4-4 4" />
      <path d="M20 16H6M10 12l-4 4 4 4" />
    </template>
    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </template>
    <template v-else-if="name === 'star'">
      <path
        d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"
        fill="currentColor"
        stroke="none"
      />
    </template>
    <template v-else-if="name === 'check'">
      <path d="m4.5 12.5 5 5 10-11" />
    </template>
    <template v-else-if="name === 'check-circle'">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.6 2.6L16.5 8.8" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="M6 6l12 12M18 6 6 18" />
    </template>
    <template v-else-if="name === 'filter'">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </template>
    <template v-else-if="name === 'refresh'">
      <path d="M20 7v5h-5" />
      <path d="M4.7 17A8 8 0 0 0 19.5 12" />
      <path d="M4 17v-5h5" />
      <path d="M19.3 7A8 8 0 0 0 4.5 12" />
    </template>
    <template v-else-if="name === 'bag'">
      <path d="M5.5 8h13l1 12.5h-15z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </template>
    <template v-else-if="name === 'shield'">
      <path d="M12 3 20 6v5.8c0 4.3-2.7 7.6-8 9.2-5.3-1.6-8-4.9-8-9.2V6z" />
      <path d="m8.7 12 2.2 2.2 4.4-4.5" />
    </template>
    <template v-else-if="name === 'gift'">
      <path d="M4 9.5h16V13H4zM5.5 13v8h13v-8M12 9.5V21" />
      <path d="M12 9.5S8.4 9.8 8 7.2c-.3-2.1 2.5-2.8 3.2-.9.5 1.3.8 3.2.8 3.2ZM12 9.5s3.6.3 4-2.3c.3-2.1-2.5-2.8-3.2-.9-.5 1.3-.8 3.2-.8 3.2Z" />
    </template>
    <template v-else-if="name === 'headset'">
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <path d="M4 12h2.2v5H5a1 1 0 0 1-1-1zM20 12h-2.2v5H19a1 1 0 0 0 1-1z" />
      <path d="M17.8 17c0 2-2.2 3-5 3" />
    </template>
    <template v-else-if="name === 'bike'">
      <circle cx="5.5" cy="17" r="3.1" />
      <circle cx="18.5" cy="17" r="3.1" />
      <path d="m6 17 3.2-6h5.4l3.4 6M9.2 11l2.2 6M14.6 11H9.8M15.5 8h2.2" />
    </template>
    <template v-else-if="name === 'city'">
      <path d="M4 21V8l5-3v16M9 21V11h7v10M16 21V5l4 3v13" />
      <path d="M6 10v.1M6 13v.1M6 16v.1M12 14v.1M12 17v.1" />
    </template>
    <template v-else-if="name === 'box'">
      <path d="m4 7 8-4 8 4-8 4zM4 7v10l8 4 8-4V7M12 11v10" />
    </template>
    <template v-else-if="name === 'more'">
      <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'compass'">
      <circle cx="12" cy="12" r="8.7" />
      <path d="m15.7 8.3-2.1 5.3-5.3 2.1 2.1-5.3z" />
    </template>
    <template v-else-if="name === 'info'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10.5V17M12 7v.2" />
    </template>
    <template v-else-if="name === 'lock'">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
    </template>
    <template v-else-if="name === 'logout'">
      <path d="M14 4H5v16h9M10 12h10M17 8l4 4-4 4" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="10.7" cy="10.7" r="6.2" />
      <path d="m15.3 15.3 4.2 4.2" />
    </template>
    <template v-else-if="name === 'spark'">
      <path d="M12 3c.4 4.6 2.1 6.3 6.7 6.7-4.6.4-6.3 2.1-6.7 6.7-.4-4.6-2.1-6.3-6.7-6.7C9.9 9.3 11.6 7.6 12 3Z" />
      <path d="M19 15.5c.2 1.8.9 2.5 2.7 2.7-1.8.2-2.5.9-2.7 2.7-.2-1.8-.9-2.5-2.7-2.7 1.8-.2 2.5-.9 2.7-2.7Z" />
    </template>
    <template v-else-if="name === 'calendar'">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M7.5 3v4M16.5 3v4M3.5 10h17" />
    </template>
    <template v-else-if="name === 'plus'">
      <path d="M12 5v14M5 12h14" />
    </template>
    <template v-else-if="name === 'timer'">
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M9 2.5h6M12 6v2M12 13.5l3-2" />
    </template>
    <template v-else-if="name === 'cash'">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6.5 9v.1M17.5 15v.1" />
    </template>
    <template v-else-if="name === 'store'">
      <path d="M4 10v10h16V10M3 10l2-6h14l2 6" />
      <path d="M3 10c0 1.5 1.2 2.5 2.8 2.5S8.5 11.5 8.5 10c0 1.5 1.2 2.5 2.8 2.5s2.8-1 2.8-2.5c0 1.5 1.2 2.5 2.8 2.5S19.5 11.5 19.5 10c0 1.5-1 2.5-2.5 2.5" />
      <path d="M9 20v-5h6v5" />
    </template>
    <template v-else-if="name === 'doc'">
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h4M9 12h6M9 16h6" />
    </template>
    <template v-else-if="name === 'thumb-up'">
      <path d="M8 10.5 12 3c2 0 2.7 1.4 2.3 3l-.8 3H19a2 2 0 0 1 2 2.4l-1.2 6A2 2 0 0 1 17.8 19H8z" />
      <path d="M3 10h5v9H3z" />
    </template>
    <template v-else-if="name === 'thumb-down'">
      <path d="M8 13.5 12 21c2 0 2.7-1.4 2.3-3l-.8-3H19a2 2 0 0 0 2-2.4l-1.2-6A2 2 0 0 0 17.8 5H8z" />
      <path d="M3 5h5v9H3z" />
    </template>
    <template v-else>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4M12 16v.2" />
    </template>
  </svg>
</template>
