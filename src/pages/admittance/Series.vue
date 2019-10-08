<template>
  <div>
    <q-table
      flat
      title="Series"
      :row-key="table.rowKey"
      :loading="table.loading"
      :data="table.data"
      :columns="table.columns"
      :filter="table.filter"
      :pagination.sync="table.pagination"
      @request="requestTableData"
    >
      <div class="row items-center" slot="top-left">
        <div class="q-table__title q-mr-xs">
          Series
        </div>
        <q-btn v-if="isAuthorized('admittance_bracelet_print')" @click="create.show = true" icon="mdi-plus" dense flat round />
      </div>

      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="table.filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="mdi-magnify" />
          </template>
        </q-input>
      </template>
    </q-table>

    <q-dialog v-model="create.show" :persistent="create.loading">
      <q-card>
        <q-bar>
          Crear Series

          <q-space />

          <q-btn dense flat icon="mdi-close" v-close-popup>
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section>
          <q-input dense label="ID/Numero de series" v-model="create.series_id"></q-input>
          <q-input dense label="Nombre" v-model="create.name"></q-input>
          <q-input dense label="Color" v-model="create.color"></q-input>
        </q-card-section>

        <q-separator></q-separator>

        <q-card-actions align="center">
          <q-btn flat color="primary" @click="confirmSeriesCreation" :disable="[create.series_id, create.color, create.name].includes('')">
            Crear
          </q-btn>
        </q-card-actions>

        <q-inner-loading :showing="create.loading">
          <q-spinner></q-spinner>
        </q-inner-loading>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Series',
  data () {
    return {
      table: {
        loading: false,
        filter: '',
        rowKey: 'series_id',
        columns: [
          {
            name: 'series_id',
            field: 'series_id',
            label: 'Series',
            align: 'left',
            sortable: true
          },
          {
            name: 'color',
            field: 'color',
            label: 'Color',
            align: 'left',
            sortable: true
          },
          {
            name: 'name',
            field: 'name',
            label: 'Descripcion',
            align: 'left',
            sortable: true
          },
          {
            name: 'bracelets_aggregate',
            field: row => Number(row.bracelets_aggregate.aggregate.count),
            label: 'Cantidad De Manillas',
            sortable: true
          }
        ],
        pagination: {
          rowsNumber: 0,
          rowsPerPage: 5,
          descending: false,
          sortBy: null,
          page: 1
        },
        data: []
      },
      create: {
        show: false,
        loading: false,
        series_id: '',
        color: '',
        name: ''
      }
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthorized'])
  },
  methods: {
    async confirmSeriesCreation () {
      const series_id = this.create.series_id.trim()
      const color = this.create.color.trim()
      const name = this.create.name.trim()
      // validate input
      if (series_id === '') {
        return this.$q.notify({
          message: 'Nombre De Series no puede ser nulo',
          color: 'warning',
          icon: 'mdi-alert'
        })
      }
      if (color === '') {
        return this.$q.notify({
          message: 'Color no puede ser nulo',
          color: 'warning',
          icon: 'mdi-alert'
        })
      }
      if (name === '') {
        return this.$q.notify({
          message: 'Descripcion no puede ser nulo',
          color: 'warning',
          icon: 'mdi-alert'
        })
      }
      this.$q.dialog({
        title: 'Confirmar',
        message: `Confirmar la creacion de la series ${series_id}, color ${color}, descripcion ${name}`,
        ok: true,
        cancel: true
      }).onOk(this.createSeries)
    },
    async createSeries () {
      const series_id = this.create.series_id.trim()
      const color = this.create.color.trim()
      const name = this.create.name.trim()
      const query = /* GraphQL */`mutation ($objects: [admittance_series_insert_input!]! ) {
        series: insert_admittance_series (objects: $objects) {
          count: affected_rows
        }
      }`
      const variables = {
        objects: { series_id, color, name }
      }
      try {
        this.create.loading = true
        await this.$gql({ query, variables, role: ['admittance_bracelet_print', 'admittance_bracelet_view'].find(this.isAuthorized) })
        this.$q.notify({
          message: `Series ${series_id} Creada`,
          color: 'positive',
          icon: 'mdi-check'
        })
        this.create.show = false
        this.requestTableData()
      } catch (error) {
        // do nothing
        error.display()
      } finally {
        this.create.loading = false
      }
    },
    async requestTableData (requestParams) {
      const pagination = requestParams ? requestParams.pagination : this.table.pagination
      const filter = requestParams ? requestParams.filter : this.table.filter
      // request table data based on where object, and pagination
      const query = /* GraphQL */`query ($where: admittance_series_bool_exp $offset: Int $limit: Int $order_by: [admittance_series_order_by!]) {
        data: admittance_series (where: $where offset: $offset limit: $limit order_by: $order_by) {
          series_id
          color
          name
          bracelets_aggregate {
            aggregate {
              count
            }
          }
        }
        meta: admittance_series_aggregate (where: $where) {
          aggregate {
            count
          }
        }
      }`
      const order_by = pagination.sortBy === null ? null : {}
      if (order_by) {
        order_by[pagination.sortBy] = pagination.sortBy === 'bracelets_aggregate'
          ? { count: pagination.descending ? 'desc' : 'asc' }
          : pagination.descending ? 'desc' : 'asc'
      }
      const variables = {
        limit: pagination.rowsPerPage,
        offset: pagination.rowsPerPage * (pagination.page - 1),
        order_by,
        where: filter === '' ? null : {
          _or: [
            { series_id: { _ilike: `%${filter}%` } },
            { color: { _ilike: `%${filter}%` } },
            { name: { _ilike: `%${filter}%` } }
          ]
        }
      }
      try {
        this.table.loading = true
        const { data, meta } = await this.$gql({ query, variables, role: ['admittance_bracelet_print', 'admittance_bracelet_view'].find(this.isAuthorized) })
        this.table.pagination = pagination
        this.table.pagination.rowsNumber = meta.aggregate.count
        this.table.data = data
      } catch (error) {
        error.display()
      } finally {
        this.table.loading = false
      }
    }
  },
  mounted () {
    this.requestTableData()
  }
}
</script>
