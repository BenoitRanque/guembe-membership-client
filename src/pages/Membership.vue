<template>
  <q-page>
    <q-splitter v-model="splitter">
      <template v-slot:before>
        <q-table
          flat
          grid
          class="q-ma-sm"
          title="Membresias"
          :data="memberships"
          hide-header
          :columns="columns"
          row-key="card_id"
          selection="multiple"
          :selected.sync="selected"
          :pagination.sync="pagination"
          :rows-per-page-options="[4, 6, 8, 9, 12, 15, 18, 24]"
          :filter="filter"
          :loading="loading"
          @request="loadMemberships"
        >
          <template v-slot:top-left>
            <q-input dense outlined debounce="300" v-model="filter" placeholder="Buscar">
              <template v-slot:prepend>
                <q-icon name="mdi-magnify" />
              </template>
              <template v-slot:after>
                <q-checkbox v-model="onlyValid" dense label="Solo Vigentes"></q-checkbox>
              </template>
            </q-input>
          </template>
          <template v-slot:top-right>
            <create-contract color="accent" v-if="isAuthorized('membership_print')" label="Crear"></create-contract>
          </template>
          <template v-slot:item="props">
            <div
              class="q-pa-sm col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
              :style="props.selected ? 'transform: scale(0.95);' : ''"
            >
              <q-card
                style="font-size: 0; overflow: hidden;"
                class="borders-rounded cursor-pointer relative-position"
                :class="{ 'cursor-pointer': isValid(props.row.contract) }"
                @click="props.selected = isValid(props.row.contract) ? !props.selected : false"
              >
                <membership-card
                  :image="props.row.image"
                  :background="backgroundImage(props.row.type_id)"
                  :name="props.row.name"
                  :document="props.row.document"
                  :valid-to="props.row.contract.end_date"
                ></membership-card>
                <div v-if="!isValid(props.row.contract)" class="bg-black absolute absolute-top-left absolute-bottom-right" style="opacity: 0.3"></div>
                <div v-if="props.selected" class="bg-white absolute absolute-top-left absolute-bottom-right" style="opacity: 0.3"></div>
              </q-card>
            </div>
          </template>
        </q-table>
      </template>
      <template v-slot:after>
        <q-scroll-area style="height: calc(100vh - 50px)">
          <div class="row q-ma-sm">
            <div
              class="col-6 q-pa-sm"
              v-for="(card, index) in selected"
              :key="index"
            >
              <q-card
                style="font-size: 0; overflow: hidden;"
                class="cursor-pointer"
              >
                <membership-card
                  :image="card.image"
                  :background="backgroundImage(card.type_id)"
                  :name="card.name"
                  :document="card.document"
                  :valid-to="card.contract.end_date"
                ></membership-card>
                <q-tooltip>Click derecho para quitar</q-tooltip>
                <q-menu context-menu>
                  <q-list>
                    <q-item clickable dense v-ripple v-close-popup @click="selected.splice(index, 1)">
                      <q-item-section>Quitar</q-item-section>
                      <q-item-section side>
                        <!-- <q-avatar rounded color="negative" text-color="white" icon="mdi-delete" /> -->
                        <q-icon name="mdi-delete"></q-icon>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-card>
            </div>
          </div>
          <q-separator></q-separator>
          <div class="text-center q-pa-md" v-if="isAuthorized('membership_use')">
            <q-btn color="primary" rounded :disable="!selected.length" @click="confirmRegisterUse">Registrar uso de {{selected.length}} Membresias</q-btn>
          </div>
          <q-inner-loading :showing="loading">
            <q-spinner></q-spinner>
          </q-inner-loading>
        </q-scroll-area>
      </template>
    </q-splitter>
 </q-page>
</template>

<script>
import CreateContract from 'components/membership/CreateContract'
import MembershipCard from 'components/membership/MembershipCard'
import { mapGetters } from 'vuex'
import { date } from 'quasar'
const { extractDate, isBetweenDates, formatDate } = date

const UUID_V4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

const membershipTypes = [
  {
    label: 'Membresia Individual',
    background: 'membership_individual.png',
    value: 'INDIVIDUAL',
    type_id: 'INDIVIDUAL'
  },
  {
    label: 'Membresia Duo',
    background: 'membership_duo.png',
    value: 'DUO',
    type_id: 'DUO'
  },
  {
    label: 'Membresia Familiar',
    background: 'membership_family.png',
    value: 'FAMILY',
    type_id: 'FAMILY'
  }
]

