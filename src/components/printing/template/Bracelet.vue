<template>
  <div class="row items-center nowrap template-margin">
    <div class="col-auto">
      <qr-code :value="page.bracelet_id" :size="80" level="L"></qr-code>
    </div>
    <div class="col-auto q-py-xs">
      <div class="column">
        <div class="col text-center">
          <img class="q-ml-md q-mr-sm" src="statics/textlogo.png" style="height: 35px" alt="">
        </div>
        <div class="col text-bold row">
          <div class="q-pr-xs text-right col">
            <small>
              {{page.series}}
            </small>
          </div>
          <div class="col">
            <small>
              {{page.serial}}
            </small>
          </div>
        </div>
      </div>
    </div>
    <div class="col-auto">
      <img style="height: 70px" src="statics/isologo.png" alt="">
    </div>
  </div>
</template>

<script>

// bracelet size = 24mm * 295mm
// bracelet configuraction margin:
// left and right: 1mm
// bottom: 15mm
// top: 200mm
// configure this in page settings

import QrCode from 'qrcode.vue'
export default {
  name: 'BraceletPrintingTemplate',
  components: {
    QrCode
  },
  props: ['page'],
  data () {
    return {}
  }
}
</script>

<style lang="stylus" scoped>
@media print
  .template-margin
    margin-top 2mm
    margin-bottom 2mm
</style>
