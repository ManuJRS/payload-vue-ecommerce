<script setup lang="ts">
import type { VariantTypeGroup } from '@/types/variants'
import { getOptionSwatchColor, isColorVariantType } from '@/utils/variants'

const props = defineProps<{
  groups: VariantTypeGroup[]
  isOptionSelected: (typeId: number | string, optionId: number | string) => boolean
}>()

const emit = defineEmits<{
  select: [typeId: number | string, optionId: number | string]
}>()

const selectedLabelForGroup = (group: VariantTypeGroup) => {
  const selected = group.options.find((option) => props.isOptionSelected(group.id, option.id))
  return selected?.label ?? null
}
</script>

<template>
  <div
    v-if="groups.length > 0"
    class="mb-8 space-y-6"
  >
    <div
      v-for="group in groups"
      :key="group.id"
    >
      <div class="mb-3 flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {{ group.label }}
        </span>
        <span
          v-if="selectedLabelForGroup(group)"
          class="text-xs font-medium text-slate-900"
        >
          {{ selectedLabelForGroup(group) }}
        </span>
      </div>

      <div
        v-if="isColorVariantType(group)"
        class="flex flex-wrap gap-3"
      >
        <button
          v-for="option in group.options"
          :key="option.id"
          type="button"
          :aria-label="option.label"
          class="h-10 w-10 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          :class="
            isOptionSelected(group.id, option.id)
              ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-2'
              : 'border-slate-300 hover:border-slate-500'
          "
          :style="{ backgroundColor: getOptionSwatchColor(option) }"
          @click="emit('select', group.id, option.id)"
        />
      </div>

      <div
        v-else
        class="grid grid-cols-4 gap-3"
      >
        <button
          v-for="option in group.options"
          :key="option.id"
          type="button"
          class="rounded border px-3 py-3 text-sm font-medium transition focus:outline-none"
          :class="
            isOptionSelected(group.id, option.id)
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-300 text-slate-700 hover:border-slate-900'
          "
          @click="emit('select', group.id, option.id)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>
