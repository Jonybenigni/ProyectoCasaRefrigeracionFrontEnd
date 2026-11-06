import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from '@/boot/axios';
import type { SupplierPaymentResponseDto } from '@/models/SupplierPayment/SupplierPaymentResponseDto';
import type { SupplierPaymentRequestDto } from '@/models/SupplierPayment/SupplierPaymentRequestDto';
import { notificarExito } from '@/utils/notificar';

export const useSupplierPaymentStore = defineStore('supplierPayment', () => {
  const supplierPayments = ref<SupplierPaymentResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/SupplierPayments */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<SupplierPaymentResponseDto[]>('/SupplierPayments');
      supplierPayments.value = data;
    } catch (e) {
      supplierPayments.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los pagos`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los pagos';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/SupplierPayments/{id}. Devuelve el pago o null si no existe. */
  async function fetchById(id: number): Promise<SupplierPaymentResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<SupplierPaymentResponseDto>(`/SupplierPayments/${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/SupplierPayments */
  async function create(supplierPayment: SupplierPaymentRequestDto) {
    loading.value = true;
    try {
      await api.post('/SupplierPayments', supplierPayment);
      notificarExito('Pago creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/SupplierPayments/{id} */
  async function update(id: number, supplierPayment: SupplierPaymentRequestDto) {
    loading.value = true;
    try {
      await api.put(`/SupplierPayments/${id}`, supplierPayment);
      notificarExito('Pago modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/SupplierPayments/{id} (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/SupplierPayments/${id}`);
      notificarExito('Pago eliminado');
    } finally {
      loading.value = false;
    }
  }

  return { supplierPayments, loading, error, fetchAll, fetchById, create, update, borrar };
});
