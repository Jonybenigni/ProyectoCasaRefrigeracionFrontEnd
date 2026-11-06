<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar pago' : 'Nuevo pago' }}</div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
        <!-- Desplegable de proveedores: muestra el nombre pero guarda el id -->
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
          :rules="[(v: number | null) => v !== null || 'Elegí un proveedor']"
        />
        <q-input
          v-model.number="form.amount"
          label="Monto"
          type="number"
          min="0"
          step="0.01"
          prefix="$"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: number) => (typeof v === 'number' && v > 0) || 'Ingresá un monto mayor a 0']"
        />

        <!-- La fecha se guarda como texto ISO (yyyy-MM-dd), que es lo que espera la API -->
        <q-input
          v-model="form.paymentDate"
          label="Fecha del pago"
          outlined
          mask="####-##-##"
          hint="Año, mes y día"
          lazy-rules
          :rules="[(v: string) => (!!v && v.length === 10) || 'Ingresá la fecha']"
        >
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="form.paymentDate" mask="YYYY-MM-DD" minimal />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-checkbox v-model="form.isPaid" label="Pagado" class="q-mt-sm" />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="supplierPaymentStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useSupplierPaymentStore } from '@/stores/supplierPayment';
import { useSupplierStore } from '@/stores/supplier';
import type { SupplierPaymentRequestDto } from '@/models/SupplierPayment/SupplierPaymentRequestDto';
import { notificarError } from '@/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

// Este formulario usa dos stores: el de pagos para guardar y el de proveedores para el desplegable
const supplierPaymentStore = useSupplierPaymentStore();
const supplierStore = useSupplierStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<SupplierPaymentRequestDto>({
  supplierId: null,
  amount: 0,
  paymentDate: '',
  isPaid: false,
});

onMounted(async () => {
  // Las opciones del desplegable salen de la lista de proveedores de la API
  await supplierStore.fetchAll();

  // Si es modificacion, se traen los datos actuales del pago
  if (props.editId) {
    const supplierPayment = await supplierPaymentStore.fetchById(props.editId);
    if (supplierPayment) {
      form.value = {
        supplierId: supplierPayment.supplierId,
        amount: supplierPayment.amount,
        // La API manda la fecha con hora (2026-11-10T00:00:00): el formulario usa solo la fecha
        paymentDate: supplierPayment.paymentDate.substring(0, 10),
        isPaid: supplierPayment.isPaid,
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
      await supplierPaymentStore.update(props.editId, form.value);
    } else {
      await supplierPaymentStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar el pago');
  }
}
</script>
