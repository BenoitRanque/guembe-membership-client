<template>
  <q-card>
    <q-form>
      <q-card-section>
        <div class="text-h6 text-center">
          Bienvenido
        </div>
        <div class="text-subtitle2 text-center">
          Por favor inicia session
        </div>
      </q-card-section>
      <q-card-section>
        <q-input class="q-mb-sm" dense v-model="username" autocomplete="username" outlined label="Nombre De Usuario"></q-input>
        <q-input dense v-model="password" autocomplete="current-password" outlined label="Contraseña" type="password"></q-input>
      </q-card-section>
      <q-separator></q-separator>
      <q-card-actions align="center">
        <q-btn flat color="accent" type="submit" icon="mdi-login" label="Iniciar Session" :disable="invalidInput" @click="login"></q-btn>
      </q-card-actions>
      <q-inner-loading :showing="loading">
        <q-spinner></q-spinner>
      </q-inner-loading>
    </q-form>
  </q-card>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'UserAuthentication',
  data () {
    return {
      loading: false,
      username: '',
      password: ''
    }
  },
  computed: {
    invalidInput () {
      return !this.username.length
    }
  },
  methods: {
    ...mapActions('auth', ['LOGIN']),
    async login () {
      try {
        this.loading = true
        await this.LOGIN({ username: this.username, password: this.password })
        this.$q.notify({ icon: 'mdi-check', color: 'positive', message: 'Session Iniciada' })
        this.$emit('done')
      } catch (error) {
        this.$gql.handleError(error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
