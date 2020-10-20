<template>
    <q-dialog v-model="follow" persistent>
        <q-card style="height: 85%; width: 650px; max-width:1080px; overflow-x: hidden;">
            <q-card-section  class="row" style="overflow-wrap: break-word">
                <b style="font-size: 24px;"><u>Case Details</u></b>
            </q-card-section>
            <q-card-section  class="row" style="overflow-wrap: break-word">
                <div class="col-3"><b>Case Number:</b></div>
                <q-space class="col-2" />
                <div class="col-7">{{datum.uid}}</div>
            </q-card-section>
            <q-card-section  class="row" style="overflow-wrap: break-word">
                <div class="col-3"><b>Date:</b></div>
                <q-space class="col-2" />
                <div class="col-7">{{datum.date}} </div>
            </q-card-section>
            <q-card-section  class="row" style="overflow-wrap: break-word">
                <div class="col-3"><b>Diagnosis:</b></div>
                <q-space class="col-2" />
                <div class="col-7">{{datum.diagnosis}} </div>
            </q-card-section>
            <q-card-section  class="row" style="overflow-wrap: break-word">
                <div class="col-3"><b>Action taken:</b></div>
                <q-space class="col-2" />
                <div class="col-7">{{datum.action}} </div>
            </q-card-section>
            <q-separator/>
            <q-card-section  class="row" style="overflow-wrap: break-word">
                <b class="col-3" style="font-size: 24px;"><u>Follow-up</u></b>
                <div class="col-2"></div>
                <q-btn class="col-3" style="float: right;  margin-right: 2%" color="secondary" @click="addAction">Add Follow-up Action</q-btn>
                <q-btn class="col-3" style="float: right;" color="primary" @click="addObservation">Add New Observation</q-btn>
            </q-card-section>
            <q-card-section >
                <div class="row" v-for="(observation, idx) in observations" :key="idx" style="margin-bottom: 1%;">
                    <div class="col-3"><b>New Observation</b></div>
                    <q-select outlined class="col-2" :options="observationTypes" label="Type" v-model="observation.data.events.data.items.name.value"/>
                    <q-input outlined class="col-4" label="Observation" v-model="observation.data.events.data.items.value.magnitude"/>
                    <q-input outlined class="col-2" label="units" v-model="observation.data.events.data.items.value.units"/>
                    <q-btn class="col-1" flat icon="cancel" color="grey" @click="removeObservation(idx)"/>
                </div>
            </q-card-section>
            <q-card-section >
                <div class="row" v-for="(action, idx) in actions" :key="idx" style="margin-bottom: 1%;">
                    <div class="col-3"><b>New Follw-up Action</b></div>
                    <q-input outlined class="col-8" label="Follow-up action" v-model="action.description.items.value.value"/>
                    <q-btn class="col-1" flat icon="cancel" color="grey" @click="removeAction(idx)"/>        
                </div>
            </q-card-section>
             <q-card-section  class="row" style="overflow-wrap: break-word">
                <div class="col-3"><b>New Status:</b></div>
                <div class="col-7" >
                    <q-radio v-model="newStatus" val="followup" label="Follow-up Required" />
                    <br/>
                    <q-radio v-model="newStatus" val="complete" label="Discharge" />
                </div>
            </q-card-section>
            <q-card-actions class="proceed">
                <q-btn label="cancel"  color="negative"  @click="cancel"></q-btn>
                <q-btn label="proceed"  color="primary"  @click="proceed"></q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script>
const action = require('../static/action.json')
const observation = require('../static/observation.json')
export default {
    name: 'followup',
    props: [
        'follow', 
        'record', 
        'datum'
    ],
    data () {
        return {
            observationTypes: [
                'Weight',
                'Height',
                'Blood Pressure'
            ],
            newStatus: '',
            actions: [], 
            observations: []
        }
    },
    computed: {
        user () {
            return sessionStorage.getItem('user')
        }, 
        passwd () {
            return sessionStorage.getItem('passwd')
        }
    },
    created () {
        // this.newRecord = JSON.parse(JSON.stringify(this.record))
        // console.log(this.record)
    },
    methods: {
        async proceed () {
            // this.laoding = true
            let newRecord = JSON.parse(JSON.stringify(this.record))
            const date = new Date().toISOString()
            // console.log(date)
            newRecord.versions.lifecycle_state.value = this.newStatus
            newRecord.time_created.value = date
            for (let i = 0; i< this.actions.length; i++) {
                this.actions[i].time.value = date
                this.actions[i].ism_transition.current_state.value = this.newStatus
                newRecord.versions.data.content.push(this.actions[i])
            }
            for (let j = 0; j< this.observations.length; j++) {
                this.observations[j].data.origin.value = date
                newRecord.versions.data.content.push(this.observations[j])
            }
            // console.log(newRecord)
            this.$emit('followUpDialog', newRecord)
        },
        cancel () {
            this.actions = []
            this.observations = []
            this.newStatus = ''
            this.$emit('cancelFollowUp')
        },
        addAction () {
            // console.log(action)
            let a = JSON.parse(JSON.stringify(action))
            this.actions.push(a)
        },
        removeAction (i) {
            this.actions.splice(i, 1)
        }, 
        addObservation () {
            let ob = JSON.parse(JSON.stringify(observation))
            this.observations.push(ob)
        },
         removeObservation (i) {
            this.observations.splice(i, 1)
        }
    }
}
</script>
<style lang="sass">
.proceed
    float: right
    margin-right: 3%
</style>