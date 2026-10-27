<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar proveedor' : 'Nuevo proveedor' }}</div>
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
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingresa el nombre']"
        />
        <q-input
          v-model="form.category"
          label="Rubro"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingresa el rubro']"
        />
        <q-input
          v-model="form.phoneNumber"
          label="Telefono"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingresa el numero de telefono']"
        />

        <q-input
          v-model="form.mail"
          label="Email"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingresa el Email']"
        />

        <q-input
          v-model="form.address"
          label="Direccion"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingrese la Direccion']"
        />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="supplierStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useSupplierStore } from '@/stores/supplier';
import type { SupplierRequestDto } from '@/models/Supplier/SupplierRequestDto';
import { notificarError } from '@/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const supplierStore = useSupplierStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<SupplierRequestDto>({
  name: '',
  phoneNumber: '',
  mail: '',
  address: '',
  category: '',
});

// Si es modificacion, se traen los datos actuales del proveedor
onMounted(async () => {
  if (props.editId) {
    const supplier = await supplierStore.fetchById(props.editId);
    if (supplier) {
      form.value = {
        name: supplier.name,
        phoneNumber: supplier.phoneNumber,
        mail: supplier.mail,
        address: supplier.address,
        category: supplier.category,
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
      await supplierStore.update(props.editId, form.value);
    } else {
      await supplierStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar el proveedor');
  }
}
</script>
