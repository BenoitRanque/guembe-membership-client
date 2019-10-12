<template>
  <q-table
      flat
      class="q-ma-sm"
      title="Usos"
      :data="uses"
      :columns="columns"
      row-key="use_id"
      :pagination.sync="pagination"
      :rows-per-page-options="[4, 6, 8, 9, 12, 15, 18, 24]"
      :filter="filter"
      :loading="loading"
      @request="loadUses"
  >
    <template v-slot:top-right>
      <register-use color="primary" @update="loadUses({ pagination, filter: '' })" v-if="isAuthorized('membership_use')" class="q-mr-sm" label="Registrar Uso"></register-use>
      <q-btn color="blue" icon="mdi-printer" class="q-mr-sm" label="Reporte" @click="report.showDialog = true">
        <q-dialog v-model="report.showDialog" :persistent="report.loading">
          <q-card>
            <q-bar>
              Imprimir Reporte de usos
              <q-space></q-space>
              <q-btn flat dense icon="mdi-close" v-close-popup></q-btn>
            </q-bar>
            <q-card-section>
              <date-input label="Desde Fecha" dense v-model="report.fromDate"></date-input>
              <date-input label="Hasta Fecha" dense v-model="report.toDate"></date-input>
            </q-card-section>
            <q-separator></q-separator>
            <q-card-actions align="center">
              <q-btn color="blue" unelevated @click="printReport">
                Imprimir
              </q-btn>
            </q-card-actions>
            <q-inner-loading :showing="report.loading">
              <q-spinner></q-spinner>
            </q-inner-loading>
          </q-card>
        </q-dialog>
      </q-btn>
      <q-input dense outlined debounce="300" v-model="filter" placeholder="Buscar">
        <template v-slot:prepend>
          <q-icon name="mdi-magnify" />
        </template>
      </q-input>
    </template>

    <template v-slot:body-cell-preview="props">
      <q-td :props="props">
        <div class="text-left shadow-6 cursor-pointer" style="width: 80px; font-size: 0;">
          <membership-card
            :image="props.row.card.image"
            :type-id="props.row.card.type_id"
            :name="props.row.card.name"
            :document="props.row.card.document"
            :valid-to="props.row.card.contract.end_date"
          ></membership-card>
          <q-menu content-style="width: 360px; font-size: 0;" :offset="[0, 4]">
            <membership-card
              :image="props.row.card.image"
              :type-id="props.row.card.type_id"
              :name="props.row.card.name"
              :document="props.row.card.document"
              :valid-to="props.row.card.contract.end_date"
            ></membership-card>
          </q-menu>
        </div>
      </q-td>
    </template>
  </q-table>
</template>

<script>
import { mapGetters } from 'vuex'
import DateInput from 'components/DateInput'
import RegisterUse from 'components/membership/RegisterUse'
import MembershipCard from 'components/membership/MembershipCard'
import { date } from 'quasar'
const { extractDate, formatDate } = date
export default {
  name: 'Uses',
  components: { RegisterUse, MembershipCard, DateInput },
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
          name: 'preview',
          label: 'Tarjeta',
          align: 'left'
        },
        {
          name: 'type',
          label: 'Tipo',
          field: row => row.card.type.description,
          align: 'left'
        },
        {
          name: 'name',
          label: 'Nombre',
          field: row => row.card.name,
          align: 'left'
        },
        {
          name: 'document',
          label: 'Documento',
          field: row => row.card.document,
          align: 'left'
        },
        {
          name: 'date',
          label: 'Fecha',
          field: 'date',
          align: 'left',
          format: value => formatDate(extractDate(value, 'YYYY-MM-DD'), 'YYYY/MM/DD')
        },
        {
          name: 'time',
          label: 'Hora',
          field: 'created_at',
          align: 'left',
          format: value => formatDate(value, 'HH:mm')
        },
        {
          name: 'create_by_user',
          label: 'Creado Por',
          align: 'left',
          field: 'created_by_user',
          format: user => `${user.name} (${user.username})`
        }
      ],
      uses: [],
      report: {
        showDialog: false,
        loading: false,
        fromDate: formatDate(new Date(), 'YYYY-MM-DD'),
        toDate: formatDate(new Date(), 'YYYY-MM-DD')
      }
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthorized'])
  },
  methods: {
    async loadUses ({ pagination, filter }) {
      const query = /* GraphQL */`
        query ($where: membership_use_bool_exp! $offset: Int! $limit: Int! $order_by: [membership_use_order_by!]) {
          meta: membership_use_aggregate (where: $where) {
            rows: aggregate {
              count
            }
          }
          data: membership_use (where: $where offset: $offset limit: $limit order_by: $order_by) {
            card_id
            date
            created_at
            created_by_user {
              username
              name
            }
            card {
              type_id
              type {
                description
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
        }
      `
      const variables = {
        where: filter.length ? {
          _or: [
            { card: { name: { _ilike: `%${filter}%` } } },
            { card: { document: { _ilike: `%${filter}%` } } },
            { card: { contract: { business_name: { _ilike: `%${filter}%` } } } },
            { card: { contract: { tax_identification_number: { _ilike: `%${filter}%` } } } },
            { card: { contract: { client: { name: { _ilike: `%${filter}%` } } } } },
            { card: { contract: { client: { phone: { _ilike: `%${filter}%` } } } } },
            { card: { contract: { client: { email: { _ilike: `%${filter}%` } } } } },
            { card: { contract: { client: { address: { _ilike: `%${filter}%` } } } } }
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

        this.uses = data
      } catch (error) {
        this.$gql.handleError(error)
      } finally {
        this.loading = false
      }
    },
    async printReport () {
      // const query = /* GraphQL */`
      //   query ($where: membership_use_bool_exp! $order_by: [membership_use_order_by!]) {
      //     pages: membership_use (where: $where order_by: $order_by) {
      //       card_id
      //       date
      //       created_at
      //       card {
      //         type {
      //           description
      //         }
      //         name
      //         document
      //       }
      //     }
      //   }
      // `

      // const variables = {
      //   where: {
      //     date: {
      //       _gte: this.report.fromDate,
      //       _lte: this.report.toDate
      //     }
      //   },
      //   order_by: {
      //     created_at: 'asc'
      //   }
      // }

      try {
        this.report.loading = true

        // const { pages } = await this.$gql({ query, variables, role: ['membership_use', 'membership_view'].find(this.isAuthorized) })
        const pages = [
          {
            card: {
              type: {
                description: 'Doble'
              },
              name: 'Benoit Ranque',
              document: '123456'
            },
            date: '2019-10-12',
            created_at: new Date().toISOString()
          }
        ]

        if (!pages.length) {
          this.$q.notify({ color: 'info', icon: 'mdi-information', message: 'No existen registro de usos en esas fechas' })
        } else {
          this.$root.$emit('PRINT', {
            preview: true,
            template: 'report',
            pages: {
              title: `Reporte de uso de membresias: ${this.report.fromDate} - ${this.report.toDate}`,
              columns: [
                'Tipo de membresia',
                'Nombre',
                'Documento',
                'Fecha',
                'Hora'
              ],
              rows: pages.map(({ card: { type: { description }, name, document }, date, created_at }) => [description, name, document, date, formatDate(created_at, 'HH:mm')])
            }
          })
        }

        this.report.showDialog = false
      } catch (error) {
        this.$gql.handleError(error)
      } finally {
        this.report.loading = false
      }
    }
  },
  mounted () {
    this.loadUses({ pagination: this.pagination, filter: '' })
  }
}
</script>
