import { defineBoot } from '#q-app';
import axios, { isAxiosError, type AxiosInstance } from 'axios';
import { useAuthStore } from '../stores/auth';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Instancia de axios apuntando a la API de Refrigeracion.
// Los stores importan `api` directamente; `$api` queda disponible en los componentes.
const api = axios.create({
  baseURL: 'https://localhost:7133/api',
  headers: { 'Content-Type': 'application/json' },
});

export default defineBoot(({ app, router }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;

  // ANTES de cada peticion: si hay sesion, se agrega el token en el header Authorization
  api.interceptors.request.use((config) => {
    const auth = useAuthStore();
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  });

  // DESPUES de cada respuesta: si la API contesta 401, el token no sirve mas (vencido o invalido)
  api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        useAuthStore().logout();
        void router.push('/login');
      }
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    },
  );
});

export { api };