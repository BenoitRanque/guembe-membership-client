<template>
  <div>
    <q-table
      flat
      title="Manillas"
      :row-key="table.rowKey"
      :loading="table.loading"
      :data="table.data"
      :columns="table.columns"
      :pagination.sync="table.pagination"
      @request="requestTableData"
    >
      <div class="row items-center" slot="top-left">
        <div class="q-table__title q-mr-xs">
          Manillas
        </div>
        <q-btn v-if="isAuthorized('admittance_bracelet_print')" @click="create.show = true" icon="mdi-plus" dense flat round />
      </div>

      <div class="row q-col-gutter-xs items-center" slot="top-right">
        <div class="col">
          <q-select outlined dense label="Series" :options="options.series" v-model="selection.series"></q-select>
        </div>
        <div class="col-3">
          <q-input outlined dense label="Desde" v-model="selection.serial.from"></q-input>
        </div>
        <div class="col-3">
          <q-input outlined dense label="Hasta" v-model="selection.serial.to"></q-input>
        </div>
        <div class="col-auto"  v-if="isAuthorized('admittance_bracelet_print')">
          <q-btn @click="print" icon="mdi-printer" color="blue" flat dense></q-btn>
        </div>
      </div>

    </q-table>

    <q-dialog v-model="create.show" :persistent="create.loading">
      <q-card>
        <q-bar>
          Crear Manillas

          <q-space />

          <q-btn dense flat icon="mdi-close" v-close-popup>
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section>
          <q-select dense label="Series" :options="options.series" v-model="create.series"></q-select>
          <q-input dense label="Cantidad" v-model="create.amount" :disable="create.series === null"></q-input>
        </q-card-section>

        <q-separator></q-separator>

        <q-card-actions align="center">
          <q-btn flat color="primary" @click="confirmBraceletCreation" :disable="create.series === null || create.amount < 0">
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
  name: 'Bracelet',
  components: {
  },
  data () {
    return {
      table: {
        loading: false,
        rowKey: 'bracelet_id',
        columns: [
          {
            name: 'serial',
            field: 'serial',
            sortable: true,
            label: 'Serial',
            align: 'left'
          },
          {
            name: 'series_id',
            field: 'series_id',
            label: 'Series',
            align: 'left'
          },
          {
            name: 'name',
            label: 'Descripcion',
            field: row => row.series.name,
            align: 'left'
          },
          {
            name: 'created_at',
            label: 'Creado',
            field: row => new Date(row.created_at).toLocaleDateString()
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
      options: {
        series: []
      },
      create: {
        show: false,
        loading: false,
        series: null,
        amount: 1,
        serial: {
          from: null,
          to: null
        }
      },
      selection: {
        series: null,
        serial: {
          from: null,
          to: null
        }
      }
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthorized']),
    selectionWhere () {
      const { series, serial } = this.selection
      const from = Number(serial.from)
      const to = Number(serial.to)
      if (from < 0) return null
      if (to < 0) return null
      if (to !== 0 && to < from) return null
      const where = {}
      if (from !== 0 || to !== 0) {
        where.serial = {}
        if (from !== 0) {
          where.serial._gte = from
        }
        if (to !== 0) {
          where.serial._lte = to
        }
      }
      if (series !== null) {
        where.series_id = {
          _eq: series.value
        }
      }
      return where
    }
  },
  watch: {
    selectionWhere () {
      this.requestTableData()
    }
  },
  methods: {
    async confirmBraceletCreation () {
      // validate input
      if (this.create.series === null) {
        return this.$q.notify({
          message: 'Debe seleccionar una Series',
          color: 'warning',
          icon: 'mdi-alert'
        })
      }
      if (Number(this.create.amount) < 1) {
        return this.$q.notify({
          message: 'Cantidad debe ser igual o mayor que 1',
          color: 'warning',
          icon: 'mdi-alert'
        })
      }
      const query = /* GraphQL */`query ($where: admittance_bracelet_bool_exp!) {
        bracelet: admittance_bracelet_aggregate (where: $where) {
          aggregate {
            max {
              serial
            }
          }
        }
      }`
      const variables = {
        where: {
          series_id: {
            _eq: this.create.series.value
          }
        }
      }
      try {
        this.create.loading = true
        // destructure "lastSerial" from the response
        const { bracelet: { aggregate: { max: { serial: lastSerial } } } } = await this.$gql({ query, variables, role: ['admittance_bracelet_print'].find(this.isAuthorized) })
        this.create.serial.from = lastSerial + 1
        this.create.serial.to = lastSerial + Number(this.create.amount)
        this.$q.dialog({
          title: 'Confirmar',
          message: `Confirmar la creacion de ${this.create.amount} manillas,
            series ${this.create.series.label}, manillas ${this.create.serial.from}-${this.create.serial.to}.`,
          ok: true,
          cancel: true
        }).onOk(this.createBracelet)
      } catch (error) {
        // do nothing
        error.display()
      } finally {
        this.create.loading = false
      }
    },
    async createBracelet () {
      const amount = Number(this.create.amount)
      const from = this.create.serial.from
      const to = this.create.serial.to
      const series_id = this.create.series.value
      const query = /* GraphQL */`mutation ($objects: [admittance_bracelet_insert_input!]! ) {
        bracelet: insert_admittance_bracelet (objects: $objects) {
          count: affected_rows
        }
      }`
      const variables = {
        objects: Array.from(new Array(amount), (value, index) => ({ series_id, serial: from + index }))
      }
      try {
        this.create.loading = true
        const { bracelet: { count } } = await this.$gql({ query, variables, role: 'admittance_bracelet_print' })
        this.$q.notify({
          message: `${count} Manillas Creadas`,
          color: 'positive',
          icon: 'mdi-check'
        })
        this.create.show = false
        // set visible selection to created bracelets
        this.selection.series = this.create.series
        this.selection.serial.from = from
        this.selection.serial.to = to
      } catch (error) {
        error.display()
      } finally {
        this.create.loading = false
      }
    },
    async print () {
      const query = /* GraphQL */`query ($where: admittance_bracelet_bool_exp! $order_by: [admittance_bracelet_order_by!]) {
        pages: admittance_bracelet (where: $where order_by: $order_by) {
          bracelet_id
          series: series_id
          serial
        }
      }`
      const pagination = this.table.pagination
      const variables = {
        order_by: pagination.sortBy === null
          ? null
          : [ { [pagination.sortBy]: pagination.descending ? 'desc' : 'asc' } ],
        where: this.selectionWhere
      }
      const { pages } = await this.$gql({ query, variables, role: ['admittance_bracelet_view', 'admittance_bracelet_print'].find(this.isAuthorized) })
      this.$root.$emit('PRINT', {
        template: 'bracelet',
        preview: true,
        pages,
        silent: false
      })
    },
    async requestTableData (requestParams) {
      const pagination = requestParams ? requestParams.pagination : this.table.pagination
      // request table data based on where object, and pagination
      const query = /* GraphQL */`query ($where: admittance_bracelet_bool_exp! $offset: Int $limit: Int $order_by: [admittance_bracelet_order_by!]) {
        data: admittance_bracelet (where: $where offset: $offset limit: $limit order_by: $order_by) {
          bracelet_id
          series_id
          series {
            series_id
            name
          }
          serial
          created_at
        }
        meta: admittance_bracelet_aggregate (where: $where) {
          aggregate {
            count
          }
        }
      }`
      const variables = {
        limit: pagination.rowsPerPage,
        offset: pagination.rowsPerPage * (pagination.page - 1),
        order_by: pagination.sortBy === null
          ? null
          : [ { [pagination.sortBy]: pagination.descending ? 'desc' : 'asc' } ],
        where: this.selectionWhere
      }
      try {
        this.table.loading = true
        const { data, meta } = await this.$gql({ query, variables, role: ['admittance_bracelet_view', 'admittance_bracelet_print'].find(this.isAuthorized) })
        this.table.pagination = pagination
        this.table.pagination.rowsNumber = meta.aggregate.count
        this.table.data = data
      } catch (error) {
        error.display()
      } finally {
        this.table.loading = false
      }
    },
    loadOptions () {
      this.loadSeriesOptions()
    },
    async loadSeriesOptions () {
      const query = /* GraphQL */`query {
        series: admittance_series {
          value: series_id
          label: name
        }
      }`
      try {
        const response = await this.$gql({ query, role: ['admittance_bracelet_view', 'admittance_bracelet_print'].find(this.isAuthorized) })
        this.options.series = response.series ? response.series : []
      } catch (error) {
        error.display()
      }
    }
  },
  mounted () {
    this.loadOptions()
    this.requestTableData()
  }
}
</script>
