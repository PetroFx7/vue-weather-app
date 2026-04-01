<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

withDefaults(defineProps<Props>(), { size: 'md' })
</script>

<template>
  <div class="preloader" :class="`preloader--${size}`">
    <div class="preloader__ring">
      <div /><div /><div /><div/>
    </div>
    <span v-if="text" class="preloader__text">{{ text }}</span>
  </div>
</template>

<style scoped>
.preloader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 40px 20px;
}

.preloader--sm { padding: 20px; gap: 10px; }
.preloader--lg { padding: 60px 20px; }

.preloader__ring {
  display: inline-block;
  position: relative;
  width: 40px;
  height: 40px;
}

.preloader--sm .preloader__ring { width: 24px; height: 24px; }
.preloader--lg .preloader__ring { width: 56px; height: 56px; }

.preloader__ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: preloader-spin 1.1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.preloader__ring div:nth-child(1) { animation-delay: -0.45s; }
.preloader__ring div:nth-child(2) { animation-delay: -0.3s; }
.preloader__ring div:nth-child(3) { animation-delay: -0.15s; }

.preloader__text {
  font-size: 14px;
  color: var(--text-secondary);
}

@keyframes preloader-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
