<template>
  <div style="font-size: 0;">
    <membership-card
      class="print-as-page"
      :image="page.image"
      :background="background"
      :name="page.name"
      :document="page.document"
      :valid-to="page.validTo"
    ></membership-card>
    <membership-card-reverse
      class="print-as-page"
      :code="page.card_id"
    ></membership-card-reverse>
  </div>
</template>

<script>
import MembershipCard from 'components/membership/MembershipCard'
import MembershipCardReverse from 'components/membership/MembershipCardReverse'
export default {
  name: 'MembershipPrintingTemplate',
  components: {
    MembershipCard,
    MembershipCardReverse
  },
  props: ['page'],
  data () {
    return {
      membershipTypes: [
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
    }
  },
  computed: {
    membershipType () {
      return this.membershipTypes.find(type => type.type_id === this.page.type_id)
    },
    background () {
      return `statics/membership/${this.membershipType ? this.membershipType.background : this.membershipTypes[0].background}`
    }
  }
}
</script>

<style>
</style>
