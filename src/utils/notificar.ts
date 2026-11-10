import { Notify } from 'quasar';
import { isAxiosError } from 'axios';

export function notificarExito(mensaje: string) {
  Notify.create({ type: 'positive', message: mensaje, position: 'top', timeout: 3000 });
}

// Si la API explico el motivo (por ejemplo "tiene trabajos cargados"), se muestra ese texto
export function notificarError(mensaje: string, error?: unknown) {
  const motivo =
    isAxiosError(error) && typeof error.response?.data === 'string' ? error.response.data : '';
  Notify.create({
    type: 'negative',
    message: motivo || mensaje,
    position: 'top',
    timeout: 4000,
  });
}
