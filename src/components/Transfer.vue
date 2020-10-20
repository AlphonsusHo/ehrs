<template>
    <q-dialog v-model="trans" >
        <q-card style="height: 47.5%; width: 650px; max-width:1080px; overflow-x: hidden;">
            <q-card-section  class="row" style="overflow-wrap: break-word">
                <b style="font-size: 24px;"><u>Case Details</u></b>
            </q-card-section>
           <q-card-section  class="row" style="overflow-wrap: break-word">
                <div class="col-3"><b>Case Number:</b></div>
                <q-space class="col-2" />
                <div class="col-7">{{record.uid.value}}</div>
            </q-card-section>
            <q-card-section  class="row" style="overflow-wrap: break-word">
                <div class="col-3"><b>Last Appointment Date:</b></div>
                <q-space class="col-2" />
                <div class="col-7">{{record.time_created.value.split("T")[0]}} </div>
            </q-card-section>
            <q-card-section  class="row" style="overflow-wrap: break-word">
                <div class="col-3"><b>Current Organization:</b></div>
                <q-space class="col-2" />
                <div class="col-7">{{record.organization.value}} </div>
            </q-card-section>
            <q-card-section class="row" style="overflow-wrap: break-word">
                <q-select class="col-7" v-model="selectedOrg" label="Transfer to?" :options="orgs"/>
            </q-card-section>
            <q-card-actions class="proceed">
                <q-btn label="cancel"  color="negative"  @click="cancelTransfer"></q-btn>
                <q-btn  :disable="inactive" label="transfer" color="primary"  @click="proceedTransfer"></q-btn>
            </q-card-actions>
        </q-card>
        
    </q-dialog>
</template>
<script>
export default {
    props:[ 
        'trans',
        'record'
    ],
    data () {
        return {
            orgs:[], 
            selectedOrg: '',
            inactive: true
        }
    },
    computed: {
        user () {
            return sessionStorage.getItem('user')
        }, 
        passwd () {
            return sessionStorage.getItem('passwd')
        },
        org () {
            return sessionStorage.getItem('org')
        }
    },
    watch: {
        selectedOrg (val) {
            if (this.selectedOrg === this.org) {
                this.inactive = true
                return
            } else {
                this.inactive = false
            }
        }
    },
    async created () {
        const res = await this.$axios.post('http://localhost:9000/connect', {
            username: this.user,
            password: this.passwd
        })
        const result = await this.$axios.post('http://localhost:9000/getOrgs', {
            token: res.data.token,
        })
        // this.orgs = result.data.data
        for (let i = 0; i < result.data.data.length; i++) {
            this.orgs.push(result.data.data[i].org)
        }
        // console.log(this.orgs)
        
    },
    methods: {
        cancelTransfer () {
            this.selectedOrg = ''
            this.$emit('cancelTransfer')
        },
        proceedTransfer () {
            this.$emit('proceedTransfer', this.selectedOrg)
        }
    }
}
</script>
<style lang="sass" scoped>

</style>