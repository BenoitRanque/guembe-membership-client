<template>
  <q-page>
    <create-contract v-if="isAuthorized('membership_print')" icon="mdi-plus" label="Crear Contrato"></create-contract>
 </q-page>
</template>

<script>
import CreateContract from 'components/membership/CreateContract'
import { mapGetters } from 'vuex'
export default {
  name: 'Membership',
  components: { CreateContract },
  data () {
    return {
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 3,
        rowsNumber: 10
      },
      columns: [],
      memberships: []
    }
  },
  methods: {
    ...mapGetters('auth', ['isAuthorized']),
    loadMemberships ({ pagination, filter }) {

    }
  },
  mounted () {
    this.loadMemberships({ pagination: this.pagination, filter: '' })
  }
}
</script>
