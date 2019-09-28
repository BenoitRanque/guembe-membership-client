<template>
  <div class="">
    <div class="">
      <q-input filled label="Nombre Completo" v-model="membership.name"></q-input>
      <q-input filled label="Documento de identidad" v-model="membership.document"></q-input>
    </div>
    <div class="relative-position" style="font-size: 0">
      <membership-card
        style="width: 400px"
        :image="membership.image"
        :background="membership.background"
        :name="membership.name"
        :document="membership.document"
        :valid-from="membership.validFrom"
        :valid-to="membership.validTo"
      ></membership-card>
      <div class="absolute" style="top: 7.2%; left: 4%; width: 26%; height: 40%;">
        <q-btn v-if="!membership.image" class="fit" @click="showAddImageDialog = true" color="primary" size="1.6rem" outline icon="mdi-camera-plus-outline">
          <q-tooltip>Aggregar Foto</q-tooltip>
        </q-btn>
        <q-btn v-else class="absolute absolute-top-right q-ma-xs" @click="showAddImageDialog = true" size="0.6rem" dense color="white" text-color="primary" icon="mdi-camera-plus">
          <q-tooltip>Cambiar Foto</q-tooltip>
        </q-btn>
        <q-btn v-if="rawImage" class="absolute absolute-bottom-right q-ma-xs" @click="showCropImageDialog = true" size="0.6rem" dense color="white" text-color="primary" icon="mdi-crop">
          <q-tooltip>Recortar</q-tooltip>
        </q-btn>
      </div>
      <q-dialog v-model="showAddImageDialog">
        <q-card>
          <q-bar>
            {{ rawImage ? 'Cambiar Imagen' : 'Aggregar Imagen' }}
            <q-space></q-space>
            <q-btn flat dense icon="mdi-close" v-close-popup></q-btn>
          </q-bar>
          <q-list>
            <q-item clickable v-ripple v-close-popup @click="showCaptureImageDialog = true">
              <q-item-section avatar>
                <q-avatar rounded color="teal" text-color="white" icon="mdi-webcam" />
              </q-item-section>

              <q-item-section>Tomar fotografia</q-item-section>
            </q-item>
            <q-item clickable v-ripple v-close-popup @click="showUploadImageDialog = true">
              <q-item-section avatar>
                <q-avatar rounded color="blue" text-color="white" icon="mdi-upload" />
              </q-item-section>

              <q-item-section>Subir Imagen</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </q-dialog>
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
      <q-dialog v-model="showCropImageDialog">
        <q-card>
          <q-bar>
            Recortar Imagen
            <q-space></q-space>
            <q-btn flat dense icon="mdi-close" v-close-popup></q-btn>
          </q-bar>
          <crop-image :image="rawImage" @image="imageCropped"></crop-image>
        </q-card>
      </q-dialog>
    </div>
  </div>
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
      showAddImageDialog: false,
      showCaptureImageDialog: false,
      showUploadImageDialog: false,
      showCropImageDialog: false,
      rawImage: null,
      membership: {
        membership_id: '666d39ca-dc3d-11e9-8a34-2a2ae2dbcce4',
        background: 'statics/membership/membership_individual.png',
        name: 'Benoit Yves Patrick Ranque Loiseleur',
        document: '13513808 SC',
        image: null,
        validFrom: '2019-01-01',
        validTo: '2019-12-31'
      }
    }
  },
  methods: {
    updateImage (image) {
      this.showCaptureImageDialog = false
      this.showUploadImageDialog = false
      this.rawImage = image
      this.$nextTick(() => {
        this.showCropImageDialog = true
      })
    },
    imageCropped (image) {
      this.showCropImageDialog = false
      this.membership.image = image
    }
  }
}
</script>
