<template>
  <div style="font-size: 0; width: 300px">
    <membership-card
      class="print-as-page"
      :image="page.image"
      :background="page.background"
      :name="page.name"
      :document="page.document"
      :valid-from="page.validFrom"
      :valid-to="page.validTo"
    ></membership-card>
    <div class="relative-position print-as-page">
      <img src="statics/membership/membership_reverse.png" class="fit" alt="">
      <div class="absolute q-pa-sm bg-white rounded-borders" style="top: 5%; left: 65%">
        <qr-code :value="page.membership_id" :size="80" level="L"></qr-code>
      </div>
    </div>
  </div>
</template>

<script>
import MembershipCard from 'components/membership/MembershipCard'
import QrCode from 'qrcode.vue'
export default {
  name: 'MembershipPrintingTemplate',
  components: {
    MembershipCard,
    QrCode
  },
  props: ['page']
}
</script>

<style>
</style>
