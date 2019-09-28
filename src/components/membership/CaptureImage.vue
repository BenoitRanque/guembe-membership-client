<template>
  <!-- line height 0 to avoid small space under video element -->
  <div class="relative-position" style="line-height: 0;">
    <web-cam
      ref="webcam"
      :device-id="deviceId"
      width="100%"
      height="auto"
      @started="onStarted"
      @stopped="onStopped"
      @error="onError"
      @cameras="onCameras"
      @camera-change="onCameraChange"
    />
    <q-toolbar class="absolute absolute-bottom q-pb-sm">
      <q-btn :disable="!device" class="q-mr-xs" round color="secondary" dense @click="toggle" :icon="stream ? 'mdi-camera-off' : 'mdi-camera'">
        <q-tooltip>Encenter/apagar camara</q-tooltip>
      </q-btn>
      <q-select :disable="!devices.length" dense standout dark bg-color="primary" :options="devices" v-model="device"></q-select>
      <q-space></q-space>
      <q-btn @click="capture" :disable="!stream" size="lg" dense round color="primary" icon="mdi-camera-iris">
        <q-tooltip>
          Tomar Foto
        </q-tooltip>
      </q-btn>
    </q-toolbar>
    <q-inner-loading :showing="!devices.length">
      <span class="text-center">
        <q-spinner  size="md" class="q-ma-md" color="primary"/>
        <br>
        Buscando camaras...
      </span>
    </q-inner-loading>
  </div>
</template>

<script>
import { WebCam } from 'vue-web-cam'
export default {
  name: 'CaptureImage',
  components: { WebCam },
  data () {
    return {
      loading: true,
      device: null,
      devices: [],
      stream: null
    }
  },
  computed: {
    deviceId () {
      return this.device ? this.device.deviceId : null
    }
  },
  watch: {
    devices (devices) {
      // Once we have a list select the first one
      this.device = devices && devices.length ? devices[0] : null
    }
  },
  methods: {
    toggle () {
      if (this.stream) {
        this.stop()
      } else {
        this.start()
      }
    },
    stop () {
      this.$refs.webcam.stop()
    },
    start () {
      this.$refs.webcam.start()
    },
    capture () {
      this.$emit('image', this.$refs.webcam.capture())
    },
    onStarted (stream) {
      this.stream = stream
      // console.log('On Started Event', stream)
    },
    onStopped (stream) {
      this.stream = null
      // console.log('On Stopped Event', stream)
    },
    onError (error) {
      console.error(error)
      // console.log('On Error Event', error)
    },
    onCameras (devices) {
      this.devices = devices
      // console.log('On Cameras Event', devices)
    },
    onCameraChange (deviceId) {
      this.device = this.devices.find(device => device.deviceId === deviceId)
      // console.log('On Camera Change Event', deviceId)
    }
  }
}
</script>
