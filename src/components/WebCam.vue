<template>
  <div>
    <video ref="video" autoplay />
    <canvas ref="canvas" class="display-none" />
    <q-btn @click="loadDevices">Load Devices</q-btn>
    <q-select :options="devices" v-model="device"></q-select>
    <q-btn @click="loadDevices">Load Devices</q-btn>
    <q-btn @click="getVideoMedia(device)">Load Devices</q-btn>
    <pre>{{devices}}</pre>
  </div>
</template>

<script>
export default {
  name: 'WebCam',
  props: {
    deviceId: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      devices: [],
      device: null,
      stream: null,
      tracker: null,
      capture: null
    }
  },
  watch: {
    device (newDevice, oldDevice) {
      if (oldDevice) {
        // stop camera
      }

      if (newDevice) {
        this.getVideoMedia(newDevice)
      }
    }
  },
  methods: {
    async loadDevices () {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        this.devices = devices.filter(({ kind }) => kind === 'videoinput')
        if (this.devices.length) {
          this.device = this.devices[0]
        }
      } catch (error) {
        console.error(error)
      }
    },
    async getVideoMedia (device) {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: device.deviceId } } })
        this.tracker = this.stream.getVideoTracks()[0]
        // this.capture = new ImageCapture(this.tracker)
        this.$refs.video.srcObject = this.stream
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>
