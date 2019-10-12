<template>
  <q-page>
    <q-tabs align="justify">
      <q-route-tab to="/membership/cards">Tarjetas</q-route-tab>
      <q-route-tab to="/membership/contracts">Contratos</q-route-tab>
      <q-route-tab to="/membership/uses">Usos</q-route-tab>
    </q-tabs>
    <router-view></router-view>
 </q-page>
</template>

<script>
export default {
  name: 'Membership'
}
</script>
