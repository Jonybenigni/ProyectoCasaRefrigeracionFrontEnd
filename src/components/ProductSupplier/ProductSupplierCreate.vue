<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">Nueva relacion</div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
        <!-- Dos desplegables: muestran el nombre pero guardan el id -->
        <q-select
          v-model="form.productId"
          :options="productStore.products"
          option-value="id"
          option-label="name"
          emit-value
          map-options
          label="Producto"
          outlined
          class="q-mb-sm"
          :loading="productStore.loading"
          lazy-rules
          :rules="[(v: number | null) => v !== null || 'Elegi un producto']"
        />
        <q-select
          v-model="form.supplierId"
          :options="supplierStore.suppliers"
          option-value="id"
          option-label="name"
          emit-value
          map-options
          label="Proveedor"
          outlined
          class="q-mb-sm"
          :loading="supplierStore.loading"
          lazy-rules
          :rules="[(v: number | null) => v !== null || 'Elegi un proveedor']"
        />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        label="Crear"
        color="primary"
        :loading="productSupplierStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useProductSupplierStore } from '@/stores/productSupplier';
import { useProductStore } from '@/stores/product';
import { useSupplierStore } from '@/stores/supplier';
import type { ProductSupplierRequestDto } from '@/models/ProductSupplier/ProductSupplierRequestDto';
import { notificarError } from '@/utils/notificar';

const emit = defineEmits<{ (e: 'close'): void }>();

// Tres stores: uno para guardar la relacion y uno por cada desplegable
const productSupplierStore = useProductSupplierStore();
const productStore = useProductStore();
const supplierStore = useSupplierStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<ProductSupplierRequestDto>({
  productId: null,
  supplierId: null,
});

// Las opciones de los desplegables salen de las listas de la API
onMounted(() => {
  void productStore.fetchAll();
  void supplierStore.fetchAll();
});

async function onSubmit() {
  const valido = await formRef.value?.validate();
  if (!valido) {
    return;
  }
  try {
    await productSupplierStore.create(form.value);
    emit('close');
  } catch {
    notificarError('No se pudo guardar la relacion');
  }
}
</script>
