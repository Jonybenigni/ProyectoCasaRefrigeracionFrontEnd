<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Trabajos pendientes</div>
        <q-space />
        <q-input
          v-model="filtro"
          dense
          outlined
          placeholder="Buscar"
          debounce="300"
          style="width: 220px"
        >
          <template #append>
            <q-icon v-if="filtro === ''" name="search" />
            <q-icon v-else name="close" class="cursor-pointer" @click="filtro = ''" />
          </template>
        </q-input>
        <q-btn round unelevated color="primary" icon="add" @click="abrirAlta">
          <q-tooltip>Nuevo trabajo</q-tooltip>
        </q-btn>
        <q-btn flat round icon="refresh" :loading="pendingJobStore.loading" @click="recargar">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <q-card-section>
        <q-table
          :rows="pendingJobStore.pendingJobs"
          :columns="columns"
          row-key="id"
          :filter="filtro"
          :loading="pendingJobStore.loading"
          :rows-per-page-options="[10, 20, 50, 0]"
          no-data-label="No hay trabajos para mostrar"
          loading-label="Cargando trabajos..."
        >
          <!-- Columna de acciones: un boton por cada operacion del ABM -->
          <template #body-cell-acciones="props">
            <q-td class="text-right">
              <q-btn dense flat color="primary" icon="edit" @click="abrirEdicion(props.row.id)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn dense flat color="negative" icon="delete" @click="confirmarBaja(props.row.id)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-banner v-if="pendingJobStore.error" class="bg-negative text-white" rounded>
        {{ pendingJobStore.error }}
      </q-banner>
    </q-card>

    <!-- Alta y modificacion comparten el mismo formulario -->
    <q-dialog v-model="mostrarFormulario">
      <PendingJobCreate :edit-id="editId" @close="cerrarFormulario" />
    </q-dialog>

    <!-- La baja siempre se confirma antes de ejecutarse -->
    <q-dialog v-model="confirmandoBaja">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
          <span class="text-h6">Confirmar</span>
        </q-card-section>
        <q-card-section
          >Se va a eliminar el trabajo. Esta acción no se puede deshacer.</q-card-section
        >
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="eliminar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QTableColumn } from 'quasar';
import { usePendingJobStore } from '@/stores/pendingJob';
import type { PendingJobResponseDto } from '@/models/PendingJob/PendingJobResponseDto';
import PendingJobCreate from '@/components/PendingJob/PendingJobCreate.vue';
import { notificarError } from '@/utils/notificar';

const pendingJobStore = usePendingJobStore();

const filtro = ref('');
const mostrarFormulario = ref(false);
const editId = ref<number | null>(null);
const confirmandoBaja = ref(false);
const idABorrar = ref<number | null>(null);

const columns: QTableColumn<PendingJobResponseDto>[] = [
  { name: 'id', label: 'Id', field: 'id', align: 'left', sortable: true },
  // customerName lo arma la API: la tabla no necesita el store de clientes
  { name: 'customerName', label: 'Cliente', field: 'customerName', align: 'left', sortable: true },
  { name: 'description', label: 'Descripción', field: 'description', align: 'left' },
  {
    name: 'amount',
    label: 'Monto',
    field: 'amount',
    align: 'right',
    sortable: true,
    // Se muestra como plata: $ 85.000,00
    format: (val: number) => val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
  },

  {
    name: 'jobDate',
    label: 'FechaTrabajo',
    field: 'jobDate',
    align: 'center',
    sortable: false,
    format: (val: string) => val.substring(0, 10).split('-').reverse().join('/'),
  },
  {
    name: 'isPaid',
    label: 'Pagado',
    field: 'isPaid',
    align: 'right',
    sortable: false,
    format: (val: boolean) => (val ? 'Pagado' : 'Pendiente'),
  },

  { name: 'acciones', label: 'Acciones', field: 'id', align: 'right', sortable: false },
];

function recargar() {
  void pendingJobStore.fetchAll();
}

function abrirAlta() {
  editId.value = null;
  mostrarFormulario.value = true;
}

function abrirEdicion(id: number) {
  editId.value = id;
  mostrarFormulario.value = true;
}

function cerrarFormulario() {
  mostrarFormulario.value = false;
  recargar();
}

function confirmarBaja(id: number) {
  idABorrar.value = id;
  confirmandoBaja.value = true;
}

async function eliminar() {
  try {
    if (idABorrar.value !== null) {
      await pendingJobStore.borrar(idABorrar.value);
    }
  } catch (e) {
    notificarError('No se pudo eliminar el trabajo', e);
  } finally {
    confirmandoBaja.value = false;
    recargar();
  }
}

onMounted(() => {
  recargar();
});
</script>
