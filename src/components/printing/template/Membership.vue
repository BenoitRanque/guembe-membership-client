<template>
  <div style="font-size: 0;">
    <membership-card
      class="print-as-page"
      :image="page.image"
      :background="page.background"
      :name="page.name"
      :document="page.document"
      :valid-from="page.validFrom"
      :valid-to="page.validTo"
    ></membership-card>
    <membership-card-reverse
      class="print-as-page"
      :code="page.membership_id"
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
  props: ['page']
}
</script>

<style>
</style>
