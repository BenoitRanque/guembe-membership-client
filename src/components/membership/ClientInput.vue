<template>
  <q-select v-if="select" v-bind="$attrs">
    <template #suffix>
      <q-icon name="mdi-account-plus"></q-icon>
      <q-icon name="mdi-account-search"></q-icon>
      <q-icon name="mdi-account-edit"></q-icon>
    </template>
  </q-select>
  <q-field v-else></q-field>
</template>

<script>
export default {
  name: 'ClientInput',
  data () {
    return {
      select: true
    }
  }
}
</script>
