<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center background">
        
        <q-card style="padding-right: 5%; padding-left: 5%; width: 40%; height: 275px;">

          <div style="margin-top: 50px;">
            <br/>
            <q-input v-model="user" label="Username"  style="padding-right: 10%; padding-left: 10%;"/>
            <q-input v-model="passwd" label="Password"  type="password" style="padding-right: 10%; padding-left: 10%;" />
            <br/>
            <q-btn label="login" style="float: right" color="primary" @click="login"/>
            <span v-if="status" style="color: red;">Login failed</span>
            <span v-if="missing" style="color: red;">Login info missing</span>
          </div>
          
          <q-banner rounded class="text-white banner">
            <div style="font-size: 18px">Electronic Health Record System</div>
          </q-banner>
        </q-card>
        <q-inner-loading :showing="loading">
          <q-spinner-hourglass size="50px" color="primary" />
        </q-inner-loading>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import md5 from 'js-md5'
export default {
  name: 'Login',
  data () {
    return {
      user: '',
      passwd: '',
      status: false,
      missing: false,
      loading: false
    }
  },
  methods: {
    async login () {
      this.loading = true
      this.status = false
      this.missing = false
      if (this.user.length === 0 || this.passwd.length === 0) {
        this.missing = true
        this.loading = false
        return
      }
      const res = await this.$axios.post('http://localhost:9000/login', {
        username: this.user,
        password: md5(this.passwd)
      })

      if (res.data.code === 0) {
        sessionStorage.setItem('user', this.user)
        sessionStorage.setItem('passwd', md5(this.passwd))
        sessionStorage.setItem('loggedin', true)
        sessionStorage.setItem('org', res.data.org)
        setTimeout(() => {
          this.$router.push('/cases')
        }, 1000); 
      } else {
        this.status = true
      }
      this.loading = false
    }
  }
}
</script>
<style lang="sass" scoped>
.background
  background-color: #DBF3FA
.banner
  background-color: #1976D2
  width: 75%
  height: 30%
  top: -10%
  position: absolute
  text-align: center
</style>
