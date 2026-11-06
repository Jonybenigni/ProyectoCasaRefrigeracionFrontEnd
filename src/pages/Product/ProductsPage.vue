<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Productos</div>
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
          <q-tooltip>Nuevo producto</q-tooltip>
        </q-btn>
        <q-btn flat round icon="refresh" :loading="productStore.loading" @click="recargar">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <q-card-section>
        <q-table
          :rows="productStore.products"
          :columns="columns"
          row-key="id"
          :filter="filtro"
          :loading="productStore.loading"
          :rows-per-page-options="[10, 20, 50, 0]"
          no-data-label="No hay productos para mostrar"
          loading-label="Cargando productos..."
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

      <q-banner v-if="productStore.error" class="bg-negative text-white" rounded>
        {{ productStore.error }}
      </q-banner>
    </q-card>

    <!-- Alta y modificacion comparten el mismo formulario -->
    <q-dialog v-model="mostrarFormulario">
      <ProductCreate :edit-id="editId" @close="cerrarFormulario" />
    </q-dialog>

    <!-- La baja siempre se confirma antes de ejecutarse -->
    <q-dialog v-model="confirmandoBaja">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
          <span class="text-h6">Confirmar</span>
        </q-card-section>
        <q-card-section
          >Se va a eliminar el producto. Esta acción no se puede deshacer.</q-card-section
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
import { useProductStore } from '@/stores/product';
import type { ProductResponseDto } from '@/models/Product/ProductResponseDto';
import ProductCreate from '@/components/Product/ProductCreate.vue';
import { notificarError } from '@/utils/notificar';

const productStore = useProductStore();

const filtro = ref('');
const mostrarFormulario = ref(false);
const editId = ref<number | null>(null);
const confirmandoBaja = ref(false);
const idABorrar = ref<number | null>(null);

const columns: QTableColumn<ProductResponseDto>[] = [
  { name: 'id', label: 'Id', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'description', label: 'Descripción', field: 'description', align: 'left' },
  { name: 'currentStock', label: 'Stock actual', field: 'currentStock', align: 'right', sortable: true },
  { name: 'minimumStock', label: 'Stock mínimo', field: 'minimumStock', align: 'right', sortable: true },
  {
    name: 'price',
    label: 'Precio',
    field: 'price',
    align: 'right',
    sortable: true,
    // Se muestra como plata: $ 85.000,00
    format: (val: number) => val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
  },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'right', sortable: false },
];

function recargar() {
  void productStore.fetchAll();
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
      await productStore.borrar(idABorrar.value);
    }
  } catch {
    notificarError('No se pudo eliminar el producto');
  } finally {
    confirmandoBaja.value = false;
    recargar();
  }
}

onMounted(() => {
  recargar();
});
</script>
