<template>
  <div id="app">
    <router-view />
  </div>
</template>
<style>
  .pointer{
    cursor: pointer;
  }
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
  .el-input-number {
  	width: 100%;
  }
  .el-select{
  	width: 100%;
  }
  .el-cascader{
    width: 100%;
    min-width: 100%;
  }
  .el-loading-mask{
    z-index: 9999 !important;
  }
  .jsoneditor{
    border:none !important;
  }
  .jsoneditor-contextmenu ul{
    background-color: white !important;
    border-radius: 4px;
    border:none !important;
    overflow: hidden;
  }
  .jsoneditor-selected{
    background-color: #1890ff !important;
    color:#fff;
  }
  .jsoneditor-menu{
    background-color:#1890ff !important;
  }

</style>
<script>
export default {
  name: 'App'
}
</script>
