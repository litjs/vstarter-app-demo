<template>
    <div>{{ps.message}}</div>
</template>
<script>
    export default {
        computed: {
            ...Vuex.mapState({
                ps: state => state.index
            })
        }
    }
</script>