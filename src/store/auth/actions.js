import gql from 'src/gql'
import { date } from 'quasar'
const { subtractFromDate } = date

function getRefreshDelay (token) {
  const body = token.split('.')[1]

  const payload = JSON.parse(atob(body))

  return (subtractFromDate(new Date(payload.exp * 1000), { minutes: 3 }).getTime() - new Date().getTime())
}
export async function LOGIN ({ commit, dispatch }, { username, password }) {
  const query = /* GraphQL */`
    query ($username: String! $password: String!) {
      auth: session_login (username: $username password: $password) {
        token
        session {
          user_id
          username
          name
          roles
        }
      }
    }
  `
  const variables = {
    username,
    password
  }

  const { auth } = await gql({ query, variables })

  commit('AUTH', auth)
  dispatch('SCHEDULE_REFRESH')
}

export async function REFRESH_TOKEN ({ commit, dispatch }) {
  const query = /* GraphQL */`
    query {
      auth: session_refresh {
        token
        session {
          user_id
          username
          name
          roles
        }
      }
    }
  `

  const { auth } = await gql({ query })

  commit('AUTH', auth)

  dispatch('SCHEDULE_REFRESH')
}

export async function SCHEDULE_REFRESH ({ commit, dispatch, state }) {
  const delay = getRefreshDelay(state.token)

  const task = setTimeout(async () => {
    try {
      await dispatch('REFRESH_TOKEN')
    } catch (error) {
      gql.handleError(error)
    }
  }, delay)

  commit('REFRESH_TOKEN_TASK', task)
}

export async function LOGOUT ({ commit, state }) {
  const query = /* GraphQL */`
    query {
      session_logout
    }
  `
  try {
    await gql({ query })
  } catch (error) {
    throw error
  } finally {
    commit('AUTH')

    clearTimeout(state.refreshTokenTask)
    commit('REFRESH_TOKEN_TASK')
  }
}
