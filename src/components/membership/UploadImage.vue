<template>
  <q-uploader
    hide-upload-btn
    accept=".jpg, .png, image/*"
    @added="fileAdded"
  >
    <template #header="uploader">
      <q-toolbar class="relative-position">
        <q-btn flat dense icon="mdi-image-search"></q-btn>
        <q-toolbar-title>
          Elegir imagen
        </q-toolbar-title>
        <q-uploader-add-trigger />
      </q-toolbar>
    </template>
    <template #list>
      <div class="full-height flex column flex-center">
        <q-icon name="mdi-crop-free" size="md" color="grey"></q-icon>
        <div class="text-grey">
          Preuba arrastrar y soltar aqui tus imagenes
        </div>
      </div>
    </template>
  </q-uploader>
</template>

<script>
export default {
  name: 'UploadImage',
  methods: {
    fileAdded (files) {
      if (files.length && files[0].__img) {
        this.$emit('image', files[0].__img.src)
      }
    }
  }
}
</script>
