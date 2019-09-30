<template>
  <q-btn v-bind="$attrs" @click="show = true">
    <q-tooltip>
      Crear Contrato
    </q-tooltip>
    <q-dialog v-model="show" persistent @hide="reset">
      <q-card style="width: 560px;">
        <q-toolbar class="bg-primary text-white shadow-6">
          <q-toolbar-title>Crear Contrato</q-toolbar-title>
          <q-btn icon="mdi-close" flat dense @click="hide"></q-btn>
        </q-toolbar>
        <q-form @submit="confirmCreate">
          <q-scroll-area style="height: calc(100vh - 200px);">
            <div class="row q-col-gutter-md q-pa-md">
              <q-input required class="col-6" filled v-model="contract.contract_number" label="Numero de contrato"></q-input>
              <date-input required class="col-6" filled v-model="contract.sign_date" label="Fecha de firma"></date-input>
              <date-input required class="col-6" filled v-model="contract.start_date" label="Inicio de vigencia"></date-input>
              <date-input required class="col-6" filled v-model="contract.end_date" label="Fin de vigencia"></date-input>
              <q-input required class="col-6" filled v-model="contract.tax_identification_number" label="Nit o Carnet"></q-input>
              <q-input required class="col-6" filled v-model="contract.business_name" label="Razon Social"></q-input>
              <q-select
                class="col-12"
                filled
                v-if="clientSelect"
                v-model="client_id"
                label="Cliente"
                emit-value
                map-options
                use-input
                input-debounce="0"
                :options="clients"
                @filter="loadClients"
              >
                <template #prepend>
                  <q-btn dense flat icon="mdi-account-plus" @click="clientSelect = false">
                    <q-tooltip>
                      Crear cliente nuevo
                    </q-tooltip>
                  </q-btn>
                </template>
                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Sin Resultados
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <template v-else>
                <q-input class="col-12" filled v-model="client.name" label="Nombre del cliente">
                  <template #prepend>
                    <q-btn dense flat icon="mdi-account-search" @click="clientSelect = true">
                      <q-tooltip>
                        Buscar cliente existente
                      </q-tooltip>
                    </q-btn>
                  </template>
                </q-input>
                <q-input class="col-6" filled v-model="client.phone" label="Telefono"></q-input>
                <q-input class="col-6" filled v-model="client.email" label="Correo Electronico"></q-input>
                <q-input class="col-12" filled v-model="client.address" label="Dirección"></q-input>
              </template>
            </div>
            <q-separator></q-separator>
            <div class="row q-col-gutter-md q-pa-md">
              <div
                class="col-6"
                v-for="(membership, index) in memberships"
                :key="index"
              >
                <q-card
                  style="font-size: 0; overflow: hidden;"
                >
                  <editable-membership
                    :value="membership"
                    @input="memberships.splice(index, 1, $event)"
                    @remove="memberships.splice(index, 1)"
                    :valid-to="contract.end_date"
                  >
                  </editable-membership>
                </q-card>
              </div>
              <div class="col">
                <q-btn class="fit" style="min-height: 160px" @click="addMembership">
                  <q-icon name="mdi-plus"></q-icon>
                  <br>
                  Aggregar Membresia
                </q-btn>
              </div>
            </div>
          </q-scroll-area>
          <q-separator></q-separator>
          <div class="q-pa-lg text-center">
            <q-btn type="submit" size="lg" rounded color="primary" :disable="!valid" outline label="Crear Contrato"></q-btn>
          </div>
        </q-form>
      </q-card>
    </q-dialog>
  </q-btn>
</template>

