import request from '@/utils/request'

export function getTeams() {
  return request({
    url: '/ums/team/list',
    method: 'get'
  })
}

export function addTeam(data) {
  return request({
    url: '/ums/team/info',
    method: 'post',
    data
  })
}

export function updateTeam(data) {
  return request({
    url: '/ums/team/info',
    method: 'put',
    data
  })
}

export function deleteTeam(data) {
  return request({
    url: '/ums/team/info',
    method: 'delete',
    data
  })
}
