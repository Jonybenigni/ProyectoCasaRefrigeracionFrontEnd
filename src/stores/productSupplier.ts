import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from '@/boot/axios';
import type { ProductSupplierResponseDto } from '@/models/ProductSupplier/ProductSupplierResponseDto';
import type { ProductSupplierRequestDto } from '@/models/ProductSupplier/ProductSupplierRequestDto';
import { notificarExito } from '@/utils/notificar';

// La API no tiene PUT para esta tabla: una relacion solo se crea o se borra
export const useProductSupplierStore = defineStore('productSupplier', () => {
  const productSuppliers = ref<ProductSupplierResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/ProductSuppliers */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ProductSupplierResponseDto[]>('/ProductSuppliers');
      productSuppliers.value = data;
    } catch (e) {
      productSuppliers.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener las relaciones`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener las relaciones';
      }
    } finally {
      loading.value = false;
    }
  }

  /** POST api/ProductSuppliers */
  async function create(productSupplier: ProductSupplierRequestDto) {
    loading.value = true;
    try {
      await api.post('/ProductSuppliers', productSupplier);
      notificarExito('Relación creada');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/ProductSuppliers/{id} (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/ProductSuppliers/${id}`);
      notificarExito('Relación eliminada');
    } finally {
      loading.value = false;
    }
  }

  return { productSuppliers, loading, error, fetchAll, create, borrar };
});
