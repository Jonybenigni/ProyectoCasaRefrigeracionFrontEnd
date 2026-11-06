<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar producto' : 'Nuevo producto' }}</div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
        <q-input
          v-model="form.name"
          label="Nombre"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingresá el nombre']"
        />
        <!-- La descripcion es opcional: no lleva reglas -->
        <q-input
          v-model="form.description"
          label="Descripción"
          type="textarea"
          autogrow
          outlined
          class="q-mb-md"
        />

        <!-- v-model.number convierte lo que se escribe a numero (sin .number llegaria como texto) -->
        <div class="row q-col-gutter-sm">
          <q-input
            v-model.number="form.currentStock"
            label="Stock actual"
            type="number"
            min="0"
            outlined
            class="col-6"
            lazy-rules
            :rules="[(v: number) => esEnteroPositivo(v) || 'Ingresá un número entero, 0 o más']"
          />
          <q-input
            v-model.number="form.minimumStock"
            label="Stock mínimo"
            type="number"
            min="0"
            outlined
            class="col-6"
            lazy-rules
            :rules="[(v: number) => esEnteroPositivo(v) || 'Ingresá un número entero, 0 o más']"
          />
        </div>
        <q-input
          v-model.number="form.price"
          label="Precio"
          type="number"
          min="0"
          step="0.01"
          prefix="$"
          outlined
          class="q-mt-sm"
          lazy-rules
          :rules="[(v: number) => (typeof v === 'number' && v > 0) || 'Ingresá un precio mayor a 0']"
        />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="productStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useProductStore } from '@/stores/product';
import type { ProductRequestDto } from '@/models/Product/ProductRequestDto';
import { notificarError } from '@/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const productStore = useProductStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<ProductRequestDto>({
  name: '',
  description: '',
  currentStock: 0,
  minimumStock: 0,
  price: 0,
});

// El stock es int en la API: sin decimales y sin negativos
function esEnteroPositivo(v: number) {
  return Number.isInteger(v) && v >= 0;
}

// Si es modificacion, se traen los datos actuales del producto
onMounted(async () => {
  if (props.editId) {
    const product = await productStore.fetchById(props.editId);
    if (product) {
      form.value = {
        name: product.name,
        description: product.description,
        currentStock: product.currentStock,
        minimumStock: product.minimumStock,
        price: product.price,
      };
    }
  }
});

async function onSubmit() {
  const valido = await formRef.value?.validate();
  if (!valido) {
    return;
  }
  try {
    if (props.editId) {
      await productStore.update(props.editId, form.value);
    } else {
      await productStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar el producto');
  }
}
</script>
