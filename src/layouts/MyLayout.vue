<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="mdi-menu"
          aria-label="Menu"
        />
        <q-toolbar-title>
          Sistema de control de membresias
        </q-toolbar-title>
        <q-btn
          flat
          dense
          round
          icon="mdi-home"
          @click="$router.push('/')"
        ></q-btn>
        <template v-if="isAuthenticated">
          <q-btn-dropdown
            v-model="showUserSessionDropdown"
            flat stretch
            auto-close
            label="Session Iniciada"
          >
            <q-list>
              <q-item>
                <q-item-section side>
                  <q-icon name="mdi-account-box-outline"></q-icon>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{username}}</q-item-label>
                  <q-item-label caption>{{name}}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click="showUserPasswordDialog = true">
                <q-item-section side>
                  <q-icon name="mdi-lock-reset"></q-icon>
                </q-item-section>
                <q-item-section>
                  Cambiar Contraseña
                </q-item-section>
              </q-item>
              <q-separator></q-separator>
              <q-item clickable @click="logout">
                <q-item-section side>
                  <q-icon name="mdi-logout"></q-icon>
                </q-item-section>
                <q-item-section>
                  Cerrar Session
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </template>
        <template v-else>
          <q-btn-dropdown flat stretch label="Iniciar Session" v-model="showLoginDropdown">
            <user-authentication></user-authentication>
          </q-btn-dropdown>
        </template>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-2"
    >
      <q-list>
        <q-item-label header>Modulos</q-item-label>
        <q-item clickable to="/membership" v-if="isAuthorized(['membership_view', 'membership_print', 'membership_use'])">
          <q-item-section avatar>
            <q-avatar icon="mdi-account-card-details-outline"></q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>Membresias</q-item-label>
            <q-item-label caption>Administrar membresias</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable to="/users" v-if="isAuthorized(['administrator'])">
          <q-item-section avatar>
            <q-avatar icon="mdi-account-supervisor"></q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>Usuarios</q-item-label>
            <q-item-label caption>Administrar usuarios</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable to="/bracelets" v-if="isAuthorized(['administrator'])">
          <q-item-section avatar>
            <q-avatar icon="mdi-account-supervisor-box-outline"></q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>Usuarios</q-item-label>
            <q-item-label caption>Administrar usuarios</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog v-model="showLoginDialog">
      <user-authentication></user-authentication>
    </q-dialog>

    <q-dialog v-model="showUserPasswordDialog">
      <user-password @done="showUserPasswordDialog = false"></user-password>
    </q-dialog>
  </q-layout>
</template>

<script>
import UserAuthentication from 'components/UserAuthentication'
import UserPassword from 'components/UserPassword'

import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'MyLayout',
  components: { UserAuthentication, UserPassword },
  data () {
    return {
      leftDrawerOpen: true,
      showLoginDropdown: false,
      showUserSessionDropdown: false,
      showLoginDialog: false,
      showUserPasswordDialog: false
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'isAuthorized', 'name', 'username'])
  },
  methods: {
    ...mapActions('auth', ['LOGOUT']),
    async logout () {
      try {
        await this.LOGOUT()
        this.$q.notify({ icon: 'mdi-check', color: 'positive', message: 'Session cerrada' })
      } catch (error) {
        this.$gql.handleError(error)
      } finally {
        this.$router.push('/')
      }
    }
  }
}
</script>
