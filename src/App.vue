<template>
  <div id="app">
    <router-view />
  </div>
</template>
<style>
  .page-block{
    margin-top: 20px;
  }
  .jsoneditor-vue{
    height: 100%;
  }
  .el-autocomplete{
    width: 100%;
  }
  .header-nav{
    margin-bottom: 15px;
  }
</style>
<script>
export default {
  name: 'App'
}
</script>
