<template>
    <q-page class="casesBack">
        <followUp v-if="follow" :follow="follow" :record="record" :datum="datum" @followUpDialog="proceedFollowup" @cancelFollowUp="cancelFollowUp" />
        <history v-if="hist" :hist="hist" :record="record" @okay="closeHist" />
        <transferCase  v-if="trans" :trans="trans" :record="record" @proceedTransfer="proceedTransfer" @cancelTransfer="cancelTransfer"/>
        <newCase v-if="addCase" :addCase="addCase" @newCaseDialog="proceedNewCase" @cancelNewCase="cancelNewCase"/>
        <q-table
            title="Cases"
            :data="data"
            :columns="columns"
            row-key="uid"
            selection="single"
            :selected.sync="selected"
            :filter="filter"
            :pagination="pagination"
            :rows-per-page-options="options"
            grid
            hide-header
            class="table"
        >
            <template v-slot:top-right>
                <q-input dense debounce="300" v-model="filter" placeholder="Search by case number">
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
                </q-input>
            </template>

            <template v-slot:item="props">
                <div
                    class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
                    :style="props.selected ? 'transform: scale(0.95);' : ''"
                >
                <q-card :class="props.selected ? 'bg-grey-2' : ''">
                    <q-card-section>
                        <q-checkbox dense v-model="props.selected" >
                            <div style="width: 40%; text-overflow: ellipsis;white-space: nowrap;
    overflow: hidden;">{{props.row.uid}}</div>
                        </q-checkbox>
                    </q-card-section>
                    <q-separator />
                    <q-list >
                    <q-item v-for="col in props.cols.filter(col => col.name !== 'desc')" :key="col.uid">
                        <q-item-section>
                            <q-item-label>{{ col.label }}</q-item-label>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label caption style="overflow-wrap: break-word">{{ col.value }}</q-item-label>
                        </q-item-section>
                    </q-item>
                    </q-list>
                </q-card>
                </div>
            </template>
            
        </q-table>
        <div>
            <q-btn :disable="inactive" label="follow-up" color="primary"  class="buttons" @click="followup"/>
            <q-btn :disable="inactive" label="Transfer Case" color="warning" @click="transfer" class="buttons"/>
            <q-btn :disable="inactive" label="case History" color="accent" @click="history" class="buttons"/>
            <q-btn  label="New Case" color="secondary"  class="buttons" @click="add"/>
        </div>
        <q-inner-loading :showing="loading">
          <q-spinner-hourglass size="50px" color="primary" />
        </q-inner-loading>
    </q-page>
</template>

