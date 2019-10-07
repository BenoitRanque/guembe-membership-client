<template>
  <q-item clickable @click="showEditor = true">
    <q-item-section>
      <q-item-label>{{user.username}} {{user.name ? `(${user.name})` : ''}}</q-item-label>
      <q-item-label>{{user.user_roles.map(({ label }) => label).join(', ')}}</q-item-label>
    </q-item-section>
    <slot name="side"></slot>
    <q-dialog v-model="showEditor">
      <q-card>
        <q-bar>
          Editar Usuario
          <q-space></q-space>
          <q-btn flat dense icon="mdi-close" v-close-popup></q-btn>
        </q-bar>
        <slot name="editor"></slot>
      </q-card>
    </q-dialog>
  </q-item>
</template>

<script>
export default {
  name: 'UserItem',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      showEditor: false
    }
  }
}
</script>
