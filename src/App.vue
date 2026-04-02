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

/* 全局字体大小调整 */
:root {
  --base-font-size: 18px;
}

/* 全局 body 样式 */
body {
  font-family: Arial, sans-serif;
  font-size: var(--base-font-size);
  line-height: 1.5;
  color: #333;
  background: #f5f7fa;
}

/* 直接覆盖 Element Plus 组件的字体大小，使用 !important 提高优先级 */

/* 输入框 */
.el-input__inner {
  font-size: var(--base-font-size) !important;
}

/* 选择器 */
.el-select {
  font-size: var(--base-font-size) !important;
}

.el-select-dropdown__item {
  font-size: var(--base-font-size) !important;
}

/* 按钮 */
.el-button {
  font-size: var(--base-font-size) !important;
}

/* 表格 */
.el-table {
  font-size: var(--base-font-size) !important;
}

/* 表单 */
.el-form {
  font-size: var(--base-font-size) !important;
}

.el-form-item__label {
  font-size: var(--base-font-size) !important;
}

/* 卡片 */
.el-card {
  font-size: var(--base-font-size) !important;
}

/* 对话框 */
.el-dialog {
  font-size: var(--base-font-size) !important;
}

/* 分页 */
.el-pagination {
  font-size: var(--base-font-size) !important;
}

/* 标签 */
.el-tag {
  font-size: var(--base-font-size) !important;
}

/* 描述列表 */
.el-descriptions {
  font-size: var(--base-font-size) !important;
}

.el-descriptions-item {
  font-size: var(--base-font-size) !important;
}

/* 警告 */
.el-alert {
  font-size: var(--base-font-size) !important;
}

/* 调整标题字体大小 */
h1, h2, h3, h4, h5, h6 {
  font-size: larger;
}

/* 调整表单提示文字大小 */
.form-tip {
  font-size: calc(var(--base-font-size) * 0.8) !important;
}

/* 调整组件内边距，避免空白过度膨胀 */
.el-input__inner {
  padding: 8px 15px !important;
}

.el-button {
  padding: 8px 16px !important;
}

.el-select .el-input__inner {
  padding: 8px 30px 8px 15px !important;
}

/* 调整下拉选择框的字体大小 */
.el-select-dropdown {
  font-size: var(--base-font-size) !important;
}

.el-select-dropdown__item {
  padding: 10px 20px !important;
  font-size: var(--base-font-size) !important;
}

/* 调整下拉选择框的placeholder文本大小 */
.el-select .el-input__placeholder {
  font-size: var(--base-font-size) !important;
}

/* 调整登录页面的下拉选择框 */
.el-cascader-menu {
  font-size: var(--base-font-size) !important;
}

/* 调整输入框的placeholder文本大小 */
.el-input__placeholder {
  font-size: var(--base-font-size) !important;
}

.el-form-item {
  margin-bottom: 16px !important;
}

.el-card {
  padding: 20px !important;
}

.el-dialog__body {
  padding: 20px !important;
}

.el-pagination {
  padding: 20px 0 !important;
}

/* 确保下拉选择器能够正确显示 */
.el-select {
  min-width: 200px;
}

.el-select .el-input {
  width: 100%;
}

.el-select-dropdown {
  z-index: 9999 !important;
  min-width: 200px;
}

/* 确保下拉选择器的选项能够正确显示 */
.el-select-dropdown__item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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