import { $wuxActionSheet } from '../../../../components/wux'
import { $wuxToptips } from '../../../../components/wux'
import WxValidate from '../../../../assets/plugins/WxValidate'
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
        renderBaseInfo: false,
        renderPhotoInfo: false,
        renderSchoolInfo: false,
        renderReferInfo: false,
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

    formSubmit(e) {
        const that = this
        if (this.data.isPreview) {
            return
        }
        const params = e.detail.value
        if (!this.WxValidate.checkForm(e)) {
            const error = this.WxValidate.errorList[0]
            this._showToptips(error)
            return false
        }
        wx.setStorage({
            key: 'userInfo',
            data: params,
        })
        that._updateEnroll(params)
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
                console.log(res.data)
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
    chooseGender: function () {
        if (this.data.isPreview) {
            return
        }
        $wuxActionSheet.show({
            titleText: '请选择性别',
            buttons: this.genders,
            buttonClicked(index, item) {
                this.setData({
                    'formData.sex': item.text
                })
                return true
            },
            cancelText: '取消',
            cancel() { }
        })
    },
    chooseNation: function (e) {
        this.setData({
            'formData.nation': this.nations[e.detail.value]
        })
    },
    chooseDistrict: function (e) {
        this.setData({
            'formData.district': this.districts[e.detail.value]
        })
    },
    genders: [],
    _getGenderData() {
        wx.request({
            url: app.baseUrl + 'system/GetEnumDetail',
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                masterID: 23
            },
            success: res => {
                if (res.data.list) {
                    this.genders = res.data.list.map(function (el, index) {
                        return {
                            text: el.Caption
                        }
                    })
                } else {
                    this._showToptips('出错了，重试一下吧')
                }
            },
            fail: error => {
                this._showToptips('出错了，重试一下吧')
            }
        })
    },
    nations: [],
    _getNationData() {
        wx.request({
            url: app.baseUrl + 'system/GetEnumDetail',
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                masterID: 26
            },
            success: res => {
                if (res.data.list) {
                    this.nations = res.data.list.map(function (el, index) {
                        return el.Caption
                    })
                    this.setData({
                        nations: this.nations
                    })
                } else {
                    this._showToptips('出错了，重试一下吧')
                }
            },
            fail: error => {
                this._showToptips('出错了，重试一下吧')
            }
        })
    },
    districts: [],
    _getDistrictData() {
        wx.request({
            url: app.baseUrl + 'system/GetDistricts',
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                cityID: 234
            },
            success: res => {
                if (res.data.list) {
                    this.districts = res.data.list.map(function (el, index) {
                        return el.DistrictName
                    })
                    this.setData({
                        districts: this.districts
                    })
                } else {
                    this._showToptips('出错了，重试一下吧')
                }
            },
            fail: error => {
                this._showToptips('出错了，重试一下吧')
            }
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
                    url: app.baseUrl + 'user/UploadPhoto',
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
    deletePic() {
        if (this.data.isPreview) {
            return
        }
        wx.showModal({
            title: '删除图片',
            content: '确定删除该图片吗？',
            success: res => {
                if (res.confirm) {
                    this.setData({
                        'formData.photoURL': ''
                    })
                }
            }
        })
    },
    _initData: function (eid) {
        var that = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        wx.request({
            url: app.baseUrl + 'activity/GetEnrollInfo',
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: app.globalData.token,
                enrollID: eid
            },
            success: res => {
                const renderBaseInfo = res.data.formData.name !== null
                const renderPhotoInfo = res.data.formData.photoURL !== null
                const renderSchoolInfo = res.data.formData.school !== null
                const renderReferInfo = res.data.formData.referName !== null
                if (renderBaseInfo) {
                    this._getGenderData()
                    this._getNationData()
                    Object.assign(this.validators, {
                        'sex': {
                            required: true,
                        },
                        'name': {
                            required: true
                        },
                        'tel': {
                            required: true,
                            tel: true,
                        },
                        'age': {
                            required: true,
                            number: true
                        }
                    })
                    Object.assign(this.validationMsgs, {
                        'sex': {
                            required: '请选择性别',
                        },
                        'name': {
                            required: '请输入姓名',
                        },
                        'tel': {
                            required: '请输入手机号',
                            tel: '请输入正确的手机号',
                        },
                        'age': {
                            required: '请输入年龄',
                            number: '请输入正确的年龄',
                        }
                    })
                }
                if (renderSchoolInfo) {
                    this._getDistrictData()
                    Object.assign(this.validators, {
                        'district': {
                            required: true
                        },
                        'school': {
                            required: true
                        },
                        'grade': {
                            required: true
                        }
                    })
                    Object.assign(this.validationMsgs, {
                        'district': {
                            required: '请选择区',
                        },
                        'school': {
                            required: '请输入学校'
                        },
                        'grade': {
                            required: '请输入年级'
                        }
                    })
                }
                if (renderPhotoInfo) {
                    this._getDistrictData()
                    Object.assign(this.validators, {
                        'photoURL': {
                            required: true
                        }
                    })
                    Object.assign(this.validationMsgs, {
                        'photoURL': {
                            required: '请上传照片'
                        },
                    })
                }
                this.setData({
                    renderBaseInfo: renderBaseInfo,
                    renderPhotoInfo: renderPhotoInfo,
                    renderSchoolInfo: renderSchoolInfo,
                    renderReferInfo: renderReferInfo,
                    formData: res.data.formData
                })
                this._initValidate()
            },
            fail: error => {
                this._showToptips('出错了，重试一下吧')
            },
            complete: () => {
                wx.hideLoading()
            }
        })
    }
})