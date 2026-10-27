<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md" style="width: 360px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">Iniciar sesion</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit">
          <q-input
            v-model="credenciales.email"
            label="Email"
            type="email"
            outlined
            :rules="[(v: string) => !!v || 'Ingresa el email']"
          />
          <q-input
            v-model="credenciales.password"
            label="Contrasena"
            :type="verPassword ? 'text' : 'password'"
            outlined
            class="q-mt-sm"
            :rules="[(v: string) => !!v || 'Ingresa la contrasena']"
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
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import type { LoginUserRequestDto } from '../../models/Auth/LoginUserRequestDto';

const auth = useAuthStore();
const router = useRouter();

// El formulario completa el mismo DTO que viaja a la API
const credenciales = ref<LoginUserRequestDto>({ email: '', password: '' });
const verPassword = ref(false);

async function onSubmit() {
  const ok = await auth.login(credenciales.value);
  if (ok) {
    await router.push('/'); // al home; desde ahi el usuario navega al resto
  }
}
</script>
