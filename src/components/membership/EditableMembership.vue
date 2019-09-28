<template>
  <div>
    <div class="relative-position" style="width: 400px">
      <membership-card
        @click.native="showEditMembershipDialog = true"
        :image="membership.image"
        :background="background"
        :name="membership.name ? membership.name : 'Nombre Apellido'"
        :document="membership.document ? membership.document : '00000000 SC'"
        :valid-to="membership.validTo"
      ></membership-card>
      <div v-if="!membership.image" class="absolute bg-grey-3 flex flex-center text-grey" style="top: 7.2%; left: 4%; width: 26%; height: 40%;">
        Foto
      </div>
    </div>
    <q-dialog v-model="showEditMembershipDialog">
      <q-card>
        <q-bar>
          Editar membresia
          <q-space></q-space>
          <q-btn v-close-popup icon="mdi-close" dense flat></q-btn>
        </q-bar>
        <q-card-section>
          <q-select dense filled label="Tipo de Membresia" :options="membershipTypes" v-model="membershipType"></q-select>
          <q-input class="q-my-sm" dense filled label="Nombre Completo" v-model="membership.name"></q-input>
          <q-input dense filled label="Documento de identidad" v-model="membership.document"></q-input>
        </q-card-section>
        <q-card-section>
          <div class="relative-position" style="width: 400px; font-size: 0">
            <membership-card
              :image="membership.image"
              :background="background"
              :name="membership.name"
              :document="membership.document"
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

          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-actions align="center">
          <q-btn flat v-close-popup label="ok"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
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
      showEditMembershipDialog: false,
      showAddImageDialog: false,
      showCaptureImageDialog: false,
      showUploadImageDialog: false,
      showCropImageDialog: false,
      rawImage: null,
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
      ],
      membership: {
        membership_id: '666d39ca-dc3d-11e9-8a34-2a2ae2dbcce4',
        type_id: 'INDIVIDUAL',
        name: '',
        document: '',
        image: null,
        validTo: '2019-12-31'
      }
    }
  },
  computed: {
    membershipType: {
      get () {
        if (!this.membership.type_id) return null
        return this.membershipTypes.find(type => type.type_id === this.membership.type_id)
      },
      set (value) {
        this.membership.type_id = value.type_id
      }
    },
    background () {
      return this.membershipType ? `statics/membership/${this.membershipType.background}` : null
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
