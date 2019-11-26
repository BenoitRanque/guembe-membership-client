<template>
  <div class="relative-position" style="font-size: 0; overflow: hidden;">
    <img class="full-width" ref="image" :src="image" alt="">

    <q-btn class="absolute-bottom q-mb-sm" style="left: 50%; transform: translateX(-50%)" @click="confirm" size="lg" round color="primary" icon="mdi-crop">
      <q-tooltip>
        Confirmar Recorte
      </q-tooltip>
    </q-btn>
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
      this.$emit('image', this.cropper.getCroppedCanvas({ width: 300, height: 300 }).toDataURL('image/jpg'))
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
