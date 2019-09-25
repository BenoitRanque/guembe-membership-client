<template>
  <q-stepper v-model="step" vertical>
    <q-step :name="0" title="Detalles">
      <q-input filled label="Nombre Completo" v-model="membership.name"></q-input>
      <q-input filled label="Documento de identidad" v-model="membership.document"></q-input>
      <input type="file" class="q-btn">
      <q-btn @click="step += 1">Next</q-btn>
    </q-step>
    <q-step :name="1" title="Toma de foto">
      <q-btn @click="showCaptureImageDialog = true" icon="mdi-camera"></q-btn>
      <q-btn @click="showUploadImageDialog = true" icon="mdi-upload"></q-btn>
      <q-dialog v-model="showCaptureImageDialog">
        <q-card>
          <q-bar>
            Tomar foto
            <q-space></q-space>
            <q-btn flat dense icon="mdi-close" v-close-popup></q-btn>
          </q-bar>
          <capture-image @image="updateImage"></capture-image>
        </q-card>
      </q-dialog>
      <q-dialog v-model="showUploadImageDialog">
        <q-card>
          <q-bar>
            Subir imagen
            <q-space></q-space>
            <q-btn flat dense icon="mdi-close" v-close-popup></q-btn>
          </q-bar>
          <upload-image @image="updateImage"></upload-image>
        </q-card>
      </q-dialog>
    </q-step>
    <q-step :name="2" title="Editar foto">
      <crop-image :image="membership.image" @image="updateImage"></crop-image>
    </q-step>
    <q-step :name="3" title="Finalizar">
      <membership-card
        :image="membership.image"
        :background="membership.background"
        :name="membership.name"
        :document="membership.document"
        :valid-from="membership.validFrom"
        :valid-to="membership.validTo"
      ></membership-card>
      <q-btn @click="$root.$emit('PRINT', { preview: true, template: 'membership', pages: [ membership, membership, membership ] })">Print</q-btn>
    </q-step>
    <template #navigation>
      <q-btn @click="step -= 1">previous</q-btn>
      <q-btn @click="step += 1">next</q-btn>
    </template>
  </q-stepper>
</template>

<script>
import CaptureImage from './CaptureImage'
import UploadImage from './UploadImage'
import CropImage from './CropImage'
import MembershipCard from './MembershipCard'
export default {
  name: 'AddMembership',
  components: { CaptureImage, CropImage, UploadImage, MembershipCard },
  data () {
    return {
      step: 0,
      showCaptureImageDialog: false,
      showUploadImageDialog: false,
      membership: {
        membership_id: '666d39ca-dc3d-11e9-8a34-2a2ae2dbcce4',
        background: 'statics/membership/membership_individual.png',
        name: 'Ranque Loiseleur \n Benoit Yves Patrick',
        document: '13513808 SC',
        image: null,
        validFrom: '2019-01-01',
        validTo: '2019-12-31'
      }
    }
  },
  methods: {
    updateImage (image) {
      this.membership.image = image
      this.step += 1
    }
  }
}
</script>
