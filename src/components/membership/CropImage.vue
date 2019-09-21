<template>
  <div class="relative-position">
    <img ref="image" :src="image" alt="">
    <q-toolbar class="absolute-bottom q-pb-sm justify-center">
      <!-- <q-btn round color="secondary" icon="mdi-camera-retake"></q-btn>
      <q-space></q-space> -->
      <q-btn @click="confirm" size="lg" round color="primary" icon="mdi-crop">
        <q-tooltip>
          Confirmar Recorte
        </q-tooltip>
      </q-btn>
    </q-toolbar>
  </div>
</template>

<script>
import Cropper from 'cropperjs'

export default {
  name: 'CropImage',
  props: {
    image: {
      type: String
    }
  },
  data () {
    return {
      cropper: null
    }
  },
  watch: {
    image () {
      this.bindImage()
    }
  },
  methods: {
    bindImage () {
      if (this.cropper) {
        this.cropper.replace(this.image, true)
        return
      }
      this.cropper = new Cropper(this.$refs.image, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: 'move'
      })
    },
    confirm () {
      this.$emit('image', this.cropper.getCroppedCanvas().toDataURL('image/jpg'))
    }
  },
  mounted () {
    this.bindImage()
  },
  beforeDestroy () {
    if (this.cropper) {
      this.cropper.destroy()
    }
  }
}
</script>

<style src="cropperjs/dist/cropper.css" ></style>
