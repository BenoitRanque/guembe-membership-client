<template>
  <svg width="100%" height="100%" viewBox="0, 0, 500, 318.5" preserveAspectRation="xMinYMin meet">
    <image x="-3" y="0" height="100%" href="statics/membership/membership_reverse.png"></image>
    <foreignObject x="335" y="20" width="140" height="200">
      <div class="q-pa-sm bg-white rounded-borders" style="display: inline-block">
        <qr-code style="font-size: 0" :value="code" :size="120" level="H"></qr-code>
      </div>
    </foreignObject>
  </svg>
</template>

<script>
import QrCode from 'qrcode.vue'
export default {
  name: 'MembershipCardReverse',
  components: { QrCode },
  props: {
    code: {
      type: String
    }
  }
}
</script>
