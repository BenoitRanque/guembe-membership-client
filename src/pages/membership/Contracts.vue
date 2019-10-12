<template>
  <q-table
      flat
      class="q-ma-sm"
      title="Contratos"
      :data="contracts"
      :columns="columns"
      row-key="contract_id"
      :pagination.sync="pagination"
      :rows-per-page-options="[4, 6, 8, 9, 12, 15, 18, 24]"
      :filter="filter"
      :loading="loading"
      @request="loadContracts"
  >
    <template v-slot:top-right>
      <create-contract color="accent" class="q-mr-sm" v-if="isAuthorized('membership_print')" label="Crear"></create-contract>
      <q-input dense outlined debounce="300" v-model="filter" placeholder="Buscar">
        <template v-slot:prepend>
          <q-icon name="mdi-magnify" />
        </template>
      </q-input>
    </template>
  </q-table>
</template>

<script>
import { mapGetters } from 'vuex'
import CreateContract from 'components/membership/CreateContract'
import { date } from 'quasar'
const { formatDate, extractDate } = date
export default {
  name: 'Contracts',
  components: { CreateContract },
  data () {
    return {
      loading: false,
      filter: '',
      pagination: {
        sortBy: null,
        descending: false,
        page: 1,
        rowsPerPage: 6,
        rowsNumber: 0
      },
      columns: [
        {
          name: 'contract_number',
          label: 'Numero',
          align: 'left',
          field: 'contract_number'
        },
        {
          name: 'client',
          label: 'Cliente',
          align: 'left',
          field: row => row.client.name
        },
        {
          name: 'tax_identification_number',
          label: 'NIT/Carnet',
          align: 'left',
          field: 'tax_identification_number'
        },
        {
          name: 'business_name',
          label: 'Razon Social',
          align: 'left',
          field: 'business_name'
        },
        {
          name: 'types',
          label: 'Membresias',
          align: 'left',
          field: row => Object.entries(row.cards.reduce((types, card) => {
            if (!types[card.type.description]) {
              types[card.type.description] = 0
            }
            types[card.type.description] += 1
            return types
          }, {})).map(([type, amount]) => `${type}: ${amount}`).join(', ')
        },
        {
          name: 'sign_date',
          label: 'Fecha Contrato',
          align: 'left',
          field: 'sign_date',
          format: value => formatDate(extractDate(value, 'YYYY-MM-DD'), 'YYYY/MM/DD')
        },
        {
          name: 'start_date',
          label: 'Vigencia',
          align: 'left',
          field: row => row,
          format: ({ start_date, end_date }) => `${formatDate(extractDate(start_date, 'YYYY-MM-DD'), 'YYYY/MM/DD')} - ${formatDate(extractDate(end_date, 'YYYY-MM-DD'), 'YYYY/MM/DD')}`
        },
        {
          name: 'create_by_user',
          label: 'Creado Por',
          align: 'left',
          field: 'created_by_user',
          format: user => `${user.name} (${user.username})`
        }
      ],
      contracts: []
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthorized'])
  },
  methods: {
    async loadContracts ({ pagination, filter }) {
      const query = /* GraphQL */`
        query ($where: membership_contract_bool_exp! $offset: Int! $limit: Int! $order_by: [membership_contract_order_by!]) {
          meta: membership_contract_aggregate (where: $where) {
            rows: aggregate {
              count
            }
          }
          data: membership_contract (where: $where offset: $offset limit: $limit order_by: $order_by) {
            contract_id
            contract_number
            tax_identification_number
            business_name
            sign_date
            start_date
            end_date
            client {
              client_id
              name
            }
            created_by_user {
              username
              name
            }
            cards {
              type_id
              type {
                description
              }
              image
              name
              document
            }
          }
        }
      `
      const variables = {
        where: filter.length ? {
          _or: [
            { contract_number: { _ilike: `%${filter}%` } },
            { tax_identification_number: { _ilike: `%${filter}%` } },
            { business_name: { _ilike: `%${filter}%` } },
            { client: { name: { _ilike: `%${filter}%` } } },
            { client: { phone: { _ilike: `%${filter}%` } } },
            { client: { email: { _ilike: `%${filter}%` } } },
            { client: { address: { _ilike: `%${filter}%` } } },
            { cards: { name: { _ilike: `%${filter}%` } } },
            { cards: { document: { _ilike: `%${filter}%` } } }
          ]
        } : {},
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

        this.contracts = data
      } catch (error) {
        this.$gql.handleError(error)
      } finally {
        this.loading = false
      }
    }
  },
  mounted () {
    this.loadContracts({ pagination: this.pagination, filter: '' })
  }
}
</script>
