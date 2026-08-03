<template>
  <component
    :is="to ? 'router-link' : href ? 'a' : 'button'"
    :to="to"
    :href="href"
    :target="target"
    :type="!to && !href ? 'button' : undefined"
    :disabled="disabled"
    class="components-button"
    :class="{
      'is-primary': variant === 'primary',
      'is-secondary': variant === 'secondary',
      'is-tertiary': variant === 'tertiary',
      'is-link': variant === 'link',
      'is-destructive': variant === 'destructive',
      'is-small': size === 'small',
    }"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link' | 'destructive'
  size?: 'small' | 'default'
  disabled?: boolean
  to?: string
  href?: string
  target?: string
}>(), {
  variant: 'secondary',
})
</script>
