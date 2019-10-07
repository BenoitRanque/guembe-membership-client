export function isAuthenticated (state) {
  return state.session !== null
}

export function userId (state, { isAuthenticated }) {
  if (!isAuthenticated) {
    return null
  }
  return state.session.user_id
}

export function username (state, { isAuthenticated }) {
  if (!isAuthenticated) {
    return null
  }
  return state.session.username
}

export function name (state, { isAuthenticated }) {
  if (!isAuthenticated) {
    return null
  }
  return state.session.name
}

export function isAuthorized (state, { isAuthenticated }) {
  return roles => {
    if (!isAuthenticated) {
      return false
    }

    if (Array.isArray(roles)) {
      return state.session.roles.some(role => roles.includes(role))
    } else {
      return state.session.roles.includes(roles)
    }
  }
}
