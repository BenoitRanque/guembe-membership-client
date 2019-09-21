<template>
  <svg width="100%" height="100%" viewBox="0, 0, 508 , 319" preserveAspectRation="xMinYMin meet">
    <image x="0" y="0" width="508" height="319" :href="background"></image>
    <image x="20" y="20" width="130" height="130" :href="image"></image>
    <text x="0" y="180" font-size="28" style="font-weight: 500">
      <tspan ref="lineBreakpointTestNode" fill="transparent" dy="-1em" dx="20" x="0"></tspan>
      <tspan v-for="(line, index) in nameLines" :key="index" dy="1.1em" dx="20" x="0">{{line}}</tspan>
      <tspan fill="grey" font-size="24" style="font-weight: 400" dy="1.2em" dx="20" x="0">{{document}}</tspan>
    </text>
    <text x="0" y="284" font-size="10">
      <tspan dx="24" x="0">
        PERIODO
      </tspan>
      <tspan dy="1.1em" dx="24" x="0">
        VIGENCIA
      </tspan>
    </text>
    <text x="0" y="284" font-size="10">
      <tspan dx="80" x="0">
        {{displayDate(validFrom)}}
      </tspan>
      <tspan dy="1.1em" dx="80" x="0">
        {{displayDate(validTo)}}
      </tspan>
    </text>
  </svg>
</template>

<script>
import { date } from 'quasar'
const { formatDate, extractDate } = date

export default {
  name: 'MembershipCard',
  props: {
    // print: {
    //   type: Boolean,
    //   default: false
    // },
    image: {
      type: String
    },
    name: {
      type: String,
      default: ''
    },
    document: {
      type: String,
      default: ''
    },
    validFrom: {
      type: String,
      default: null
    },
    validTo: {
      type: String,
      default: null
    },
    background: {
      type: String
    }
  },
  data () {
    return {
      lineBreakpointTestNode: null
    }
  },
  computed: {
    nameLines () {
      if (!this.lineBreakpointTestNode) {
        return []
      }

      const BREAKPOINT = 256
      const node = this.lineBreakpointTestNode

      node.innerHTML = ''

      return this.name
        .trim()
        .replace(/\s+/, ' ')
        .split(' ')
        .reduce((lines, word) => {
          lines.push(word)

          if (node.innerHTML) {
            node.innerHTML += ' '
          }

          node.innerHTML += word

          if (node.getComputedTextLength() > BREAKPOINT) {
            node.innerHTML = word
          } else if (lines.length >= 2) {
            lines[lines.length - 2] += ` ${lines.pop()}`
          }
          return lines
        }, [])
    }
  },
  methods: {
    displayDate (date) {
      return date ? formatDate(extractDate(date, 'YYYY-MM-DD'), 'YYYY/DD/MM') : ''
    }
  },
  mounted () {
    this.lineBreakpointTestNode = this.$refs.lineBreakpointTestNode
  }
}
</script>
