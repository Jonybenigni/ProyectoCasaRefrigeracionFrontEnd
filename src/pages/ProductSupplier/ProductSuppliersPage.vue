<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Productos por proveedor</div>
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
        <q-btn round unelevated color="primary" icon="add" @click="mostrarFormulario = true">
          <q-tooltip>Nueva relacion</q-tooltip>
        </q-btn>
        <q-btn flat round icon="refresh" :loading="productSupplierStore.loading" @click="recargar">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <q-card-section>
        <q-table
          :rows="productSupplierStore.productSuppliers"
          :columns="columns"
          row-key="id"
          :filter="filtro"
          :loading="productSupplierStore.loading"
          :rows-per-page-options="[10, 20, 50, 0]"
          no-data-label="No hay relaciones para mostrar"
          loading-label="Cargando relaciones..."
        >
          <!-- Sin boton de editar: la API solo permite crear y borrar relaciones -->
          <template #body-cell-acciones="props">
            <q-td class="text-right">
              <q-btn dense flat color="negative" icon="delete" @click="confirmarBaja(props.row.id)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-banner v-if="productSupplierStore.error" class="bg-negative text-white" rounded>
        {{ productSupplierStore.error }}
      </q-banner>
    </q-card>

    <q-dialog v-model="mostrarFormulario">
      <ProductSupplierCreate @close="cerrarFormulario" />
    </q-dialog>

    <!-- La baja siempre se confirma antes de ejecutarse -->
    <q-dialog v-model="confirmandoBaja">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
          <span class="text-h6">Confirmar</span>
        </q-card-section>
        <q-card-section
          >Se va a eliminar la relacion. Esta accion no se puede deshacer.</q-card-section
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
import { useProductSupplierStore } from '@/stores/productSupplier';
import type { ProductSupplierResponseDto } from '@/models/ProductSupplier/ProductSupplierResponseDto';
import ProductSupplierCreate from '@/components/ProductSupplier/ProductSupplierCreate.vue';
import { notificarError } from '@/utils/notificar';

const productSupplierStore = useProductSupplierStore();

const filtro = ref('');
const mostrarFormulario = ref(false);
const confirmandoBaja = ref(false);
const idABorrar = ref<number | null>(null);

const columns: QTableColumn<ProductSupplierResponseDto>[] = [
  { name: 'id', label: 'Id', field: 'id', align: 'left', sortable: true },
  { name: 'productName', label: 'Producto', field: 'productName', align: 'left', sortable: true },
  { name: 'supplierName', label: 'Proveedor', field: 'supplierName', align: 'left', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'right', sortable: false },
];

function recargar() {
  void productSupplierStore.fetchAll();
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
      await productSupplierStore.borrar(idABorrar.value);
    }
  } catch {
    notificarError('No se pudo eliminar la relacion');
  } finally {
    confirmandoBaja.value = false;
    recargar();
  }
}

onMounted(() => {
  recargar();
});
</script>