<script>
import DateInput from 'components/DateInput'
import EditableMembership from 'components/membership/EditableMembership'
import { date } from 'quasar'
import { mapGetters } from 'vuex'
const { extractDate, formatDate, addToDate, endOfDate } = date
export default {
  name: 'CreateContract',
  components: { DateInput, EditableMembership },
  data () {
    return {
      show: false,
      clientSelect: true,
      client: {
        name: '',
        phone: '',
        email: '',
        address: ''
      },
      client_id: '',
      clients: [],
      contract: {
        contract_number: '',
        sign_date: '',
        start_date: '',
        end_date: '',
        business_name: 'Sin Nombre',
        tax_identification_number: '0'
      },
      memberships: []
    }
  },
  watch: {
    'contract.sign_date' (value) {
      if (value) {
        this.contract.start_date = value
      }
    },
    'contract.start_date' (value) {
      if (value) {
        this.contract.end_date = formatDate(endOfDate(addToDate(extractDate(value, 'YYYY-MM-DD'), { days: 365 }), 'month'), 'YYYY-MM-DD')
      }
    }
  },
  computed: {
    valid () {
      return true
    }
  },
  methods: {
    ...mapGetters('auth', ['isAuthorized']),
    reset () {
      this.clientSelect = true
      this.client.name = ''
      this.client.phone = ''
      this.client.email = ''
      this.client.address = ''
      this.client_id = ''
      this.clients = []
      this.contract.contract_number = ''
      this.contract.sign_date = formatDate(new Date(), 'YYYY-MM-DD')
      this.contract.business_name = 'Sin Nombre'
      this.contract.tax_identification_number = '0'
      this.memberships = []
    },
    hide () {
      this.$q.dialog({
        title: 'Cerrar formulario?',
        message: 'Se perderan todos los datos no guardados',
        cancel: true,
        ok: {
          color: 'negative'
        }
      }).onOk(() => {
        this.show = false
      })
    },
    addMembership () {
      this.memberships.push({
        type_id: 'INDIVIDUAL',
        name:  this.memberships.length === 0 && !this.clientSelect ? this.client.name : '',
        document: '',
        image: null
      })
    },
    async loadClients (filter = '', done = null, cancel = null) {
      const query = /* GraphQL */`
        query ($where: sales_client_bool_exp!) {
          clients: sales_client (where: $where) {
            value: client_id
            label: name
          }
        }
      `
      const criteria = []

      if (filter) {
        criteria.push({ name: { _ilike: `%${filter}%` } })
      }

      if (this.client_id) {
        criteria.push({ client_id: { _eq: this.client_id } })
      }

      const variables = {
        where: criteria.length ? { _or: criteria } : {}
      }

      try {
        const { clients } = await this.$gql({
          query,
          variables,
          role: ['membership_print', 'membership_use', 'membership_view'].find(this.isAuthorized)
        })

        this.clients = clients

        if (done) done()
      } catch (error) {
        this.$gql.handleError(error)
        if (cancel) cancel()
      }
    },
    confirmCreate () {
      this.$q.dialog({
        title: 'Confirmar creacion de contrato',
        message: 'Esta accion es irreversible',
        cancel: true
      }).onOk(this.createContract)
    },
    async createContract () {
      const query = /* GraphQL */`
        mutation CreateContract ($objects: [membership_contract_insert_input!]!) {
          insert: insert_membership_contract (objects: $objects) {
            affected_rows
            contract: returning {
              contract_id
              contract_number
              sign_date
              start_date
              end_date
              cards {
                card_id
                name
                document
                image
              }
            }
          }
        }
      `

      const objects = {
        ...this.contract
      }

      if (this.clientSelect) {
        objects.client_id = this.client_id
      } else {
        objects.client = {
          data: this.client
        }
      }

      objects.cards = {
        data: this.memberships
      }

      const variables = { objects }

      try {
        this.loading = true

        const { insert: { contract: [ { end_date: validTo, cards } ] } } = await this.$gql({ query, variables, role: 'membership_print' })

        this.$q.notify({ icon: 'mdi-check', color: 'positive', message: 'Contrato de membresias registrado exitosamente' })

        this.$root.$emit('PRINT', { preview: true, template: 'membership', pages: cards.map(card => ({ ...card, validTo })) })

        this.show = false
      } catch (error) {
        this.$gql.handleError(error)
      }
    }
  },
  mounted () {
    this.contract.sign_date = formatDate(new Date(), 'YYYY-MM-DD')
    this.loadClients()
  }
}
</script>
