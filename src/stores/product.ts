import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from '@/boot/axios';
import type { ProductResponseDto } from '@/models/Product/ProductResponseDto';
import type { ProductRequestDto } from '@/models/Product/ProductRequestDto';
import { notificarExito } from '@/utils/notificar';

export const useProductStore = defineStore('product', () => {
  const products = ref<ProductResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Products */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ProductResponseDto[]>('/Products');
      products.value = data;
    } catch (e) {
      products.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los productos`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los productos';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/Products/{id}. Devuelve el producto o null si no existe. */
  async function fetchById(id: number): Promise<ProductResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<ProductResponseDto>(`/Products/${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/Products */
  async function create(product: ProductRequestDto) {
    loading.value = true;
    try {
      await api.post('/Products', product);
      notificarExito('Producto creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Products/{id} */
  async function update(id: number, product: ProductRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Products/${id}`, product);
      notificarExito('Producto modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Products/{id} (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Products/${id}`);
      notificarExito('Producto eliminado');
    } finally {
      loading.value = false;
    }
  }

  return { products, loading, error, fetchAll, fetchById, create, update, borrar };
});
