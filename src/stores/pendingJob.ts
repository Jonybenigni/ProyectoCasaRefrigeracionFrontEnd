import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from '@/boot/axios';
import type { PendingJobResponseDto } from '@/models/PendingJob/PendingJobResponseDto';
import type { PendingJobRequestDto } from '@/models/PendingJob/PendingJobRequestDto';
import { notificarExito } from '@/utils/notificar';

export const usePendingJobStore = defineStore('pendingJob', () => {
  const pendingJobs = ref<PendingJobResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/PendingJobs */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<PendingJobResponseDto[]>('/PendingJobs');
      pendingJobs.value = data;
    } catch (e) {
      pendingJobs.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los trabajos`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los trabajos';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/PendingJobs/{id}. Devuelve el trabajo o null si no existe. */
  async function fetchById(id: number): Promise<PendingJobResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<PendingJobResponseDto>(`/PendingJobs/${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/PendingJobs */
  async function create(pendingJob: PendingJobRequestDto) {
    loading.value = true;
    try {
      await api.post('/PendingJobs', pendingJob);
      notificarExito('Trabajo creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/PendingJobs/{id} */
  async function update(id: number, pendingJob: PendingJobRequestDto) {
    loading.value = true;
    try {
      await api.put(`/PendingJobs/${id}`, pendingJob);
      notificarExito('Trabajo modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/PendingJobs/{id} (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/PendingJobs/${id}`);
      notificarExito('Trabajo eliminado');
    } finally {
      loading.value = false;
    }
  }

  return { pendingJobs, loading, error, fetchAll, fetchById, create, update, borrar };
});
