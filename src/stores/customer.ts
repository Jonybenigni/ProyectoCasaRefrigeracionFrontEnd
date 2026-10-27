import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from '@/boot/axios';
import type { CustomerResponseDto } from '@/models/Customer/CustomerResponseDto';
import type { CustomerRequestDto } from '@/models/Customer/CustomerRequestDto';
import { notificarExito } from '@/utils/notificar';

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<CustomerResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Customers */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<CustomerResponseDto[]>('/Customers');
      customers.value = data;
    } catch (e) {
      customers.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los clientes`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los clientes';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/Customers/{id}. Devuelve el cliente o null si no existe. */
  async function fetchById(id: number): Promise<CustomerResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<CustomerResponseDto>(`/Customers/${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/Customers */
  async function create(customer: CustomerRequestDto) {
    loading.value = true;
    try {
      await api.post('/Customers', customer);
      notificarExito('Cliente creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Customers/{id} */
  async function update(id: number, customer: CustomerRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Customers/${id}`, customer);
      notificarExito('Cliente modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Customers/{id} (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Customers/${id}`);
      notificarExito('Cliente eliminado');
    } finally {
      loading.value = false;
    }
  }

  return { customers, loading, error, fetchAll, fetchById, create, update, borrar };
});
