<template>
  <q-input v-bind="$attrs" :value="value" @input="$event => $emit('input', $event)"  mask="####-##-##">
    <template v-slot:append>
      <q-icon name="mdi-calendar" class="cursor-pointer">
        <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
          <q-date :value="value" mask="YYYY-MM-DD" @input="$event => { $emit('input', $event); $refs.qDateProxy.hide() }" />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script>
export default {
  name: 'DateInput',
  props: {
    value: {
      type: String,
      required: true
    }
  }
}
</script>
