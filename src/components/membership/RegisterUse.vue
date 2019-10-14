<template>
  <q-btn v-bind="$attrs" @click="showScanDialog = true">
    <q-dialog v-model="showScanDialog" persistent>
      <q-card>
        <q-bar>
          Registar Uso
          <q-space></q-space>
          <q-btn dense flat icon="mdi-close" v-close-popup></q-btn>
        </q-bar>
        <qrcode-stream :camera="camera" @decode="readCode" @init="onInit">
          <q-inner-loading :showing="loading">
            <q-spinner></q-spinner>
          </q-inner-loading>
        </qrcode-stream>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showPreviewDialog" persistent @hide="toggleCamera('auto')">
      <q-card class="relative-position" style="width: 400px">
        <membership-card
          v-if="card"
          :image="card.image"
          :type-id="card.type_id"
          :name="card.name"
          :document="card.document"
          :valid-to="card.contract.end_date"
        ></membership-card>
        <q-card-section v-if="!membershipValid" class="text-negative text-bold">
          Membresia no vigente
        </q-card-section>
        <q-card-section v-if="membershipAlreadyUsed" class="text-negative text-bold">
          Membresia ya utilizada hoy
        </q-card-section>
        <q-separator></q-separator>
        <q-card-actions align="around">
          <q-btn v-close-popup flat>Cancelar</q-btn>
          <q-btn unelevated color="primary" :disable="membershipAlreadyUsed || !membershipValid" @click="registerUse">Registrar Uso</q-btn>
        </q-card-actions>
        <q-inner-loading :showing="loading">
          <q-spinner></q-spinner>
        </q-inner-loading>
      </q-card>
    </q-dialog>
  </q-btn>
</template>

<script>
import { QrcodeStream } from 'vue-qrcode-reader'
import MembershipCard from 'components/membership/MembershipCard'
import { date } from 'quasar'
const { formatDate, isBetweenDates, extractDate } = date

const successAudio = new Audio('statics/success.mp3')
const failureAudio = new Audio('statics/failure.mp3')

const UUID_V4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

export default {
  name: 'RegisterUse',
  components: { QrcodeStream, MembershipCard },
  data () {
    return {
      showScanDialog: false,
      showPreviewDialog: false,
      card: null,
      loading: true,
      camera: 'auto'
    }
  },
  computed: {
    membershipAlreadyUsed () {
      return this.card && this.card.uses.aggregate.count > 0
    },
    membershipValid () {
      if (!this.card) {
        return false
      }
      return isBetweenDates(new Date(), extractDate(this.card.contract.start_date, 'YYYY-MM-DD'), extractDate(this.card.contract.end_date, 'YYYY-MM-DD'))
    }
  },
  methods: {
    toggleCamera (state) {
      this.camera = state
    },
    async readCode (cardId) {
      if (!UUID_V4_REGEX.test(cardId)) {
        this.$q.notify({ color: 'warning', icon: 'mdi-alert', message: `Codigo con formato incorrecto: "${cardId}"` })
        return
      }

      successAudio.play()

      const query = /* GraphQL */`
        query ($cardId: uuid! $today: date!) {
          card: membership_card_by_pk(card_id: $cardId) {
            card_id
            type_id
            image
            name
            document
            contract {
              start_date
              end_date
            }
            uses: uses_aggregate (where: { date: { _eq: $today } }) {
              aggregate {
                count
              }
            }
          }
        }
      `

      const variables = {
        cardId,
        today: formatDate(new Date(), 'YYYY-MM-DD')
      }

      try {
        this.loading = true
        this.toggleCamera('off')

        const { card } = await this.$gql({ query, variables, role: 'membership_use' })

        this.card = card
        this.showPreviewDialog = true
      } catch (error) {
        this.$gql.handleError(error)
        this.toggleCamera('auto')
      } finally {
        this.loading = false
      }
    },
    async registerUse () {
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
        objects: { card_id: this.card.card_id }
      }

      try {
        this.loading = true

        const { insert: { use: [ { card: { name, document } } ] } } = await this.$gql({ query, variables, role: 'membership_use' })

        this.$emit('update')
        this.$q.notify({ color: 'positive', icon: 'mdi-check', message: `Uso de membresia registrado: ${name}, ${document}` })
      } catch (error) {
        failureAudio.play()
        this.$gql.handleError(error)
      } finally {
        this.showPreviewDialog = false
        this.loading = false
        this.card = null
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
      } catch (error) {
        this.showScanDialog = false
        this.$q.notify({ color: 'negative', icon: 'mdi-alert', message: this.getErrorMsg(error) })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
