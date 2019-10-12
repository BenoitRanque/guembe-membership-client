
const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'users', component: () => import('pages/Users.vue') },
      {
        path: 'membership',
        component: () => import('pages/Membership.vue'),
        children: [
          { path: '', redirect: 'cards' },
          { path: 'contracts', component: () => import('pages/membership/Contracts.vue') },
          // { path: 'contract/:contractId', component: () => import('pages/membership/Contract.vue') },
          // { path: 'contract/:contractId/cards', component: () => import('pages/membership/Cards.vue') },
          // { path: 'contract/:contractId/uses', component: () => import('pages/membership/Uses.vue') },
          { path: 'cards', component: () => import('pages/membership/Cards.vue') },
          // { path: 'card/:cardId', component: () => import('pages/membership/Card.vue') },
          // { path: 'card/:cardId/uses', component: () => import('pages/membership/Uses.vue') },
          { path: 'uses', component: () => import('pages/membership/Uses.vue') }
        ]
      },
      {
        path: 'admittance',
        component: () => import('pages/admittance.vue'),
        children: [
          { path: '', redirect: 'bracelets' },
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
