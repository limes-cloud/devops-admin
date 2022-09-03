import request from '@/utils/request'

export function getTeams() {
  return request({
    url: '/ums/team',
    method: 'get'
  })
}

export function addTeam(data) {
  return request({
    url: '/ums/team',
    method: 'post',
    data
  })
}

export function updateTeam(data) {
  return request({
    url: '/ums/team',
    method: 'put',
    data
  })
}

export function deleteTeam(data) {
  return request({
    url: '/ums/team',
    method: 'delete',
    data
  })
}
