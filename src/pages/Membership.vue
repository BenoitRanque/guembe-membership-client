<template>
  <q-page padding>
    <q-splitter v-model="splitter">
      <template v-slot:before>
        <q-table
          flat
          grid
          class="q-mr-sm"
          title="Membresias"
          :data="memberships"
          hide-header
          :columns="columns"
          row-key="card_id"
          :pagination.sync="pagination"
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
              <q-card style="font-size: 0; overflow: hidden;" class="borders-rounded cursor-pointer" @click="addToSelection(props.row)">
                <membership-card
                  :image="props.row.image"
                  :background="backgroundImage(props.row.type_id)"
                  :name="props.row.name"
                  :document="props.row.document"
                  :valid-to="props.row.contract.end_date"
                ></membership-card>
              </q-card>
            </div>
          </template>
        </q-table>
      </template>
      <template v-slot:after>

        <pre>{{selection}}</pre>
      </template>
    </q-splitter>
    <!-- <pre>{{$data}}</pre> -->
 </q-page>
</template>

<script>
import CreateContract from 'components/membership/CreateContract'
import MembershipCard from 'components/membership/MembershipCard'
import { mapGetters } from 'vuex'

// const UUID_V4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

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
        rowsNumber: 10
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
      selection: [],
      memberships: []
    }
  },
  methods: {
    ...mapGetters('auth', ['isAuthorized']),
    backgroundImage (typeId) {
      return `statics/membership/${membershipTypes.find(type => type.type_id === typeId).background}`
    },
    addToSelection (membership) {
      if (!this.selection.some(item => item.membership_id === membership.membership_id)) {
        this.selection.push(membership)
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
              end_date
            }
          }
        }
      `

      const variables = {
        limit: pagination.rowsPerPage,
        offset: pagination.rowsPerPage * (pagination.page - 1),
        order_by: [
          { created_at: 'desc' }
        ],
        where: {}
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
