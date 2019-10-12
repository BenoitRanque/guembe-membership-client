<template>
  <div id="print-area">
    <q-dialog v-model="preview.show" persistent>
      <q-card>
        <q-bar>
          <q-btn
            v-if="$q.platform.is.electron"
            dense
            flat
            icon="mdi-settings"
            @click="printerOptions.show = true"
          >
            <q-tooltip>
              Configuracion de Impresora
            </q-tooltip>
          </q-btn>

          Previsualizar Impresion

          <q-space />
          <q-btn
            unelevated
            color="blue"
            dense
            icon="mdi-printer"
            @click="print"
          >
            <q-tooltip>
              Imprimir en impresora
              <br>
              {{printerOptions.printer ? printerOptions.printer : 'Impresora Por Defecto'}}
            </q-tooltip>
          </q-btn>

          <q-separator class="q-mx-sm" vertical></q-separator>

          <q-btn dense flat icon="mdi-close" @click="confirmCancel">
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section>
          <template v-if="pages.length > 0">
            <component
              :is="printingTemplateName"
              :page="pages[preview.page - 1]"
            />
          </template>
        </q-card-section>

        <template v-if="isMultiPage">
          <q-separator></q-separator>

          <q-card-actions v-if="isMultiPage" align="center">
            <q-pagination
              v-model="preview.page"
              :max="pageCount"
              input
            >
            </q-pagination>
          </q-card-actions>
        </template>
      </q-card>
    </q-dialog>

    <q-dialog v-model="printerOptions.show">
      <q-card>
        <q-card-section>
          <div class="text-h6">Configuracion de Impresora</div>
        </q-card-section>

        <q-separator></q-separator>

        <q-card-section>
          <q-select dense options-dense :options="printerOptions.printers" v-model="printerOptions.printer"></q-select>
        </q-card-section>

        <q-separator></q-separator>

        <q-card-actions align="right">
          <q-btn flat color="primary" label="aceptar" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- TODO: cannot calculate name width properly with class 'print-only' active. -->
    <div class="print-visible" :class="{ 'print-only': config.template !== 'membership' }">
      <component
        :is="printingTemplateName"
        v-for="(page, index) in pages"
        :key="index"
        :page="page"
      />
    </div>
  </div>
</template>

<script>
import DefaultPrintingTemplate from './template/Default'
import MembershipPrintingTemplate from './template/Membership'
import BraceletPrintingTemplate from './template/Bracelet'
import ReportPrintingTemplate from './template/Report'

export default {
  name: 'Printing',
  components: { MembershipPrintingTemplate, BraceletPrintingTemplate, DefaultPrintingTemplate, ReportPrintingTemplate },
  data () {
    return {
      printerOptions: {
        show: false,
        printers: [],
        printer: ''
      },
      config: {
        silent: false,
        template: 'default'
      },
      preview: {
        show: false,
        page: 1
      },
      pages: []
    }
  },
  computed: {
    isMultiPage () {
      return this.pages.length > 1
    },
    pageCount () {
      return this.pages.length
    },
    printingTemplateName () {
      return `${this.config.template.charAt(0).toUpperCase()}${this.config.template.slice(1)}PrintingTemplate`
    }
  },
  methods: {
    confirmCancel () {
      this.$q.dialog({
        title: 'Salir sin imprimir?',
        message: 'Confirmar que desea salir sin imprimir',
        cancel: true,
        ok: {
          color: 'negative'
        }
      }).onOk(() => {
        this.preview.show = false
      })
    },
    requestPrint (params) {
      // set configuration
      this.config.silent = params.silent ? params.silent : false
      this.config.template = params.template ? params.template : 'default'

      // set pages/data
      if (!params.pages) {
        throw new Error('Printing error: please supply the pages argument')
      }

      if (Array.isArray(params.pages)) {
        this.pages = params.pages
      } else {
        this.pages = [params.pages]
      }
      // reset pagination
      this.preview.page = 1

      // show preview or print
      if (params.preview) {
        this.preview.show = true
      } else {
        this.$nextTick(() => {
          this.print()
        })
      }
    },
    print () {
      if (this.$q.platform.is.electron) {
        const { remote } = require('electron')
        const contents = remote.getCurrentWebContents()
        contents.print({
          silent: this.config.silent,
          printBackground: true,
          deviceName: this.printerOptions.printer
        }, (success) => {
          if (this.preview.show) this.preview.show = false
          if (!success) {
            this.$q.notify({
              color: 'negative',
              icon: 'mdi-alert',
              message: 'Error de Impresion'
            })
          }
        })
      } else {
        window.print()
        if (this.preview.show) this.preview.show = false
      }
    }
  },
  created () {
    this.$root.$on('PRINT', this.requestPrint)
  },
  beforeDestroy () {
    this.$root.$off('PRINT', this.requestPrint)
  },
  mounted () {
    if (this.$q.platform.is.electron) {
      const { remote } = require('electron')
      const printers = remote.getCurrentWebContents().getPrinters().sort((a, b) => a.name.localeCompare(b.name))

      const defaultPrinter = printers.find(printer => printer.isDefault)
      this.printerOptions.printer = defaultPrinter ? defaultPrinter.name : ''
      this.printerOptions.printers = printers.map(({ name }) => name)
    }
  }
}
</script>

<style lang="stylus">
.print-visible
  visibility hidden

@media print
  // Hide other elements
  body > :not(#q-app),
  body > #q-app > :not(#print-area)
    display none

  // quasar sets body postion to fixed when modal open. override for printing
  body.q-body--prevent-scroll
    position relative !important

  .print-visible
    visibility visible
  // page breaks for multi page printing
  .print-as-page
    page-break-after always
    page-break-before always
    page-break-inside avoid

</style>
