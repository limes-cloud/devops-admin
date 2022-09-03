import request from '@/utils/request'

export function GetNotice(params) {
  return request({
    url: '/notice/notice/page',
    method: 'get',
    params
  })
}

export function AddNotice(data) {
  return request({
    url: '/notice/notice',
    method: 'post',
    data
  })
}

export function UpdateNotice(data) {
  return request({
    url: '/notice/notice',
    method: 'put',
    data
  })
}

export function DeleteNotice(data) {
  return request({
    url: '/notice/notice',
    method: 'delete',
    data
  })
}
