import { Notify } from 'quasar';

export function notificarExito(mensaje: string) {
  Notify.create({ type: 'positive', message: mensaje, position: 'top', timeout: 3000 });
}

export function notificarError(mensaje: string) {
  Notify.create({ type: 'negative', message: mensaje, position: 'top', timeout: 4000 });
}
