import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('@/pages/Home.vue'),
        name: 'home',
    },
    {
        path: '/favorites',
        component: () => import('@/pages/Favorite.vue'),
        name: 'favorite',
    },
];

const router = createRouter({
    history: createWebHistory( import.meta.env.BASE_URL ),
    routes,});

export default router;