<template>
  <q-layout view="hHh Lpr lFf">
    <q-header class="bg-white text-primary barra-marca" :class="{ 'fondo-bloqueado': !auth.isAuthenticated }">
      <q-toolbar class="barra-marca__contenido">
        <q-btn
          v-if="auth.isAuthenticated"
          flat
          dense
          round
          icon="menu"
          aria-label="Abrir o cerrar el menú"
          @click="toggleLeftDrawer"
        />

        <router-link to="/" class="q-ml-sm" aria-label="Ir al inicio">
          <img src="@/assets/logo-jb.png" alt="J.B Refrigeración" class="logo-barra" />
        </router-link>

        <q-space />

        <template v-if="auth.isAuthenticated">
          <q-icon name="person" class="q-mr-xs" />
          <span class="q-mr-md">{{ auth.userName }}</span>
          <q-btn flat dense label="Salir" icon="logout" @click="onLogout" />
        </template>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="auth.isAuthenticated"
      v-model="leftDrawerOpen"
      show-if-above
      :width="250"
      class="bg-primary text-white"
    >
      <q-list dark class="q-pt-md">
        <EssentialLink v-bind="inicio" />

        <template v-for="grupo in grupos" :key="grupo.titulo">
          <q-item-label header class="titulo-grupo">{{ grupo.titulo }}</q-item-label>
          <EssentialLink v-for="link in grupo.links" :key="link.title" v-bind="link" />
        </template>
      </q-list>
    </q-drawer>

    <q-page-container :class="{ 'fondo-bloqueado': !auth.isAuthenticated }">
      <router-view />
    </q-page-container>

    <LoginModal />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import EssentialLink, { type EssentialLinkProps } from '@/components/EssentialLink.vue';
import LoginModal from '@/components/Auth/LoginModal.vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

async function onLogout() {
  auth.logout();
  await router.push('/');
}

const inicio: EssentialLinkProps = { title: 'Inicio', icon: 'home', link: '/' };

// El menu separa lo que es atender al cliente de lo que es manejar la mercaderia
const grupos: { titulo: string; links: EssentialLinkProps[] }[] = [
  {
    titulo: 'Atención',
    links: [
      { title: 'Clientes', icon: 'people', link: '/customers' },
      { title: 'Trabajos pendientes', icon: 'build', link: '/pending-jobs' },
      { title: 'Tareas', icon: 'task_alt', link: '/tasks' },
    ],
  },
  {
    titulo: 'Mercadería',
    links: [
      { title: 'Productos', icon: 'inventory_2', link: '/products' },
      { title: 'Proveedores', icon: 'local_shipping', link: '/suppliers' },
      { title: 'Pagos a proveedores', icon: 'payments', link: '/supplier-payments' },
      { title: 'Productos por proveedor', icon: 'link', link: '/product-suppliers' },
    ],
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style scoped>
.barra-marca__contenido {
  min-height: 68px;
}

/* La misma linea del logo: azul marino que termina en azul electrico */
.barra-marca::after {
  content: '';
  display: block;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--q-primary) 0 84%,
    var(--q-secondary) 84% 100%
  );
}

.logo-barra {
  display: block;
  height: 52px;
}

.titulo-grupo {
  color: var(--q-accent);
  font-size: 13px;
  font-weight: 600;
  padding-bottom: 6px;
}
</style>
