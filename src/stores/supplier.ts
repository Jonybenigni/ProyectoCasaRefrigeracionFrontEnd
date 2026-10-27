import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from '@/boot/axios';
import type { SupplierResponseDto } from '@/models/Supplier/SupplierResponseDto';
import type { SupplierRequestDto } from '@/models/Supplier/SupplierRequestDto';
import { notificarExito } from '@/utils/notificar';

export const useSupplierStore = defineStore('supplier', () => {
  const suppliers = ref<SupplierResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Suppliers */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<SupplierResponseDto[]>('/Suppliers');
      suppliers.value = data;
    } catch (e) {
      suppliers.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los proveedores`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los proveedores';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/Suppliers/{id}. Devuelve el proveedor o null si no existe. */
  async function fetchById(id: number): Promise<SupplierResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<SupplierResponseDto>(`/Suppliers/${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/Suppliers */
  async function create(supplier: SupplierRequestDto) {
    loading.value = true;
    try {
      await api.post('/Suppliers', supplier);
      notificarExito('Proveedor creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Suppliers/{id} */
  async function update(id: number, supplier: SupplierRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Suppliers/${id}`, supplier);
      notificarExito('Proveedor modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Suppliers/{id} (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Suppliers/${id}`);
      notificarExito('Proveedor eliminado');
    } finally {
      loading.value = false;
    }
  }

  return { suppliers, loading, error, fetchAll, fetchById, create, update, borrar };
});