<script>
import followUp from '../components/Followup'
import history from '../components/History'
import transferCase from '../components/Transfer'
import newCase from '../components/NewCase'
export default {
    name: 'Cases',
    components: {
        followUp,
        history,
        transferCase,
        newCase
    },
    data () {
        return {
            inactive: true,
            follow: false,
            hist: false,
            trans: false,
            addCase: false,
            loading: true,
            bcData: [],
            pagination: {
                rowsPerPage: 6
                // rowsNumber: xx if getting data from a server
            },
            options: [3, 6, 9], 
            columns: [
                {
                    name: 'uid',
                    required: true,
                    label: 'Case Number',
                    align: 'left',
                    field: row => row.uid,
                    format: val => `${val}`,
                    sortable: true
                },
                {
                    name: 'date',
                    align: 'center',
                    label: 'Date',
                    field: 'date',
                    sortable: true
                },
                { name: 'diagnosis', label: 'Diagnosis', field: 'diagnosis', sortable: true },
                { name: 'status', label: 'Status', field: 'status', sortable: true },
                { name: 'action', label: 'Action taken', field: 'action', sortable: true }
            ],
            data: [],
            selected: [],
            datum: {},
            filter: '',
            record: {}
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
        selected (val) {
            if (val.length > 0) this.inactive = false
            else this.inactive = true
        },
        filter (input) {
            if (input === '') {
                this.init()
                return
            }
            this.data = []
            for (let i = 0; i < this.bcData.length; i++){
                if (this.bcData[i].Record.uid.value.includes(input)) {
                    this.data.push(this.contructData(i))
                }
            }
        }
    },
    async created () {
        // console.log(this.bcData)
        await this.init()
        this.loading = false
    },
    methods: {
        async init () {
            const res = await this.$axios.post('http://localhost:9000/connect', {
                username: this.user,
                password: this.passwd
            })
            const result = await this.$axios.post('http://localhost:9000/allAsset', {
                token: res.data.token
            })
            this.bcData = result.data.data
            // console.log(this.bcData)
            this.data = []
            for (let i = 0; i < this.bcData.length; i++){
                // console.log(this.bcData[i])
                if (this.bcData[i].Record.organization.value !== this.org) {
                    continue
                }
                let d = this.contructData(i)
                this.data.push(d)
            }

        },
        contructData (i) {
            let d = {}
            d.uid = this.bcData[i].Record.uid.value
            d.status = this.bcData[i].Record.versions.lifecycle_state.value
            d.date = this.bcData[i].Record.time_created.value.split('T')[0]

            let content = this.bcData[i].Record.versions.data.content
            for (let j = 0; j < content.length; j++){
                if (content[j].type === 'EVALUATION') {
                    d.diagnosis = content[j].data.items[0].value.value
                } /* else if (typeof(content[j].data) ==='object') {
                    if (typeof(content[j].data.items) === 'object') {
                        if (typeof(content[j].data.items[0].items) === 'object') {
                            d.date = content[j].data.items[0].items[0].value.value.split('TZ')[0]
                        }
                    } */
                else if (content[j].type === 'ACTION') {
                    d.action = content[j].description.items.value.value
                }
            }
            // console.log(d)
            return d
        },
        followup () {
            this.datum = this.selected[0]
            let i = this.data.indexOf(this.selected[0])
            // console.log(this.bcData[i])
            this.record = this.bcData[i].Record
            this.follow = true
        },
        async proceedFollowup (newRecord) {
            this.loading = true
            this.follow = false
            const res = await this.$axios.post('http://localhost:9000/connect', {
                username: this.user,
                password: this.passwd
            })
            const result = await this.$axios.post('http://localhost:9000/insert', {
                token: res.data.token,
                key: newRecord.uid.value,
                data: newRecord
            })
            await this.init()
            this.selected = []
            this.loading = false
            
        },
        cancelFollowUp () {
            this.follow = false
        },
        history () {
            let i = this.data.indexOf(this.selected[0])
            // console.log(this.bcData[i])
            this.record = this.bcData[i].Record
            this.hist = true
        },
        closeHist () {
            this.hist = false
        },
        transfer () {
            this.datum = this.selected[0]
            let i = this.data.indexOf(this.selected[0])
            // console.log(this.bcData[i])
            this.record = this.bcData[i].Record
            this.trans=true
        },
        async proceedTransfer (newOwner) {
            // console.log(newOwner)
            //console.log(this.selected[0].uid)
            // console.log(this.record)
            this.trans = false
            this.loading = true
            const res = await this.$axios.post('http://localhost:9000/connect', {
                username: this.user,
                password: this.passwd
            })
            const result = await this.$axios.post('http://localhost:9000/transfer', {
                token: res.data.token,
                key: this.selected[0].uid,
                newOwner: newOwner
            })
            await this.init()
            this.selected = []
            this.loading = false
        },   
        cancelTransfer () {
            this.trans = false
        },
        add () {
            this.addCase = true
        },
        async proceedNewCase (newRecord) {
            this.addCase = false
            this.loading = true
            console.log(newRecord)
            const res = await this.$axios.post('http://localhost:9000/connect', {
                username: this.user,
                password: this.passwd
            })
            const result = await this.$axios.post('http://localhost:9000/insert', {
                token: res.data.token,
                data: newRecord
            })
            await this.init()
            this.selected = []
            this.loading = false
        },
        cancelNewCase () {
            this.addCase = false
        }
    }
}
</script>
<style lang="sass" scoped>
.casesBack
    background-color: #DBF3FA
    height: 100%
    padding-bottom: 5%
    max-width: 100%
    overflow: hidden
.table
    padding-left: 1%
    padding-right: 1%
.buttons
    float: right
    margin-right: 1.5%

</style>
