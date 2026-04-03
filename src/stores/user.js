import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    roleType: '',
    userInfo: null
  }),
  actions: {
    setUserInfo(token, roleType, userInfo = null) {
      this.token = token
      this.roleType = roleType
      this.userInfo = userInfo
    },
    clearUserInfo() {
      this.token = ''
      this.roleType = ''
      this.userInfo = null
    },
    logout() {
      this.clearUserInfo()
    }
  },
  persist: {
    key: 'user',
    storage: localStorage,
    paths: ['token', 'roleType', 'userInfo']
  }
})