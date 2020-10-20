<template>
    <q-dialog v-model="hist" persistent>
        <q-card style="height: 85%; width: 650px; max-width:1080px; overflow-x: hidden;">
            <q-list bordered class="rounded-borders" v-for="(his, i) in historyRecords" :key="i">
                <q-expansion-item
                    expand-separator
                    icon="mdi-clipboard-text"
                    label="Medical History"
                    :caption="his.time_created"
                    style="overflow-wrap: break-word"
                >
                    <q-card>
                        <q-card-section  class="row" style="overflow-wrap: break-word">
                            <div class="col-3"><b>Status:</b></div>
                            <q-space class="col-2" />
                            <div class="col-7">{{his.status}} </div>
                        </q-card-section>
                        <q-card-section  class="row" style="overflow-wrap: break-word">
                            <div class="col-3"><b>Diagnosis:</b></div>
                            <q-space class="col-2" />
                            <div class="col-7">{{his.diagnosis}} </div>
                        </q-card-section>
                        <q-card-section  class="row" style="overflow-wrap: break-word">
                            <div class="col-3"><b>Last Observation:</b></div>
                            <q-space class="col-2" />
                            <div class="col-4" v-if="his.observation">{{his.observation.name.value}} </div>
                            <div class="col-3" v-if="his.observation">{{his.observation.value.magnitude}} {{his.observation.value.units}}</div>
                        </q-card-section>
                        <q-card-section  class="row" style="overflow-wrap: break-word">
                            <div class="col-3"><b>Action taken:</b></div>
                            <q-space class="col-2" />
                            <div class="col-7" v-if="his.action">{{his.action}} </div>
                        </q-card-section>
                        
                    </q-card>
                </q-expansion-item>
            </q-list>
            <q-card-actions class="ok">
                <q-btn label="OK"  color="primary"  @click="okay"></q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script>
export default {
    props: [
        'hist',
        'record'
    ],
    data () {
        return {
            history: [],
            historyRecords: []
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
    async created () {
        const res = await this.$axios.post('http://localhost:9000/connect', {
            username: this.user,
            password: this.passwd
        })
        const result = await this.$axios.post('http://localhost:9000/history', {
            token: res.data.token,
            key: this.record.uid.value
        })
        this.history = result.data.data

        for (let i = 0; i < this.history.length; i++){
        // console.log(this.history[i])
            if (this.history[i].Record.organization.value !== this.org) {
                continue
            }
            let d = this.contructData(i)
            this.historyRecords.push(d)
        } 
        // console.log(this.historyRecords)
    },
    methods: {
        okay () {
            this.$emit('okay')
        },
        contructData (i) {
            let d = {}
            d.uid = this.history[i].Record.uid.value
            d.status = this.history[i].Record.versions.lifecycle_state.value
            d.time_created = this.history[i].Record.time_created.value

            let content = this.history[i].Record.versions.data.content
            for (let j = 0; j < content.length; j++){
                if (content[j].type === 'EVALUATION') {
                    d.diagnosis = content[j].data.items[0].value.value
                } else if (content[j].type === 'OBSERVATION') {
                    d.observation = content[j].data.events.data.items
                } else if (typeof(content[j].description)==='object') {
                    d.action = content[j].description.items.value.value
                }
            }
            // console.log(d)
            return d
        },
    }
}
</script>
<style lang="sass">
.ok
    float: right
    margin-right: 3%
</style>