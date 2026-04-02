<!-- App.vue - 应用的根组件 -->

<!-- 脚本部分 - 使用 Vue 3 的组合式 API -->
<script setup>
// 这里可以添加全局的组合式 API 代码
</script>

<!-- 模板部分 - 应用的根模板 -->
<template>
  <!-- 路由视图 - 显示当前路由对应的组件 -->
  <router-view />
</template>

<!-- 样式部分 - 全局样式定义 -->
<style>
/* 全局重置样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 全局 body 样式 */
body {
  font-family: Arial, sans-serif;
  font-size: 20px ;
  line-height: 1.5;
  color: #333;
  background: #f5f7fa;
}

/* 自定义必填提示样式 - 星号显示在左侧 */
.el-form .el-form-item.is-required .el-form-item__label::before {
  content: '*' !important; /* 使用星号作为必填标识 */
  color: #F56C6C !important; /* 星号颜色 - Element Plus 的错误红色 */
  margin-right: 4px !important; /* 星号与文字的间距 */
  display: inline-block !important; /* 确保星号能够正确定位 */
}

/* 隐藏默认的必填星号 */
.el-form .el-form-item.is-required .el-form-item__label::after {
  content: '' !important; /* 清空默认内容 */
  display: none !important; /* 隐藏默认的星号 */
}
</style>
 <!--你好，github提交测试！！！-->