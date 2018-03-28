<template>
  <div>
    <img :src="png" alt="">
    <div>{{ps.message}}</div>
    <div>{{$root.config.name}}</div>
    <div>{{$t('index.title')}}</div>
  </div>
</template>
<script>
  export default {
    data: function () {
      return {
        png: require('statics/images/logo.png')
      }
    },

    computed: {
      ...Vuex.mapState({
        ps: state => state.index
      })
    },

    mounted(){
      console.log(this.$t('index.title'))
    },
  }
</script>
