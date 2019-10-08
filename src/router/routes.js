
const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'users', component: () => import('pages/Users.vue') },
      { path: 'membership', component: () => import('pages/Membership.vue') },
      {
        path: 'admittance',
        component: () => import('pages/admittance.vue'),
        children: [
          { path: 'bracelets', component: () => import('pages/admittance/Bracelets.vue') },
          { path: 'series', component: () => import('pages/admittance/Series.vue') }
        ]
      }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
