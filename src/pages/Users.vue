<template>
  <q-page>
    <q-list>
      <q-item-label header>Usuarios</q-item-label>
      <user-item v-for="(user, index) in users" :key="index" :user="user.value">
        <template v-slot:editor>
          <q-card-section>
            <user-editor :value="user.value" @input="$event => updateUser(user, $event)" :role-options="roleOptions"></user-editor>
          </q-card-section>
        </template>
        <template v-slot:side>
          <q-item-section side flat v-if="user.updated">
            <q-btn @click.stop="saveChanges(user)" dense flat icon="mdi-content-save">
              <q-tooltip>Guardar Cambios</q-tooltip>
            </q-btn>
          </q-item-section>
        </template>
      </user-item>
    </q-list>
    <div class="text-center q-pa-md">
      <q-btn color="accent" @click="showUserCreateDialog = true">Crear Usuario</q-btn>
    </div>
    <q-dialog v-model="showUserCreateDialog">
      <q-card>
        <q-bar>
          Crear Usuario
          <q-space></q-space>
          <q-btn dense flat icon="mdi-close" v-close-popup></q-btn>
        </q-bar>
        <q-card-section>
          <user-editor v-model="newUser" :role-options="roleOptions"></user-editor>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-actions align="center">
          <q-btn flat color="primary" @click="createUser" v-close-popup>Crear</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-inner-loading :showing="loading">
      <q-spinner></q-spinner>
    </q-inner-loading>
  </q-page>
</template>

<script>
import UserItem from 'components/UserItem'
import UserEditor from 'components/UserEditor'

export default {
  name: 'Users',
  components: { UserEditor, UserItem },
  data () {
    return {
      loading: false,
      showUserCreateDialog: false,
      newUser: {
        username: '',
        name: '',
        user_roles: []
      },
      users: [],
      roleOptions: []
    }
  },
  methods: {
    async createUser () {
      const query = /* GraphQL */`
        mutation ($objects: [account_user_insert_input!]!) {
          insert_account_user (objects: $objects) {
            affected_rows
          }
        }
      `

      const variables = {
        objects: {
          ...this.newUser,
          user_roles: {
            data: this.newUser.user_roles.map(({ value: role_id }) => ({
              role_id
            }))
          }
        }
      }

      try {
        this.loading = true

        await this.$gql({ query, variables, role: 'administrator' })

        this.$q.notify({ color: 'positive', icon: 'mdi-check', message: `Usuario ${this.newUser.username} creado exitosamente` })

        this.newUser = {
          username: '',
          name: '',
          user_roles: []
        }

        this.$nextTick(() => {
          this.loadUsers()
        })
      } catch (error) {
        this.$gql.handleError(error)
      } finally {
        this.loading = false
      }
    },
    async saveChanges (user) {
      const query = /* GraphQL */`
        mutation updateUser ($user_id: uuid! $user: account_user_set_input! $role_ids: [String!]! $roles: [account_user_role_insert_input!]!) {
          update_account_user (where: {
            user_id: {
              _eq: $user_id
            }
          } _set: $user) {
            affected_rows
          }
          delete_account_user_role (where: {
            user_id: {
              _eq: $user_id
            }
            role_id: {
              _nin: $role_ids
            }
          }) {
            affected_rows
          }
          insert_account_user_role (objects: $roles on_conflict: {
            constraint: user_role_pkey
            update_columns: []
          }) {
            affected_rows
          }
        }
      `
      const {
        value: {
          user_id,
          username,
          name,
          user_roles
        }
      } = user
      const variables = {
        user_id,
        user: {
          name,
          username
        },
        role_ids: user_roles.map(({ value }) => value),
        roles: user_roles.map(({ value: role_id }) => ({ user_id, role_id }))
      }

      try {
        this.loading = true

        await this.$gql({ query, variables, role: 'administrator' })

        this.$q.notify({ icon: 'mdi-check', color: 'positive', message: `Usuario Actualizado` })

        this.$nextTick(() => {
          this.loadUsers()
        })
      } catch (error) {
        this.$gql.handleError(error)
      } finally {
        this.loading = false
      }
    },
    updateUser (user, update) {
      user.updated = true
      user.value = update
    },
    async loadUsers () {
      const query = /* GraphQL */`
        query {
          roleOptions: account_role {
            value: role_id
            label: name
            description
          }
          users: account_user (order_by: { username: asc }) {
            user_id
            username
            name
            user_roles {
              value: role_id
              role {
                label: name,
                description
              }
            }
          }
        }
      `

      try {
        this.loading = true

        const { users, roleOptions } = await this.$gql({ query, role: 'administrator' })

        this.users = users.map(value => ({
          updated: false,
          value: {
            ...value,
            user_roles: value.user_roles.map(({ value, role: { label, name } }) => ({ value, label, name }))
          }
        }))
        this.roleOptions = roleOptions
      } catch (error) {
        this.$gql.handleError(error)
      } finally {
        this.loading = false
      }
    }
  },
  mounted () {
    this.loadUsers()
  }
}
</script>
