<template>
  <q-btn v-bind="$attrs" @click="showDialog = true">
    <q-dialog v-model="showDialog">
      <q-card>
        <q-bar>
          Registar Uso
          <q-space></q-space>
          <q-btn dense flat icon="mdi-close" v-close-popup></q-btn>
        </q-bar>

        <qrcode-stream :camera="camera" @decode="decode" @init="onInit">
          <q-inner-loading :showing="loading">
            <q-spinner></q-spinner>
          </q-inner-loading>
        </qrcode-stream>
      </q-card>
    </q-dialog>
  </q-btn>
</template>

<script>
import { QrcodeStream } from 'vue-qrcode-reader'

const successAudio = new Audio('statics/success.mp3')
const failureAudio = new Audio('statics/failure.mp3')

export default {
  name: 'RegisterUse',
  components: { QrcodeStream },
  data () {
    return {
      showDialog: false,
      loading: true,
      camera: 'auto'
    }
  },
  methods: {
    toggleCamera () {
      this.camera = this.camera === 'off' ? 'auto' : 'off'
    },
    async decode (code) {
      const query = /* GraphQL */`
        mutation ($objects: [membership_use_insert_input!]!) {
          insert: insert_membership_use (objects: $objects) {
            affected_rows
            use: returning {
              card {
                name
                document
              }
            }
          }
        }
      `

      const variables = {
        objects: { card_id: code }
      }

      try {
        this.toggleCamera()
        this.loading = true

        const { insert: { use: [ { card: { name, document } } ] } } = await this.$gql({ query, variables, role: 'membership_use' })

        successAudio.play()
        this.$q.notify({ color: 'positive', icon: 'mdi-check', message: `Uso de membresia registrado: ${name}, ${document}` })
        this.$nextTick(() => {
          this.$emit('update')
        })
      } catch (error) {
        failureAudio.play()
        this.$gql.handleError(error)
      } finally {
        this.loading = false
        this.toggleCamera()
      }
    },
    getErrorMsg (error) {
      switch (error.name) {
        case 'NotAllowedError': return 'ERROR: you need to grant camera access permisson'
        case 'NotFoundError': return 'ERROR: no camera on this device'
        case 'NotSupportedError': return 'ERROR: secure context required (HTTPS, localhost)'
        case 'NotReadableError': return 'ERROR: is the camera already in use?'
        case 'OverconstrainedError': return 'ERROR: installed cameras are not suitable'
        case 'StreamApiNotSupportedError': return 'ERROR: Stream API is not supported in this browser'
        default: return error.message
      }
    },
    async onInit (promise) {
      try {
        this.loading = true
        await promise
        this.loading = false
      } catch (error) {
        this.showDialog = false
        this.$q.notify({ color: 'negative', icon: 'mdi-alert', message: this.getErrorMsg(error) })
      }
    }
  }
}
</script>
