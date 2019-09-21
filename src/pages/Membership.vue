<template>
  <q-page>
    <q-btn @click="showAddMembershipDialog = true">Crear membresia</q-btn>
    <q-btn @click="$root.$emit('PRINT', { preview: true, template: 'membership', pages: memberships })">Print</q-btn>
    <q-btn @click="showDialog = true">show</q-btn>
    <q-dialog v-model="showDialog">
      hello
    </q-dialog>
    <q-dialog v-model="showAddMembershipDialog" maximized>
      <q-card>
        <q-bar>
          Aggregar membresia
          <q-space></q-space>
          <q-btn v-close-popup icon="mdi-close" dense flat></q-btn>
        </q-bar>
        <q-splitter v-model="splitter">
          <template #before>
            <add-membership></add-membership>
          </template>
        </q-splitter>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import AddMembership from 'components/membership/AddMembership'
export default {
  name: 'Membership',
  components: { AddMembership },
  data () {
    return {
      showAddMembershipDialog: false,
      showDialog: false,
      splitter: 50,
      memberships: [
        {
          membership_id: '666d39ca-dc3d-11e9-8a34-2a2ae2dbcce4',
          background: 'statics/membership/membership_individual.png',
          name: 'Ranque Loiseleur Benoit Yves Patrick',
          document: '13513808 SC',
          image: null,
          validFrom: '2019-01-01',
          validTo: '2019-12-31'
        },
        {
          membership_id: '666d39ca-dc3d-11e9-8a34-2a2ae2dbcce4',
          background: 'statics/membership/membership_individual.png',
          name: 'Ranque Loiseleur Benoit Yves Patrick',
          document: '13513808 SC',
          image: null,
          validFrom: '2019-01-01',
          validTo: '2019-12-31'
        },
        {
          membership_id: '666d39ca-dc3d-11e9-8a34-2a2ae2dbcce4',
          background: 'statics/membership/membership_individual.png',
          name: 'Ranque Loiseleur Benoit Yves Patrick',
          document: '13513808 SC',
          image: null,
          validFrom: '2019-01-01',
          validTo: '2019-12-31'
        },
        {
          membership_id: '666d39ca-dc3d-11e9-8a34-2a2ae2dbcce4',
          background: 'statics/membership/membership_individual.png',
          name: 'Ranque Loiseleur Benoit Yves Patrick',
          document: '13513808 SC',
          image: null,
          validFrom: '2019-01-01',
          validTo: '2019-12-31'
        },
        {
          membership_id: '666d39ca-dc3d-11e9-8a34-2a2ae2dbcce4',
          background: 'statics/membership/membership_individual.png',
          name: 'Ranque Loiseleur Benoit Yves Patrick',
          document: '13513808 SC',
          image: null,
          validFrom: '2019-01-01',
          validTo: '2019-12-31'
        }
      ]
    }
  }
}
</script>
