import request from '@/utils/request'

export function getConfigureLogs(params) {
  return request({
    url: 'cms/configure_log/list',
    method: 'get',
    params
  })
}
