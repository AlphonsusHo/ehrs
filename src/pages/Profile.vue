<template>
    <q-page class="profileBack">
        <q-card style="margin-left: 30%; margin-right: 30%; width: 40%; height: 400px">
            <q-card-section>
                <h4>User Profile</h4>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <h6>Username: {{ user }} </h6>
              <h6>Organization: {{ organization }} </h6>
            </q-card-section>
        </q-card>
    </q-page>
</template>
<script>
export default {
    computed: {
        user () {
            return sessionStorage.getItem('user')
        },
        organization () {
            return sessionStorage.getItem('org')
        }
    }
}
</script>
<style lang="sass">
.profileBack
    background-color: #DBF3FA
    height: 100%
    padding-top: 5%
    padding-bottom: 5%
    max-width: 100%
    overflow: hidden
</style>