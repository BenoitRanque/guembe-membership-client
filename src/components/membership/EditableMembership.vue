<template>
  <div class="relative-position cursor-pointer">
    <membership-card
      @click.native="showEditMembershipDialog = true"
      :image="value.image"
      :background="background"
      :name="value.name ? value.name : 'Nombre Apellido'"
      :document="value.document ? value.document : '00000000 SC'"
      :valid-to="validTo"
    ></membership-card>
    <div v-if="!value.image" class="absolute bg-grey-3 flex flex-center text-grey" style="font-size: 1rem; top: 7.2%; left: 4%; width: 26%; height: 40%;">
      Foto
    </div>
    <q-tooltip>
      Haz click derecho para modificar
    </q-tooltip>
    <q-menu context-menu>
      <q-list dense>
        <q-item clickable v-ripple v-close-popup @click="showEditMembershipDialog = true">
          <q-item-section>Editar</q-item-section>
          <q-item-section side>
            <q-icon name="mdi-pencil"></q-icon>
          </q-item-section>
        </q-item>
        <q-separator></q-separator>
        <q-item clickable v-ripple v-close-popup @click="remove">
          <q-item-section>Eliminar</q-item-section>
          <q-item-section side>
            <q-icon name="mdi-delete"></q-icon>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
    <q-dialog v-model="showEditMembershipDialog">
      <q-card>
        <q-bar>
          Editar membresia
          <q-space></q-space>
          <q-btn v-close-popup icon="mdi-close" dense flat></q-btn>
        </q-bar>
        <q-form @submit="showEditMembershipDialog = false">
          <q-card-section>
            <q-select dense filled label="Tipo de Membresia" :options="membershipTypes" v-model="membershipType"></q-select>
            <q-input required class="q-my-sm" dense filled label="Nombre Completo" :value="value.name" @input="update('name', $event)"></q-input>
            <q-input required dense filled label="Documento de identidad" :value="value.document" @input="update('document', $event)" ></q-input>
          </q-card-section>
          <q-card-section>
            <div class="relative-position" style="width: 460px; font-size: 0">
              <membership-card
                :image="value.image"
                :background="background"
                :name="value.name"
                :document="value.document"
                :valid-to="validTo"
              ></membership-card>
              <div class="absolute" style="top: 7.2%; left: 4%; width: 26%; height: 40%;">
                <q-btn v-if="!value.image" class="fit" @click="showAddImageDialog = true" color="primary" size="1.6rem" outline icon="mdi-camera-plus-outline">
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
            <q-btn flat type="submit" label="ok"></q-btn>
          </q-card-actions>
        </q-form>
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
const membershipTypes = [
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
]
export default {
  name: 'EditableMembership',
  components: { CaptureImage, CropImage, UploadImage, MembershipCard },
  props: {
    validTo: {
      type: String,
      default: ''
    },
    opened: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      membershipTypes,
      showEditMembershipDialog: false,
      showAddImageDialog: false,
      showCaptureImageDialog: false,
      showUploadImageDialog: false,
      showCropImageDialog: false,
      rawImage: null,
      membership: {
        type_id: 'INDIVIDUAL',
        name: '',
        document: '',
        image: null
      }
    }
  },
  computed: {
    membershipType: {
      get () {
        if (!this.value.type_id) return null
        return membershipTypes.find(type => type.type_id === this.value.type_id)
      },
      set (value) {
        this.update('type_id', value.type_id)
      }
    },
    background () {
      return `statics/membership/${this.membershipType ? this.membershipType.background : membershipTypes[0].background}`
    }
  },
  methods: {
    remove () {
      this.$q.dialog({
        title: 'Eliminar Membresia',
        message: 'Confirma que desea eliminar esta membresia?',
        cancel: true,
        ok: {
          label: 'Eliminar',
          color: 'negative',
          icon: 'mdi-delete'
        }
      }).onOk(() => {
        this.$emit('remove')
      })
    },
    update (field, value) {
      this.$emit('input', {
        ...this.value,
        [field]: value
      })
    },
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
      this.update('image', image)
    }
  },
  mounted () {
    if (this.opened) {
      this.showEditMembershipDialog = true
    }
  }
}
</script>
