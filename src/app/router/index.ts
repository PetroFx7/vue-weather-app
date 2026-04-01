import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

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
    history: createWebHashHistory(import.meta.env.BASE_URL || "/"),
    routes,
  });

export default router;