<template>
  <q-table
    flat
    grid
    class="q-ma-sm"
    :data="memberships"
    title="Tarjetas"
    hide-header
    :columns="columns"
    row-key="card_id"
    :selected.sync="selected"
    :pagination.sync="pagination"
    :rows-per-page-options="[4, 6, 8, 9, 12, 15, 18, 24]"
    :filter="filter"
    :loading="loading"
    @request="loadMemberships"
  >
    <template v-slot:top-right>
      <q-input dense outlined debounce="300" v-model="filter" placeholder="Buscar">
        <template v-slot:prepend>
          <q-icon name="mdi-magnify" />
        </template>
        <template v-slot:before>
          <q-checkbox v-model="onlyValid" dense left-label label="Solo Vigentes"></q-checkbox>
        </template>
      </q-input>
    </template>
    <template v-slot:item="props">
      <div
        class="q-pa-sm col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-2"
      >
        <q-card
          style="font-size: 0; overflow: hidden;"
          class="borders-rounded relative-position"
        >
          <membership-card
            :image="props.row.image"
            :type-id="props.row.type_id"
            :name="props.row.name"
            :document="props.row.document"
            :valid-to="props.row.contract.end_date"
          ></membership-card>
          <div v-if="!isValid(props.row.contract)" class="bg-black absolute absolute-top-left absolute-bottom-right" style="opacity: 0.3"></div>
          <div class="absolute absolute-top-right q-mt-sm q-mr-sm" v-if="isAuthorized('membership_print') && props.row.prints.aggregate.count === 0" >
            <q-btn color="blue" icon="mdi-printer" dense @click="print(props.row)">
              <q-tooltip>
                Impresion
              </q-tooltip>
            </q-btn>
          </div>
          <q-menu context-menu>
            <q-list dense>
              <!-- <q-item :to="`/membership/card/${props.row.card_id}`">
                <q-item-section>
                  <q-item-label>
                    Ver Detalles
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-account-card-details"></q-icon>
                </q-item-section>
              </q-item> -->
              <q-item :to="`/membership/card/${props.row.card_id}/uses`">
                <q-item-section>
                  <q-item-label>
                    Ver Usos
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-login"></q-icon>
                </q-item-section>
              </q-item>
              <q-item v-if="isAuthorized('membership_print') && props.row.prints.aggregate.count === 0" clickable @click="print(props.row)">
                <q-item-section>
                  <q-item-label>
                    Impresion
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-printer"></q-icon>
                </q-item-section>
              </q-item>
              <q-item v-else-if="isAuthorized('membership_reprint')" clickable @click="reprint(props.row)">
                <q-item-section>
                  <q-item-label>
                    Reimpresion
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-printer"></q-icon>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-card>
      </div>
    </template>
  </q-table>
</template>

<script>
import MembershipCard from 'components/membership/MembershipCard'
import { mapGetters } from 'vuex'
import { date } from 'quasar'
const { extractDate, isBetweenDates, formatDate } = date

export default {
  name: 'Membership',
  components: { MembershipCard },
  props: {
    contractId: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      splitter: 70,
      filter: '',
      loading: false,
      pagination: {
        sortBy: null,
        descending: false,
        page: 1,
        rowsPerPage: 6,
        rowsNumber: 0
      },
      columns: [],
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
    print (card) {
      this.$q.dialog({
        title: 'Impresion',
        message: 'Impresion inicial. Esta accion sera registrada',
        cancel: true,
        ok: {
          color: 'blue',
          unelevated: true,
          icon: 'mdi-printer',
          label: 'Imprimir'
        }
      }).onOk(() => this.registerPrint(card))
    },
    reprint (card) {
      this.$q.dialog({
        title: 'Re-Impresion',
        message: 'Para re-imprimir membresia, debera proporcionar un motivo. Esta accion sera registrada',
        cancel: true,
        ok: {
          color: 'blue',
          unelevated: true,
          icon: 'mdi-printer',
          label: 'Imprimir'
        },
        prompt: {
          type: 'text',
          model: ''
        }
      }).onOk(comment => this.registerPrint(card, true, comment))
    },
    async registerPrint (card, reprint = false, comment = null) {
      const query = /* GraphQL */`
        mutation ($objects: [membership_print_insert_input!]!) {
          insert: insert_membership_print (objects: $objects) {
            affected_rows
          }
        }
      `

      const variables = {
        objects: {
          card_id: card.card_id
        }
      }

      if (comment !== null) {
        variables.objects.comment = comment
      }

      try {
        this.loading = true

        await this.$gql({ query, variables, role: reprint ? 'membership_reprint' : 'membership_print' })

        this.$root.$emit('PRINT', { preview: true, template: 'membership', pages: { ...card, validTo: card.contract.end_date } })

        this.$nextTick(() => {
          this.loadMemberships({ pagination: this.pagination, filter: this.filter })
        })
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
            type {
              description
            }
            prints: prints_aggregate {
              aggregate {
                count
              }
            }
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
      const where = { contract: {} }

      if (this.onlyValid) {
        where.contract.start_date = { _lte: formatDate(new Date(), 'YYYY-MM-DD') }
        where.contract.end_date = { _gte: formatDate(new Date(), 'YYYY-MM-DD') }
      }

      if (this.contractId) {
        where.contract.contract_id = { _eq: this.contractId }
      }

      if (filter.length) {
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
