<script setup lang="ts">
import VButton from "@/shared/components/VButton.vue";
import { useI18n } from '@/shared/composables/useI18n';

const { t } = useI18n();
</script>
<template>
<VButton>{{ t('buttons.addBlock') }}</VButton></template>
<style scoped>
</style>