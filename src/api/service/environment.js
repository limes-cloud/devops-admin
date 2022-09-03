import request from '@/utils/request'

export function getEnvs(params) {
  return request({
    url: 'service/environments',
    method: 'get',
    params
  })
}

export function getFilterEnvs(params) {
  return request({
    url: 'service/environment/filter',
    method: 'get',
    params
  })
}

export function addEnv(data) {
  return request({
    url: 'service/environment',
    method: 'post',
    data
  })
}

export function updateEnv(data) {
  return request({
    url: 'service/environment',
    method: 'put',
    data
  })
}

export function deleteEnv(data) {
  return request({
    url: 'service/environment',
    method: 'delete',
    data
  })
}

export function ConnectEnv(data) {
  return request({
    url: 'service/environment/connect',
    method: 'post',
    data
  })
}