export default {
  name: 'Membership',
  components: { CreateContract, MembershipCard },
  data () {
    return {
      splitter: 70,
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 6,
        rowsNumber: 0
      },
      columns: [
        {
          name: 'name',
          label: 'Nombre',
          align: 'left',
          field: 'name'
        }
      ],
      onlyValid: true,
      selected: [],
      memberships: []
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthorized'])
  },
  methods: {
    isValid ({ start_date, end_date }) {
      return isBetweenDates(new Date(), extractDate(start_date, 'YYYY-MM-DD'), extractDate(end_date, 'YYYY-MM-DD'))
    },
    backgroundImage (typeId) {
      return `statics/membership/${membershipTypes.find(type => type.type_id === typeId).background}`
    },
    confirmRegisterUse () {
      this.$q.dialog({
        title: `Registrar uso de ${this.selected.length} Membresias`,
        message: 'Esta accion es irreversible',
        cancel: true,
        ok: {
          color: 'primary'
        }
      }).onOk(this.registerUse)
    },
    async registerUse () {
      const query = /* GraphQL */`
        mutation ($objects: [membership_use_insert_input!]!) {
          insert_membership_use (objects: $objects) {
            affected_rows
          }
        }
      `

      const variables = {
        objects: this.selected.map(({ card_id }) => ({ card_id }))
      }

      try {
        this.loading = true

        await this.$gql({ query, variables, role: 'membership_use' })

        this.selected = []
        this.filter = ''

        this.$q.notify({ color: 'positive', icon: 'mdi-check', message: 'Uso registrado' })
      } catch (error) {
        this.$gql.handleError(error)
      } finally {
        this.loading = false
      }
    },
    async loadMemberships ({ pagination, filter }) {
      const query = /* GraphQL */`
        query ($where: membership_card_bool_exp! $offset: Int! $limit: Int! $order_by: [membership_card_order_by!]) {
          meta: membership_card_aggregate (where: $where) {
            rows: aggregate {
              count
            }
          }
          data: membership_card (where: $where offset: $offset limit: $limit order_by: $order_by) {
            card_id
            type_id
            image
            name
            document
            contract {
              start_date
              end_date
            }
          }
        }
      `
      const filterById = UUID_V4_REGEX.test(filter)
      const where = { contract: {} }

      if (this.onlyValid) {
        where.contract.start_date = { _lte: formatDate(new Date(), 'YYYY-MM-DD') }
        where.contract.end_date = { _gte: formatDate(new Date(), 'YYYY-MM-DD') }
      }

      if (filterById) {
        where.contract.client = { contracts: { cards: { card_id: { _eq: filter.toLowerCase() } } } }
      } else if (filter.length) {
        where._or = [
          { name: { _ilike: `%${filter}%` } },
          { document: { _ilike: `%${filter}%` } },
          { contract: { business_name: { _ilike: `%${filter}%` } } },
          { contract: { tax_identification_number: { _ilike: `%${filter}%` } } },
          { contract: { client: { name: { _ilike: `%${filter}%` } } } },
          { contract: { client: { phone: { _ilike: `%${filter}%` } } } },
          { contract: { client: { email: { _ilike: `%${filter}%` } } } },
          { contract: { client: { address: { _ilike: `%${filter}%` } } } }
        ]
      }

      const variables = {
        where,
        limit: pagination.rowsPerPage,
        offset: pagination.rowsPerPage * (pagination.page - 1),
        order_by: [
          { created_at: 'desc' }
        ]
      }

      try {
        this.loading = true

        const { meta: { rows: { count } }, data } = await this.$gql({ query, variables, role: ['membership_view', 'membership_use', 'membership_print'].find(this.isAuthorized) })

        this.pagination = {
          ...pagination,
          rowsNumber: count
        }

        this.memberships = data

        if (filterById) {
          const card = data.find(card => {
            return card.card_id === filter && this.isValid(card.contract)
          })

          if (card && !this.selected.some(({ card_id }) => card.card_id === card_id)) {
            this.selected.push(card)
          }
        }
      } catch (error) {
        this.$gql.handleError(error)
      } finally {
        this.loading = false
      }
    }
  },
  mounted () {
    this.loadMemberships({ pagination: this.pagination, filter: '' })
  }
}
</script>
