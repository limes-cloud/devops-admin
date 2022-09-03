import request from '@/utils/request'

export function getEnvs(params) {
  return request({
    url: 'configure/environments',
    method: 'get',
    params
  })
}
 
export function addEnv(data) {
  return request({
    url: 'configure/environment',
    method: 'post',
    data
  })
}

export function updateEnv(data) {
  return request({
    url: 'configure/environment',
    method: 'put',
    data
  })
}

export function deleteEnv(data) {
  return request({
    url: 'configure/environment',
    method: 'delete',
    data
  })
}

export function ConnectEnv(data) {
  return request({
    url: 'configure/environment/connect',
    method: 'post',
    data
  })
}
