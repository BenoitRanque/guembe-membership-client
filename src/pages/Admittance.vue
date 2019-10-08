<template>
  <q-page>
    <q-tabs align="justify">
      <q-route-tab to="/admittance/bracelets">Manillas</q-route-tab>
      <q-route-tab to="/admittance/series">Series</q-route-tab>
    </q-tabs>
    <router-view></router-view>
  </q-page>
</template>

<script>
export default {
  name: 'Admittance'
}
</script>
