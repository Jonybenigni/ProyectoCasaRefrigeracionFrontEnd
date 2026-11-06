<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Pagos a proveedores</div>
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
          <q-tooltip>Nuevo pago</q-tooltip>
        </q-btn>
        <q-btn flat round icon="refresh" :loading="supplierPaymentStore.loading" @click="recargar">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <q-card-section>
        <q-table
          :rows="supplierPaymentStore.supplierPayments"
          :columns="columns"
          row-key="id"
          :filter="filtro"
          :loading="supplierPaymentStore.loading"
          :rows-per-page-options="[10, 20, 50, 0]"
          no-data-label="No hay pagos para mostrar"
          loading-label="Cargando pagos..."
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

      <q-banner v-if="supplierPaymentStore.error" class="bg-negative text-white" rounded>
        {{ supplierPaymentStore.error }}
      </q-banner>
    </q-card>

    <!-- Alta y modificacion comparten el mismo formulario -->
    <q-dialog v-model="mostrarFormulario">
      <SupplierPaymentCreate :edit-id="editId" @close="cerrarFormulario" />
    </q-dialog>

    <!-- La baja siempre se confirma antes de ejecutarse -->
    <q-dialog v-model="confirmandoBaja">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
          <span class="text-h6">Confirmar</span>
        </q-card-section>
        <q-card-section
          >Se va a eliminar el pago. Esta acción no se puede deshacer.</q-card-section
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
import { useSupplierPaymentStore } from '@/stores/supplierPayment';
import type { SupplierPaymentResponseDto } from '@/models/SupplierPayment/SupplierPaymentResponseDto';
import SupplierPaymentCreate from '@/components/SupplierPayment/SupplierPaymentCreate.vue';
import { notificarError } from '@/utils/notificar';

const supplierPaymentStore = useSupplierPaymentStore();

const filtro = ref('');
const mostrarFormulario = ref(false);
const editId = ref<number | null>(null);
const confirmandoBaja = ref(false);
const idABorrar = ref<number | null>(null);

const columns: QTableColumn<SupplierPaymentResponseDto>[] = [
  { name: 'id', label: 'Id', field: 'id', align: 'left', sortable: true },
  // supplierName lo arma la API: la tabla no necesita el store de proveedores
  { name: 'supplierName', label: 'Proveedor', field: 'supplierName', align: 'left', sortable: true },
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
    name: 'paymentDate',
    label: 'Fecha del pago',
    field: 'paymentDate',
    align: 'center',
    sortable: true,
    // La API manda 2026-11-10T00:00:00: se toma la fecha y se muestra como 10/11/2026
    format: (val: string) => val.substring(0, 10).split('-').reverse().join('/'),
  },
  {
    name: 'isPaid',
    label: 'Estado',
    field: 'isPaid',
    align: 'center',
    sortable: true,
    format: (val: boolean) => (val ? 'Pagado' : 'Pendiente'),
  },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'right', sortable: false },
];

function recargar() {
  void supplierPaymentStore.fetchAll();
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
      await supplierPaymentStore.borrar(idABorrar.value);
    }
  } catch {
    notificarError('No se pudo eliminar el pago');
  } finally {
    confirmandoBaja.value = false;
    recargar();
  }
}

onMounted(() => {
  recargar();
});
</script>
