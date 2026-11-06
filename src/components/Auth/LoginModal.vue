<template>
  <!-- Sin sesion no se puede cerrar: la unica salida es entrar -->
  <q-dialog
    v-model="mostrar"
    persistent
    no-esc-dismiss
    no-backdrop-dismiss
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="q-pa-md" style="width: 380px; max-width: 90vw">
      <q-card-section class="text-center q-pb-sm">
        <img src="@/assets/logo-jb.png" alt="J.B Refrigeración" class="logo-login" />
      </q-card-section>

      <q-card-section class="q-pt-sm">
        <q-form ref="formRef" greedy @submit.prevent="onSubmit">
          <q-input
            v-model="credenciales.email"
            label="Email"
            type="email"
            outlined
            autofocus
            :rules="[(v: string) => !!v || 'Ingresá el email']"
          />
          <q-input
            v-model="credenciales.password"
            label="Contraseña"
            :type="verPassword ? 'text' : 'password'"
            outlined
            class="q-mt-sm"
            :rules="[(v: string) => !!v || 'Ingresá la contraseña']"
          >
            <template #append>
              <q-icon
                :name="verPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="verPassword = !verPassword"
              />
            </template>
          </q-input>

          <q-banner v-if="auth.error" class="bg-negative text-white q-mt-sm" rounded dense>
            {{ auth.error }}
          </q-banner>

          <q-btn
            label="Ingresar"
            type="submit"
            color="primary"
            class="full-width q-mt-md"
            :loading="auth.loading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { QForm } from 'quasar';
import { useAuthStore } from '@/stores/auth';
import type { LoginUserRequestDto } from '@/models/Auth/LoginUserRequestDto';

const auth = useAuthStore();
const formRef = ref<QForm | null>(null);

// El popup se abre solo cuando no hay sesion, y se cierra solo al entrar
const mostrar = ref(!auth.isAuthenticated);
watch(
  () => auth.isAuthenticated,
  (logueado) => {
    mostrar.value = !logueado;
  },
);

// El formulario completa el mismo DTO que viaja a la API
const credenciales = ref<LoginUserRequestDto>({ email: '', password: '' });
const verPassword = ref(false);

async function onSubmit() {
  const valido = await formRef.value?.validate();
  if (!valido) {
    return;
  }
  const ok = await auth.login(credenciales.value);
  if (ok) {
    credenciales.value = { email: '', password: '' };
  }
}
</script>

<style scoped>
.logo-login {
  width: 240px;
  max-width: 100%;
}
</style>
