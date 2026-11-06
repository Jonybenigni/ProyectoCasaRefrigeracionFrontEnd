<template>
  <q-page padding>
    <div class="inicio">
      <h1 class="inicio__titulo">Hoy en el local</h1>
      <p class="inicio__fecha">{{ fechaDeHoy }}</p>

      <nav class="avisos" aria-label="Lo que hay que atender hoy">
        <router-link v-for="aviso in avisos" :key="aviso.link" :to="aviso.link" class="aviso">
          <span class="aviso__numero" :class="{ 'aviso__numero--cero': aviso.cantidad === 0 }">
            {{ aviso.cantidad }}
          </span>
          <span class="aviso__texto">
            <span class="aviso__titulo">{{ aviso.titulo }}</span>
            <span class="aviso__detalle">{{ aviso.detalle }}</span>
          </span>
          <q-icon name="chevron_right" size="24px" />
        </router-link>
      </nav>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useProductStore } from '@/stores/product';
import { usePendingJobStore } from '@/stores/pendingJob';
import { useSupplierPaymentStore } from '@/stores/supplierPayment';
import { useTaskItemStore } from '@/stores/taskItem';

const auth = useAuthStore();
const productStore = useProductStore();
const pendingJobStore = usePendingJobStore();
const supplierPaymentStore = useSupplierPaymentStore();
const taskItemStore = useTaskItemStore();

const hoy = new Date();
const fechaDeHoy = hoy.toLocaleDateString('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

function plata(valor: number) {
  return valor.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
}

function sumar(montos: number[]) {
  return montos.reduce((total, monto) => total + monto, 0);
}

// Cada aviso se calcula con lo que ya traen los stores
const avisos = computed(() => {
  const stockBajo = productStore.products.filter((p) => p.currentStock <= p.minimumStock);
  const trabajos = pendingJobStore.pendingJobs.filter((t) => !t.isPaid);
  const pagos = supplierPaymentStore.supplierPayments.filter((p) => !p.isPaid);
  const tareas = taskItemStore.taskItems.filter((t) => !t.isCompleted);

  // Las fechas ISO (yyyy-MM-dd) se pueden comparar como texto
  const fechaIso = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const vencidas = tareas.filter((t) => t.expirationDate.substring(0, 10) < fechaIso);

  return [
    {
      titulo: 'Productos con poco stock',
      detalle: stockBajo.length
        ? stockBajo
            .slice(0, 3)
            .map((p) => p.name)
            .join(', ')
        : 'El stock está bien',
      cantidad: stockBajo.length,
      link: '/products',
    },
    {
      titulo: 'Trabajos sin cobrar',
      detalle: trabajos.length
        ? `${plata(sumar(trabajos.map((t) => t.amount)))} por cobrar`
        : 'Todo cobrado',
      cantidad: trabajos.length,
      link: '/pending-jobs',
    },
    {
      titulo: 'Pagos a proveedores pendientes',
      detalle: pagos.length ? `${plata(sumar(pagos.map((p) => p.amount)))} por pagar` : 'Todo pagado',
      cantidad: pagos.length,
      link: '/supplier-payments',
    },
    {
      titulo: 'Tareas por hacer',
      detalle: vencidas.length ? `${vencidas.length} vencidas` : 'Ninguna vencida',
      cantidad: tareas.length,
      link: '/tasks',
    },
  ];
});

// Los datos se piden recien cuando hay sesion: antes, la API contestaria 401
watch(
  () => auth.isAuthenticated,
  (logueado) => {
    if (logueado) {
      void productStore.fetchAll();
      void pendingJobStore.fetchAll();
      void supplierPaymentStore.fetchAll();
      void taskItemStore.fetchAll();
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.inicio {
  max-width: 720px;
  margin: 24px auto 0;
}

.inicio__titulo {
  margin: 0;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0;
  color: var(--q-primary);
}

.inicio__fecha {
  margin: 4px 0 24px;
  font-size: 16px;
  color: #3f5a8a;
}

.inicio__fecha::first-letter {
  text-transform: uppercase;
}

.avisos {
  background: #fff;
  border: 1px solid #d3e2f5;
  border-radius: 8px;
  overflow: hidden;
}

.aviso {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  color: var(--q-primary);
  text-decoration: none;
}

.aviso + .aviso {
  border-top: 1px solid #e3edf9;
}

.aviso:hover {
  background: #f3f8fe;
}

.aviso:focus-visible {
  outline: 3px solid var(--q-secondary);
  outline-offset: -3px;
}

.aviso__numero {
  min-width: 56px;
  font-size: 38px;
  font-weight: 800;
  line-height: 1;
  color: var(--q-secondary);
  font-variant-numeric: tabular-nums;
}

.aviso__numero--cero {
  color: #9db2d0;
}

.aviso__texto {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.aviso__titulo {
  font-size: 17px;
  font-weight: 650;
}

.aviso__detalle {
  font-size: 14px;
  color: #3f5a8a;
}
</style>
