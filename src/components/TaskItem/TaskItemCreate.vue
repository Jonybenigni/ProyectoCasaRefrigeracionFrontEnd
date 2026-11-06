<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar tarea' : 'Nueva tarea' }}</div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
        <q-input
          v-model="form.title"
          label="Título"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingresá el título']"
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

        <!-- La fecha se guarda como texto ISO (yyyy-MM-dd), que es lo que espera la API -->
        <q-input
          v-model="form.expirationDate"
          label="Fecha de vencimiento"
          outlined
          mask="####-##-##"
          hint="Año, mes y día"
          lazy-rules
          :rules="[(v: string) => (!!v && v.length === 10) || 'Ingresá la fecha']"
        >
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="form.expirationDate" mask="YYYY-MM-DD" minimal />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <!-- El tilde va directo al bool de la API: marcado = true, sin marcar = false -->
        <q-checkbox v-model="form.isCompleted" label="Completada" class="q-mt-sm" />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="taskItemStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useTaskItemStore } from '@/stores/taskItem';
import type { TaskItemRequestDto } from '@/models/TaskItem/TaskItemRequestDto';
import { notificarError } from '@/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const taskItemStore = useTaskItemStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<TaskItemRequestDto>({
  title: '',
  description: '',
  expirationDate: '',
  isCompleted: false,
});

// Si es modificacion, se traen los datos actuales de la tarea
onMounted(async () => {
  if (props.editId) {
    const taskItem = await taskItemStore.fetchById(props.editId);
    if (taskItem) {
      form.value = {
        title: taskItem.title,
        description: taskItem.description,
        // La API manda la fecha con hora (2026-11-10T00:00:00): el formulario usa solo la fecha
        expirationDate: taskItem.expirationDate.substring(0, 10),
        isCompleted: taskItem.isCompleted,
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
      await taskItemStore.update(props.editId, form.value);
    } else {
      await taskItemStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar la tarea');
  }
}
</script>
