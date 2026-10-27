<template>
  <q-item
    clickable
    :tag="isExternal ? 'a' : undefined"
    :href="isExternal ? link : undefined"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    :to="isExternal ? undefined : link"
  >
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
}

const props = withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
});

// Links externos (http, mailto...) abren otra pestana; los internos navegan con el router
const isExternal = computed(() => /^(https?:)?\/\/|^mailto:|^tel:/.test(props.link));
</script>
