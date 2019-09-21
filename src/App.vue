<template>
  <div id="q-app">
    <router-view />
    <printing />
  </div>
</template>

<script>
import printing from 'components/printing'
export default {
  name: 'App',
  components: { printing }
}
</script>
