<template>
  <q-page>
    <!-- <img alt="Quasar logo" src="~assets/quasar-logo-full.svg"> -->
    <web-cam
      ref="webcam"
      :device-id="deviceId"
      width="auto"
      height="auto"
      @started="onStarted"
      @stopped="onStopped"
      @error="onError"
      @cameras="onCameras"
      @camera-change="onCameraChange"
    />
    <q-select :options="devices" v-model="device"></q-select>
    <q-btn @click="onCapture">Capture</q-btn>
    <img :src="img" alt="">
    <pre>{{$data}}</pre>
  </q-page>
</template>

<script>
import { WebCam } from 'vue-web-cam'
export default {
  name: 'PageIndex',
  components: { WebCam },
  data () {
    return {
      img: null,
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
    onCapture () {
      this.img = this.$refs.webcam.capture()
    },
    onStarted (stream) {
      this.stream = stream
      console.log('On Started Event', stream)
    },
    onStopped (stream) {
      this.stream = null
      console.log('On Stopped Event', stream)
    },
    onStop () {
      this.$refs.webcam.stop()
    },
    onStart () {
      this.$refs.webcam.start()
    },
    onError (error) {
      console.log('On Error Event', error)
    },
    onCameras (devices) {
      this.devices = devices
      console.log('On Cameras Event', devices)
    },
    onCameraChange (deviceId) {
      this.device = this.devices.find(device => device.deviceId === deviceId)
      console.log('On Camera Change Event', deviceId)
    }
  }
}
</script>
