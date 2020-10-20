<template>
    <q-dialog v-model="addCase" persistent>
        <q-card style="height: 85%; width: 650px; max-width:1080px; overflow-x: hidden;">
            <q-card-section  class="row" style="overflow-wrap: break-word">
                <b style="font-size: 24px;"><u>New Case</u></b>
                <div class="col-2"></div>
                <q-btn class="col-3" style="float: right;  margin-right: 2%" color="secondary" @click="addAction">Add Action</q-btn>
                <q-btn class="col-3" style="float: right;" color="primary" @click="addObservation">Add Observation</q-btn>
            </q-card-section>
            <q-card-section  class="row" style="overflow-wrap: break-word">
                <div class="col-3"><b>Date:</b></div>
                <div class="col-7">{{ now }} </div>
            </q-card-section>
            <q-card-section  class="row" style="overflow-wrap: break-word">
                <div class="col-3"><b>Diagnosis:</b></div>
                <div class="col-9">
                    <q-input outlined label="First Diagnosis" v-model="diagnosisOne"/>
                </div>
            </q-card-section>
            <q-card-section  class="row" style="overflow-wrap: break-word">
                <div class="col-3"><b>Secondary Diagnosis:</b></div>
                <div class="col-9">
                    <q-input outlined label="Extra Diagnosis" v-model="diagnosisTwo"/>
                </div>
            </q-card-section>
            <q-card-section  class="row" style="overflow-wrap: break-word">
                <div class="col-3"><b>Associated Cause:</b></div>
                <div class="col-9">
                    <q-input outlined label="Possible cause of problem" v-model="cause"/>
                </div>
            </q-card-section>
            <q-card-section >
                <div class="row" v-for="(observation, idx) in observations" :key="idx" style="margin-bottom: 1%;">
                    <div class="col-3"><b>Observation</b></div>
                    <q-select outlined class="col-2" :options="observationTypes" label="Type" v-model="observation.data.events.data.items.name.value"/>
                    <q-input outlined class="col-4" label="Observation" v-model="observation.data.events.data.items.value.magnitude"/>
                    <q-input outlined class="col-2" label="units" v-model="observation.data.events.data.items.value.units"/>
                    <q-btn class="col-1" flat icon="cancel" color="grey" @click="removeObservation(idx)"/>
                </div>
            </q-card-section>
            <q-card-section >
                <div class="row" v-for="(action, idx) in actions" :key="idx" style="margin-bottom: 1%;">
                    <div class="col-3"><b>Action</b></div>
                    <q-input outlined class="col-8" label="Action" v-model="action.description.items.value.value"/>
                    <q-btn class="col-1" flat icon="cancel" color="grey" @click="removeAction(idx)"/>        
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
const evaluation = require('../static/evaluation.json')
const record = require('../static/ehrStruct.json')
export default {
    props:[ 
        'addCase'
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
            observations: [],
            now: '',
            diagnosisOne: '',
            diagnosisTwo: '',
            cause: ''
        }
    },
    computed: {
        org () {
            return sessionStorage.getItem('org')
        }
    },
    created () {
        this.now = new Date().toISOString().split('T')[0]
    },
    methods: {
        async proceed () {
            // this.laoding = true
            let newRecord = JSON.parse(JSON.stringify(record))
            let newEval = JSON.parse(JSON.stringify(evaluation))

            newEval.data.items[0].value.value = this.diagnosisOne
            newEval.data.items[1].value.value = this.diagnosisTwo
            newEval.data.items[2].value.value = this.cause
            newRecord.versions.data.content.push(newEval)
            newRecord.organization.value = this.org

            const date = new Date().toISOString()
            // console.log(date)
            newRecord.versions.lifecycle_state.value = 'New Case'
            newRecord.time_created.value = date
            newRecord.versions.commit_audit.time_committed.value = date

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
            this.$emit('newCaseDialog', newRecord)
        },
        cancel () {
            this.actions = []
            this.observations = []
            this.newStatus = ''
            this.$emit('cancelNewCase')
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