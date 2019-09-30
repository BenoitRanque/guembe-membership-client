<template>
  <q-card>
    <q-bar>
      Cambiar contraseña
      <q-space />
      <q-btn flat dense icon="mdi-close" v-close-popup></q-btn>
    </q-bar>
    <q-form>
      <q-card-section>
        <!-- <div class="text-h6 text-center">
          Cambiar contraseña
        </div> -->
        <div class="text-subtitle2 text-center">
          Su contraseña debe tener un minimo de 12 carácteres
        </div>
      </q-card-section>
      <q-card-section>
        <q-input autocomplete="new-password" class="q-mb-sm" v-model="password1" dense outlined label="Contraseña Nueva" type="password"></q-input>
        <q-input autocomplete="new-password" v-model="password2" dense outlined label="Contraseña Nueva (otra vez)" type="password"></q-input>
      </q-card-section>
      <q-separator></q-separator>
      <q-card-actions align="center">
        <q-btn icon="mdi-lock-reset" flat type="submit" color="accent" :disable="!validInput" @click="updatedPasword">Cambiar Contraseña</q-btn>
      </q-card-actions>
      <q-inner-loading :showing="loading">
        <q-spinner></q-spinner>
      </q-inner-loading>
    </q-form>
  </q-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'UserPassword',
  data () {
    return {
      password1: '',
      password2: '',
      loading: false
    }
  },
  computed: {
    ...mapGetters('auth', ['userId']),
    validInput () {
      if (process.env.DEV) return true
      return this.password1.length >= 12 && this.password1 === this.password2
    }
  },
  methods: {
    async updatedPasword () {
      const query = /* GraphQL */`mutation ($password: String! $user_id: uuid!) {
        user: update_account_user (where: {
          user_id: {
            _eq: $user_id
          }
        } _set: {
          password: $password
        }) {
          updated: affected_rows
        }
      }`
      const variables = {
        password: this.password1,
        user_id: this.userId
      }
      try {
        this.loading = true
        const { user: { updated } } = await this.$gql({ query, variables, role: 'user' })
        if (updated) {
          this.$q.notify({ color: 'positive', icon: 'mdi-check', message: 'Contraseña modificada exisosamente. Podra utilizarla en su proximo inicio de session' })
          this.$emit('done')
        } else {
          this.$q.notify({ color: 'negative', icon: 'mdi-alert', message: 'Error modificando contraseña' })
        }
      } catch (error) {
        this.$gql.handleError(error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
