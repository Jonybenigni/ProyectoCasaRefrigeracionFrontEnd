<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar trabajo' : 'Nuevo trabajo' }}</div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
        <!--
          Desplegable de clientes: muestra el nombre (option-label) pero guarda el id (option-value).
          emit-value hace que en form.customerId quede solo el numero, y map-options que al editar
          se vea el nombre del cliente que corresponde a ese id.
        -->
        <q-select
          v-model="form.customerId"
          :options="customerStore.customers"
          option-value="id"
          option-label="name"
          emit-value
          map-options
          label="Cliente"
          outlined
          class="q-mb-sm"
          :loading="customerStore.loading"
          lazy-rules
          :rules="[(v: number | null) => v !== null || 'Elegí un cliente']"
        />
        <q-input
          v-model="form.description"
          label="Descripción del trabajo"
          type="textarea"
          autogrow
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingresá la descripción']"
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
          v-model="form.jobDate"
          label="Fecha del trabajo"
          outlined
          mask="####-##-##"
          hint="Año, mes y día"
          lazy-rules
          :rules="[(v: string) => (!!v && v.length === 10) || 'Ingresá la fecha']"
        >
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="form.jobDate" mask="YYYY-MM-DD" minimal />
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
        :loading="pendingJobStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { usePendingJobStore } from '@/stores/pendingJob';
import { useCustomerStore } from '@/stores/customer';
import type { PendingJobRequestDto } from '@/models/PendingJob/PendingJobRequestDto';
import { notificarError } from '@/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

// Este formulario usa dos stores: el de trabajos para guardar y el de clientes para el desplegable
const pendingJobStore = usePendingJobStore();
const customerStore = useCustomerStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<PendingJobRequestDto>({
  customerId: null,
  description: '',
  amount: 0,
  jobDate: '',
  isPaid: false,
});

onMounted(async () => {
  // Las opciones del desplegable salen de la lista de clientes de la API
  await customerStore.fetchAll();

  // Si es modificacion, se traen los datos actuales del trabajo
  if (props.editId) {
    const pendingJob = await pendingJobStore.fetchById(props.editId);
    if (pendingJob) {
      form.value = {
        customerId: pendingJob.customerId,
        description: pendingJob.description,
        amount: pendingJob.amount,
        // La API manda la fecha con hora (2026-11-10T00:00:00): el formulario usa solo la fecha
        jobDate: pendingJob.jobDate.substring(0, 10),
        isPaid: pendingJob.isPaid,
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
      await pendingJobStore.update(props.editId, form.value);
    } else {
      await pendingJobStore.create(form.value);
    }
    emit('close');
  } catch (e) {
    notificarError('No se pudo guardar el trabajo', e);
  }
}
</script>
