<template>
  <q-markup-table flat>
    <thead>
      <tr>
        <th :colspan="page.columns.length">
          <div class="text-h6">
            {{page.title}}
          </div>
        </th>
      </tr>
      <tr>
        <th v-for="(column, columnIndex) in page.columns" :key="`header_column_${columnIndex}`" class="text-left">{{column}}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in page.rows" :key="`row_${rowIndex}`">
        <td v-for="(column, columnIndex) in row" :key="`row_${rowIndex}_column_${columnIndex}`" class="text-left">
          {{column}}
        </td>
      </tr>
    </tbody>
  </q-markup-table>
</template>

<script>
export default {
  name: 'ReportPrintingTemplate',
  props: ['page']
}
</script>
