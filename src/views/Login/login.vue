<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.push('/login')
})
</script>

<template>
  <div class="login-container"></div>
</template>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  background: url('../../assets/LoginBackground.png') no-repeat center center fixed;
  background-size: cover;
}
</style>
