import { defineStore } from '#q-app';
import { createPinia } from 'pinia';

export default defineStore((/* { ssrContext } */) => {
  const pinia = createPinia();
  return pinia;
});