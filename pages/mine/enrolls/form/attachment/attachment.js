import { $wuxActionSheet } from '../../../../../components/wux'
import { $wuxToptips } from '../../../../../components/wux'
import WxValidate from '../../../../../assets/plugins/WxValidate'
const qiniuUploader = require("../../../../../utils/qiniuUploader.js");

const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        formData: {
            sex: '',
            nation: '',
            photoURL: '',
            district: ''
        },
        isPreview: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.eid = options.eid
        this.setData({
            isPreview: options.prev === 'true'
        })
        if (app.globalData.token) {
            this._initData(options.eid)
        } else {
            app.getToken()
                .then(() => {
                    this._initData(options.eid)
                }, function (err) {
                    this._showToptips(err.toString())
                })
        }
    },
    addAttachment() {
        if (this.data.isPreview) {
            return
        }
        if (this.qiNiuToken) {
            this._uploadAttachment()
        } else {
            this._getUploadToken(this._uploadAttachment)
        }
    },
    _getUploadToken(callback) {
        wx.request({
            url: app.api.getUploadToken,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {},
            success: res => {
                if (res.data.uptoken) {
                    this.qiNiuToken = res.data.uptoken
                    typeof callback === 'function' && callback()
                } else {
                    this._showToptips('出错了，重试一下吧')
                }
            },
            fail: error => {
                this._showToptips('出错了，重试一下吧')
            }
        })
    },
    _uploadAttachment() {
        var that = this;
        // 选择图片
        wx.chooseImage({
            count: 1,
            success: function (res) {
                console.log(res)
                var filePath = res.tempFilePaths[0];
                // 交给七牛上传
                qiniuUploader
                    .upload(filePath, (uploadRes) => {
                        console.log(uploadRes)
                    }, (error) => {
                        that._showToptips('上传图片失败，请重试')
                    }, {
                        uploadURL: 'https://up-z2.qbox.me',
                        region: 'SCN',
                        domain: 'sagacity.bkt.clouddn.com',
                        uptoken: that.qiNiuToken
                    }, (res) => {
                        console.log('上传进度', res.progress)
                        console.log('已经上传的数据长度', res.totalBytesSent)
                        console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
                    });
            }
        })
    },
    _updateEnroll(formData) {
        var that = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        wx.request({
            url: app.baseUrl + 'activity/UpdateEnrollInfo',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                enrollID: this.eid,
                token: app.globalData.token,
                formData: JSON.stringify(formData)
            },
            success: res => {
                wx.hideLoading()
                if (res.data.result) {
                    $wuxToptips.success({
                        hidden: !0,
                        text: '提交成功',
                    })
                    wx.redirectTo({
                        url: '/pages/result/result?type=success',
                    })
                } else {
                    this._showToptips('出错了，重试一下吧')
                }
            },
            fail: error => {
                wx.hideLoading()
                this._showToptips('出错了，重试一下吧')
            }
        })
    },
    validators: {},
    validationMsgs: {},
    _initValidate() {
        this.WxValidate = new WxValidate(this.validators, this.validationMsgs)
    },
    _showToptips(error) {
        const hideToptips = $wuxToptips.show({
            timer: 3000,
            text: error.msg || '请填写正确的字段',
            hidden: true,
            success: () => { }
        })
    },
    uploadPic: function () {
        var that = this;
        if (this.data.isPreview) {
            return
        }
        // 选择图片
        wx.chooseImage({
            count: 1,
            success: function (res) {
                var filePath = res.tempFilePaths[0];
                wx.uploadFile({
                    url: app.api.uploadPhoto,
                    filePath: filePath,
                    name: 'photoFile',
                    formData: {
                        'token': app.globalData.token
                    },
                    success: function (res) {
                        var data = JSON.parse(res.data)
                        if (data.result) {
                            that.setData({
                                'formData.photoURL': app.resourseUrl + data.photoURL
                            })
                        } else {
                            that._showToptips(data.msg)
                        }
                    }
                })
            }
        })
    },
    _initData() {
        var that = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        wx.request({
            url: app.api.getAttachList,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: app.globalData.token,
                enrollID: this.eid
            },
            success: res => {
                this.setData({
                    attachments: res.data.list,
                    attachmentOpCount: res.data.opCount,
                })
            },
            fail: error => {
                this._showToptips('出错了，重试一下吧')
            },
            complete() {
                wx.hideLoading()
            }
        })
    }
})