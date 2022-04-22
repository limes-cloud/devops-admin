var COS = require('cos-js-sdk-v5')
import store from '@/store'
import {
	MessageBox,
	Message
} from 'element-ui'
import {
	getToken
} from '@/utils/auth'
const host = process.env.VUE_APP_BASE_API
var config = {
	Bucket: 'lime-1257272319',
	Region: 'ap-chongqing'
}
async function getCosToken(type) {
	return new Promise(function(resolve, reject) {
		var url = host + '/api/auth/cos?type=' + type // 如果是 npm run sts.js 起的 nodejs server，使用这个
		var xhr = new XMLHttpRequest()
		xhr.open('GET', url, true)
		xhr.setRequestHeader('Token', getToken())
    xhr.setRequestHeader('Company', store.getters.product)
		xhr.onload = function(e) {
			if (xhr.status === 200) {
				resolve(JSON.parse(e.target.responseText).data)
			} else {
				reject(new Error('初始化失败'))
			}
		}
		xhr.send()
	})
}

function putObject(file, type, filename, backfun, resback) {
	getCosToken(type).then(function(data) {
		var credentials = data.Credentials
		var cos = new COS({
			getAuthorization: function(options, callback) {
				callback({
					TmpSecretId: credentials.TmpSecretId,
					TmpSecretKey: credentials.TmpSecretKey,
					XCosSecurityToken: credentials.Token,
					StartTime: data.StartTime,
					ExpiredTime: data.ExpiredTime
				})
			}
		})
		const key = type + '/' + filename
		cos.putObject({
			Bucket: config.Bucket, // Bucket 格式：test-1250000000
			Region: config.Region,
			Key: key,
			/* 必须 */
			Body: file,
			onTaskReady: function(tid) {
				console.log('准备上传')
			},
			onTaskStart: function(info) {
				console.log('开始上传')
			},
			onProgress: function(progressData) {
				backfun(progressData)
			}
		}, function(err, data) {
			if (err != null) {
				Message.error('上传失败:' + err.error)
			} else {
				data.Location = key
				resback(data)
			}
		})
	})
}

export function upload(file, key, type, speedback, resback) {
	console.log('file',file);
	putObject(file, key, type, speedback, resback)
}

export function generateName(name) {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	let names = name.split('.')
	names = names[names.length-1]
	return uuid+"."+names;
}
