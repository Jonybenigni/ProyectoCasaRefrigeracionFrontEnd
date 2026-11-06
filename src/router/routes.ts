import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      { path: '/login', component: () => import('@/pages/Auth/LoginPage.vue') },
      // requiresAuth: el guard del router (router/index.ts) exige sesion iniciada
      {
        path: '/suppliers',
        component: () => import('@/pages/Supplier/SuppliersPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/customers',
        component: () => import('@/pages/Customer/CustomersPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/products',
        component: () => import('@/pages/Product/ProductsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/tasks',
        component: () => import('@/pages/TaskItem/TaskItemsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/pending-jobs',
        component: () => import('@/pages/PendingJob/PendingJobsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/supplier-payments',
        component: () => import('@/pages/SupplierPayment/SupplierPaymentsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/product-suppliers',
        component: () => import('@/pages/ProductSupplier/ProductSuppliersPage.vue'),
        meta: { requiresAuth: true },
      },
      { path: 'second', component: () => import('@/pages/SecondPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
