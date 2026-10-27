<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar cliente' : 'Nuevo cliente' }}</div>
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
          v-model="form.phoneNumber"
          label="Telefono"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingresa el numero de telefono']"
        />

        <q-input
          v-model="form.address"
          label="Direccion"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingresa la direccion']"
        />

        <q-input
          v-model="form.taxId"
          label="CUIT"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[
            (v: string) => (!!v && v.trim().length > 0) || 'Ingresa el CUIT',
            (v: string) => /^\d{11}$/.test(v) || 'El CUIT tiene 11 numeros',
          ]"
        />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="customerStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useCustomerStore } from '@/stores/customer';
import type { CustomerRequestDto } from '@/models/Customer/CustomerRequestDto';
import { notificarError } from '@/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const customerStore = useCustomerStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<CustomerRequestDto>({
  name: '',
  phoneNumber: '',
  address: '',
  taxId: '',
});

// Si es modificacion, se traen los datos actuales del cliente
onMounted(async () => {
  if (props.editId) {
    const customer = await customerStore.fetchById(props.editId);
    if (customer) {
      form.value = {
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        address: customer.address,
        taxId: customer.taxId,
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
      await customerStore.update(props.editId, form.value);
    } else {
      await customerStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar el cliente');
  }
}
</script>
