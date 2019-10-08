<template>
  <div>
    <q-input dense label="Nombre de usuario" :value="value.username" @input="$event => update('username', $event)"></q-input>
    <q-input dense label="Nombre" :value="value.name" @input="$event => update('name', $event)"></q-input>
    <q-select dense toggle multiple :options="roleOptions" :value="value.user_roles" @input="$event => update('user_roles', $event)">
      <template v-slot:option="{ opt, selected, focused, toggleOption }">
        <q-item clickable :active="selected" :focused="focused" @click="toggleOption(opt)">
          <q-item-section>
            <q-item-label>{{opt.label}}</q-item-label>
            <q-item-label caption>{{opt.description}}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
export default {
  name: 'UserEditor',
  props: {
    value: {
      type: Object,
      require: true
    },
    roleOptions: {
      type: Array,
      required: true
    }
  },
  methods: {
    update (field, value) {
      this.$emit('input', {
        ...this.value,
        [field]: value
      })
    }
  }
}
</script>
