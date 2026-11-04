import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from '@/boot/axios';
import type { TaskItemResponseDto } from '@/models/TaskItem/TaskItemResponseDto';
import type { TaskItemRequestDto } from '@/models/TaskItem/TaskItemRequestDto';
import { notificarExito } from '@/utils/notificar';

export const useTaskItemStore = defineStore('taskItem', () => {
  const taskItems = ref<TaskItemResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/TaskItems */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<TaskItemResponseDto[]>('/TaskItems');
      taskItems.value = data;
    } catch (e) {
      taskItems.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener las tareas`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener las tareas';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/TaskItems/{id}. Devuelve la tarea o null si no existe. */
  async function fetchById(id: number): Promise<TaskItemResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<TaskItemResponseDto>(`/TaskItems/${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/TaskItems */
  async function create(taskItem: TaskItemRequestDto) {
    loading.value = true;
    try {
      await api.post('/TaskItems', taskItem);
      notificarExito('Tarea creada');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/TaskItems/{id} */
  async function update(id: number, taskItem: TaskItemRequestDto) {
    loading.value = true;
    try {
      await api.put(`/TaskItems/${id}`, taskItem);
      notificarExito('Tarea modificada');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/TaskItems/{id} (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/TaskItems/${id}`);
      notificarExito('Tarea eliminada');
    } finally {
      loading.value = false;
    }
  }

  return { taskItems, loading, error, fetchAll, fetchById, create, update, borrar };
});
