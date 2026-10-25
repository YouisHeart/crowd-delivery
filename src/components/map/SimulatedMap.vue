<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: { type: Object, default: null },
  city: { type: Object, default: () => ({ name: '南京', area: '鼓楼区' }) },
  stops: { type: Array, default: null },
  showLabels: { type: Boolean, default: true },
  showCurrentLocation: { type: Boolean, default: true },
})

const CITY_LABELS = {
  nanjing: {
    river: '秦淮河',
    park: '玄武湖',
    area: ['鼓楼区', '玄武区', '秦淮区', '建邺区'],
    roads: [
      { text: '中央路', x: 210, y: 44, rotate: -82 },
      { text: '中山路', x: 100, y: 290, rotate: 6 },
      { text: '北京东路', x: 260, y: 214, rotate: -4 },
    ],
  },
  hefei: {
    river: '南淝河',
    park: '天鹅湖',
    area: ['蜀山区', '包河区', '庐阳区', '政务区'],
    roads: [
      { text: '长江西路', x: 92, y: 286, rotate: -4 },
      { text: '潜山路', x: 315, y: 60, rotate: -80 },
      { text: '金寨路', x: 126, y: 70, rotate: -84 },
    ],
  },
  hangzhou: {
    river: '京杭大运河',
    park: '西湖景区',
    area: ['拱墅区', '上城区', '西湖区', '滨江区'],
    roads: [
      { text: '湖墅南路', x: 92, y: 280, rotate: -5 },
      { text: '体育场路', x: 260, y: 190, rotate: -3 },
      { text: '中山北路', x: 326, y: 72, rotate: -82 },
    ],
  },
}

const scene = computed(() => CITY_LABELS[props.city?.id] || CITY_LABELS.nanjing)

const px = ([x, y]) => ({ x: (x / 100) * 420, y: (y / 100) * 360 })

const stopPoints = computed(() => {
  if (props.stops?.length) {
    return props.stops.map((stop, index) => ({
      ...stop,
      type: stop.type || (index === 0 ? 'pickup' : 'delivery'),
      point: Array.isArray(stop.point) ? px(stop.point) : stop.point,
      index,
    }))
  }
  if (!props.order) return []
  return [
    { type: 'pickup', point: px(props.order.route.pickup), label: '取货', index: 0 },
    { type: 'delivery', point: px(props.order.route.delivery), label: '送达', index: 1 },
  ]
})

const pathPoints = computed(() => {
  if (props.stops?.length) return stopPoints.value.map((stop) => stop.point)
  if (!props.order) return []
  const via = (props.order.route.via || []).map(px)
  return [px(props.order.route.pickup), ...via, px(props.order.route.delivery)]
})

