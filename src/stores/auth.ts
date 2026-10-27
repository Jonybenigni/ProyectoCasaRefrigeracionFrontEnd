import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from '../boot/axios';
import type { LoginUserRequestDto } from '../models/Auth/LoginUserRequestDto';
import type { LoginUserResponseDto } from '../models/Auth/LoginUserResponseDto';

// Claves con las que se guarda la sesion en localStorage
const TOKEN_KEY = 'token';
const USER_KEY = 'userName';

export const useAuthStore = defineStore('auth', () => {
  // Al crear el store se lee lo guardado: asi la sesion sobrevive a un F5
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const userName = ref<string | null>(localStorage.getItem(USER_KEY));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => token.value !== null);

  /** POST api/Auth/login. Devuelve true si el login fue exitoso. */
  async function login(credenciales: LoginUserRequestDto): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.post<LoginUserResponseDto>('/Auth/login', credenciales);
      token.value = data.token;
      userName.value = data.userName;
      localStorage.setItem(TOKEN_KEY, data.token ?? '');
      localStorage.setItem(USER_KEY, data.userName ?? '');
      return true;
    } catch (e) {
      // La API responde 400 con { login: false, errors: [...] } si las credenciales son incorrectas
      if (isAxiosError<LoginUserResponseDto>(e) && e.response?.data?.errors?.length) {
        error.value = e.response.data.errors.join(' ');
      } else {
        error.value = 'No se pudo iniciar sesion';
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  /** Borra la sesion en memoria y en localStorage. */
  function logout() {
    token.value = null;
    userName.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  return { token, userName, loading, error, isAuthenticated, login, logout };
});