import request from '@/utils/request'

export function getTemplate(params) {
  return request({
    url: 'configure/template',
    method: 'get',
    params
  })
}

export function getTemplates(params) {
  return request({
    url: 'configure/templates',
    method: 'get',
    params
  })
}

export function getParseTemplate(params) {
  return request({
    url: 'configure/template/parse',
    method: 'get',
    params
  })
}

export function addTemplate(data) {
  return request({
    url: 'configure/template',
    method: 'post',
    data
  })
}

export function updateTemplate(data) {
  return request({
    url: 'configure/template',
    method: 'put',
    data
  })
}

export function compareConfig(data) {
  return request({
    url: 'configure/config/compare',
    method: 'post',
    data
  })
}

export function syncConfig(data) {
  return request({
    url: 'configure/config/sync',
    method: 'post',
    data
  })
}

export function getConfigs(params) {
  return request({
    url: 'configure/config/logs',
    method: 'get',
    params
  })
}

export function getConfig(params) {
  return request({
    url: 'configure/config/log',
    method: 'get',
    params
  })
}

export function rollbackConfig(data) {
  return request({
    url: 'configure/config/rollback',
    method: 'post',
    data
  })
}

export function driverConfig(params) {
  return request({
    url: 'configure/config/driver',
    method: 'get',
    params
  })
}

export function renderConfig(params) {
  return request({
    url: 'configure/template/parse',
    method: 'get',
    params
  })
}
