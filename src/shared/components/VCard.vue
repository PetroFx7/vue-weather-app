<script setup lang="ts">
const props = defineProps<{
    title: string;
    description: string;

}>();
</script>

<template>
    <div class="card">
        <h2>{{ title }}</h2>
        <slot></slot>
    </div>
</template>
<style scoped>
.card {
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 10px;
    margin: 10px;
    width: 300px;
    height: 500px;
    background: #ffffff;

}
</style>