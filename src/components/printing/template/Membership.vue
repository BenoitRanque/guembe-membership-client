<template>
  <div style="font-size: 0;">
    <membership-card
      class="print-as-page"
      :image="page.image"
      :type-id="page.type_id"
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
  props: ['page']
}
</script>

<style>
</style>
