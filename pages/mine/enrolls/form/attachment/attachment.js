import { $wuxActionSheet } from '../../../../../components/wux'
import { $wuxToptips } from '../../../../../components/wux'
import WxValidate from '../../../../../assets/plugins/WxValidate'
import { formatTime } from '../../../../../utils/util.js'
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
        // 校验上传次数
        if (this.opCount >= 10) {
            wx.showModal({
                title: '添加失败',
                content: '上传附件次数已超过限制',
                showCancel: false
            })
            return
        }
        const that = this
        $wuxActionSheet.show({
            titleText: '请选择附件类型',
            buttons: [{
                text: '图片',
                method: '_uploadImage'
            },
            {
                text: '视频',
                method: '_uploadVideo'
            }],
            buttonClicked(index, item) {
                if (that.qiNiuToken) {
                    that[item.method]()
                } else {
                    that._getUploadToken(that[item.method])
                }
                return true
            },
            cancelText: '取消',
            cancel() { }
        })
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
    _uploadImage() {
        // 校验附件数量
        // if (){

        // }
        const that = this;
        // 选择图片
        wx.chooseImage({
            count: 1,
            success: function (res) {
                // 1. 限制文件大小
                const imageSize = res.tempFiles[0].size
                if (imageSize > 4 * 1024 * 1024) {
                    wx.showModal({
                        title: '上传失败',
                        content: '所选图片大小不能大于4M',
                        showCancel: false
                    })
                    return
                }
                // 2. 文件命名
                const filePath = res.tempFilePaths[0]
                let filePathArr = filePath.split('.')
                const imageType = filePathArr[filePathArr.length - 1]
                const timeStamp = formatTime(new Date())
                const fileName = `${timeStamp}.${imageType}`
                // 交给七牛上传
                wx.showLoading({
                    title: '上传中...',
                    mask: true
                })
                qiniuUploader
                    .upload(filePath, (uploadRes) => {
                        console.log(uploadRes.imageURL, uploadRes.key)
                        const attachInfo = {
                            AttachName: fileName,
                            AttachSize: parseInt(imageSize / 1024),
                            AttachDesc: '',
                            AttachURL: uploadRes.imageURL
                        }
                        that._setAttachment(attachInfo, 1)
                    }, (error) => {
                        wx.hideLoading()
                        that._showToptips('上传图片失败，请重试')
                    }, {
                        uploadURL: 'https://up-z2.qbox.me',
                        region: 'SCN',
                        domain: 'http://cloud.ideas-lab.cn/',
                        key: `${app.globalData.token}/${that.eid}/${fileName}`,
                        uptoken: that.qiNiuToken
                    }, (res) => {
                        console.log('上传进度', res.progress)
                        console.log('已经上传的数据长度', res.totalBytesSent)
                        console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
                    });
            }
        })
    },

    _setAttachment(attachInfo, opType) {
        // opType(1 - 新增；2 - 修改；0 - 删除)
        console.log(attachInfo)
        wx.request({
            url: app.api.setEnrollAttachment,
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: app.globalData.token,
                enrollID: this.eid,
                opType: opType,
                attachInfo: JSON.stringify(attachInfo)
            },
            success: res => {
                wx.hideLoading()
                console.log(res.data)
                if (res.data.result) {
                    $wuxToptips.success({
                        hidden: !0,
                        text: '上传成功',
                    })
                    this._initData()
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
                this.opCount = res.data.opCount
                this.setData({
                    attachments: res.data.list
                })
            },
            fail: error => {
                this._showToptips('出错了，重试一下吧')
            },
            complete() {
                wx.hideLoading()
            }
        })
    },
    moreOpts(e) {
        const that = this
        const index = e.currentTarget.dataset.index || e.target.dataset.index
        $wuxActionSheet.show({
            titleText: '附件操作',
            buttons: [
                // {
                //     text: '修改',
                //     method: ''
                // },
                {
                    text: '删除附件',
                    method: '_setAttachment',
                    args: [that.data.attachments[index], 0]
                }],
            buttonClicked(index, item) {
                that[item.method].apply(that, item.args)
                return true
            },
            cancelText: '取消',
            cancel() { }
        })
    },
})