const routePath = computed(() => {
  const points = pathPoints.value
  if (points.length < 2) return ''
  return points.reduce((path, point, index, all) => {
    if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
    const prev = all[index - 1]
    const beforePrev = all[index - 2] || prev
    const next = all[index + 1] || point
    const cp1x = prev.x + (point.x - beforePrev.x) / 6
    const cp1y = prev.y + (point.y - beforePrev.y) / 6
    const cp2x = point.x - (next.x - prev.x) / 6
    const cp2y = point.y - (next.y - prev.y) / 6
    return `${path} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(
      1,
    )}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
  }, '')
})

const currentLocation = computed(() => {
  const first = pathPoints.value[0]
  if (!first) return { x: 220, y: 210 }
  return { x: first.x - 27, y: first.y + 18 }
})
</script>

<template>
  <div class="simulated-map">
    <svg viewBox="0 0 420 360" preserveAspectRatio="xMidYMid slice" role="img" :aria-label="`${city.name}配送示意地图`">
      <defs>
        <linearGradient id="map-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#F1F4EE" />
          <stop offset="1" stop-color="#E9EFE8" />
        </linearGradient>
        <linearGradient id="route-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#00C986" />
          <stop offset="1" stop-color="#00A86F" />
        </linearGradient>
        <filter id="route-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.4" flood-color="#007a51" flood-opacity=".22" />
        </filter>
      </defs>

      <rect width="420" height="360" fill="url(#map-bg)" />

      <path d="M-20 72C56 55 100 92 145 113c35 17 67 10 98-5 44-21 83-23 197-12" fill="none" stroke="#D6EFF5"
        stroke-width="44" stroke-linecap="round" />
      <path d="M-20 72C56 55 100 92 145 113c35 17 67 10 98-5 44-21 83-23 197-12" fill="none" stroke="#C3E9F1"
        stroke-width="31" stroke-linecap="round" />
      <path d="M-20 72C56 55 100 92 145 113c35 17 67 10 98-5 44-21 83-23 197-12" fill="none" stroke="#E8F8FB"
        stroke-width="1.4" stroke-linecap="round" opacity=".8" />

      <path d="M-4 284c40-27 96-27 130-6 36 23 67 19 98 3 31-17 73-18 203 14v85H-4Z" fill="#DCEFD8" />
      <path
        d="M302 -16c21 29 37 54 26 85-10 27-35 41-23 74 8 20 29 31 44 46 18 18 18 44 7 65l-36 26-35-43 18-62-30-38 11-64Z"
        fill="#DDF0D6" opacity=".78" />
      <ellipse cx="56" cy="306" rx="72" ry="43" fill="#E0F0D5" opacity=".9" />
      <ellipse cx="335" cy="121" rx="48" ry="32" fill="#DDF0D6" opacity=".85" />

      <g fill="#F8F9F5" stroke="#E3E7DE" stroke-width="1">
        <rect x="25" y="128" width="66" height="54" rx="5" />
        <rect x="30" y="194" width="58" height="45" rx="5" />
        <rect x="118" y="126" width="70" height="50" rx="5" />
        <rect x="206" y="134" width="55" height="39" rx="5" />
        <rect x="202" y="247" width="74" height="41" rx="5" />
        <rect x="292" y="206" width="59" height="58" rx="5" />
        <rect x="354" y="166" width="45" height="40" rx="5" />
        <rect x="104" y="214" width="64" height="45" rx="5" />
        <rect x="344" y="46" width="57" height="50" rx="5" />
        <rect x="17" y="29" width="56" height="34" rx="5" />
      </g>

      <g fill="none" stroke-linecap="round">
        <path d="M-10 118C88 101 160 107 232 101S343 83 430 99" stroke="#D7DDD4" stroke-width="8" />
        <path d="M-10 118C88 101 160 107 232 101S343 83 430 99" stroke="#FFFFFF" stroke-width="5.4" />
        <path d="M-10 272C94 252 171 265 257 246s115-18 174-2" stroke="#D7DDD4" stroke-width="7" />
        <path d="M-10 272C94 252 171 265 257 246s115-18 174-2" stroke="#FFFFFF" stroke-width="4.8" />
        <path d="M95 -8C90 84 93 157 85 230s-3 124 8 146" stroke="#D7DDD4" stroke-width="7" />
        <path d="M95 -8C90 84 93 157 85 230s-3 124 8 146" stroke="#FFFFFF" stroke-width="4.8" />
        <path d="M325 -8C312 86 319 160 326 226s10 107 4 150" stroke="#D7DDD4" stroke-width="7" />
        <path d="M325 -8C312 86 319 160 326 226s10 107 4 150" stroke="#FFFFFF" stroke-width="4.8" />
        <path d="M-10 197C85 181 164 188 250 177s120-24 184-8" stroke="#DDE1D9" stroke-width="5" />
        <path d="M-10 197C85 181 164 188 250 177s120-24 184-8" stroke="#FFFFFF" stroke-width="3.5" />
        <path d="M160 -8C176 88 162 180 190 250s47 94 78 118" stroke="#E0E4DC" stroke-width="4" />
        <path d="M160 -8C176 88 162 180 190 250s47 94 78 118" stroke="#FFFFFF" stroke-width="2.8" />
      </g>

      <g font-size="8" font-weight="600" fill="#8A9489" font-family="PingFang SC, Microsoft YaHei, sans-serif"
        v-if="showLabels">
        <text x="232" y="47" transform="rotate(-14 232 47)">汉中门大街</text>
        <text x="26" y="255" transform="rotate(-4 26 255)">水西门大街</text>
        <text v-for="road in scene.roads" :key="road.text" :x="road.x" :y="road.y"
          :transform="`rotate(${road.rotate} ${road.x} ${road.y})`">{{ road.text }}</text>
        <text x="150" y="67" font-size="7" fill="#9AA69B">城市主干道</text>
        <text x="18" y="150" font-size="7" fill="#9AA69B">公交枢纽</text>
        <text x="264" y="285" font-size="7" fill="#8A9489">停车场</text>
      </g>

      <g v-if="showLabels" font-family="PingFang SC, Microsoft YaHei, sans-serif">
        <text x="335" y="173" font-size="9" font-weight="700" fill="#83A17C">{{ scene.park }}</text>
        <text x="34" y="327" font-size="8" font-weight="600" fill="#7D9B77">{{ scene.area[0] }}</text>
        <text x="286" y="66" font-size="8" font-weight="600" fill="#8A9489">{{ scene.area[1] }}</text>
        <text x="139" y="300" font-size="7" fill="#94A08E">{{ scene.area[2] }}</text>
        <text x="246" y="196" font-size="9" font-weight="700" fill="#8AB7C3" transform="rotate(-12 246 196)">{{
          scene.river }}</text>
      </g>

      <path v-if="routePath" :d="routePath" fill="none" stroke="#FFFFFF" stroke-width="11" stroke-linecap="round"
        opacity=".82" />
      <path v-if="routePath" :d="routePath" fill="none" stroke="url(#route-gradient)" stroke-width="7"
        stroke-linecap="round" stroke-linejoin="round" filter="url(#route-shadow)" />
      <path v-if="routePath" :d="routePath" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"
        stroke-dasharray="4 8" opacity=".68" />

      <g v-if="showCurrentLocation" :transform="`translate(${currentLocation.x} ${currentLocation.y})`">
        <circle class="location-pulse" r="14" fill="#3478F6" opacity=".16" />
        <circle r="8.5" fill="#3478F6" stroke="#FFFFFF" stroke-width="2.2" />
        <circle r="2.4" fill="#FFFFFF" />
      </g>

      <g v-for="stop in stopPoints" :key="`${stop.type}-${stop.index}`" class="map-marker"
        :transform="`translate(${stop.point.x} ${stop.point.y})`">
        <ellipse cy="16" rx="14" ry="4" fill="#16251E" opacity=".14" />
        <path v-if="stop.type === 'pickup'" d="M0 13 11 0h-5L0 12 2 3h-7Z" fill="#FF8A00" opacity=".7" />
        <circle r="14" :fill="stop.type === 'pickup' ? '#FF7A00' : stop.type === 'delivery' ? '#00B578' : '#17191D'"
          stroke="#FFFFFF" stroke-width="2.6" />
        <text y="4" text-anchor="middle" font-size="10" font-weight="800" fill="#FFFFFF"
          font-family="PingFang SC, Microsoft YaHei, sans-serif">
          {{ stop.no || (stop.type === 'pickup' ? '取' : '送') }}
        </text>
        <g v-if="showLabels" :transform="`translate(${stop.type === 'pickup' ? 19 : 19} -34)`">
          <rect x="0" y="0" width="58" height="18" rx="6" fill="#FFFFFF" opacity=".96" />
          <text x="29" y="12" text-anchor="middle" font-size="8" font-weight="700" fill="#2C3239"
            font-family="PingFang SC, Microsoft YaHei, sans-serif">
            {{ stop.label || (stop.type === 'pickup' ? '取货点' : '送达点') }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.simulated-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #edf1e9;
}

.simulated-map svg {
  display: block;
  width: 100%;
  height: 100%;
}

.location-pulse {
  animation: map-pulse 2.4s ease-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes map-pulse {
  0% {
    transform: scale(0.75);
    opacity: 0.28;
  }

  70% {
    transform: scale(1.55);
    opacity: 0;
  }

  100% {
    transform: scale(1.55);
    opacity: 0;
  }
}
</style>
