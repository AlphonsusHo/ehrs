const makeRoutes = (store) => {
  const routes = [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('pages/Login.vue')
    },
    {
      path: '/',
      component: () => import('layouts/MainLayout.vue'),
      children: [
        { 
          path: 'cases', 
          component: () => import('pages/Cases.vue'),
          beforeEnter: async (to, from, next) => {
            // console.log(sessionStorage.getItem('loggedin'))
            const loggedin = await sessionStorage.getItem('loggedin')
            // console.log(loggedin)
            // console.log(store.state.modules.loggedin)
            if(loggedin === 'false') {
              next({ name: 'login' })
            } else {
              next()
            }
          }
        },
        { 
          path: 'profile', 
          component: () => import('pages/Profile.vue'),
          beforeEnter: async (to, from, next) => {
            const loggedin = await sessionStorage.getItem('loggedin')
            // console.log(sessionStorage.getItem('loggedin'))
            // console.log(store.state.modules.loggedin)
            if(loggedin === 'false') {
              next({path: '/login'})
            } else {
              next()
            }
          }
        }
      ]
    },

    // Always leave this as last one,
    // but you can also remove it
    {
      path: '*',
      component: () => import('pages/Error404.vue')
    }
  ]
  return routes
}
export default makeRoutes
