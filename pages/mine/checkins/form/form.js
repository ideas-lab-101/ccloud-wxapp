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
        renderSignInfo: false,
        isPreview: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.sid = options.sid
        this.setData({
            isPreview: options.prev === 'true'
        })
        if (app.globalData.token) {
            this._initData(options.sid)
        } else {
            app.getToken()
                .then(() => {
                    this._initData(options.sid)
                }, function(err) {
                    this._showToptips(err.toString())
                })
        }
        this._getUserLocation();
    },
    _getUserLocation() {
        wx.getLocation({
            type: 'wgs84',
            success: res => {
                this._coordinate = {
                    Latitude: res.latitude,
                    Longitude: res.longitude
                }
            },
            fail: err => {
                this._showToptips('获取位置信息失败')
            }
        })
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
            url: app.baseUrl + 'attendance/UpdateSignInfo',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                signID: this.sid,
                token: app.globalData.token,
                coordinate: JSON.stringify(this._coordinate),
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
                        url: '/pages/result/result?type=checkin',
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
            success: () => {}
        })
    },
    chooseGender: function() {
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
            cancel() {}
        })
    },
    chooseDistrict: function(e) {
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
                    this.genders = res.data.list.map(function(el, index) {
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
                    this.districts = res.data.list.map(function(el, index) {
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

    _initData: function(sid) {
        var that = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        wx.request({
            url: app.baseUrl + 'attendance/GetSignInfo',
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: app.globalData.token,
                signID: sid
            },
            success: res => {
                const renderSignInfo = res.data.formData.name !== null
                if (renderSignInfo) {
                    this._getGenderData()
                    this._getDistrictData()
                    Object.assign(this.validators, {
                        'name': {
                            required: true
                        },
                        'post': {
                            required: true
                        },
                        'sex': {
                            required: true,
                        },
                        'tel': {
                            required: true,
                            tel: true,
                        },
                        'district': {
                            required: true
                        },
                        'organization': {
                            required: true
                        }
                    })
                    Object.assign(this.validationMsgs, {
                        'name': {
                            required: '请输入姓名',
                        },
                        'post': {
                            required: '请输入职务',
                        },
                        'sex': {
                            required: '请选择性别',
                        },
                        'tel': {
                            required: '请输入手机号',
                            tel: '请输入正确的手机号',
                        },
                        'district': {
                            required: '请选择区',
                        },
                        'organization': {
                            required: '请输入所属组织'
                        }
                    })
                }
                this.setData({
                    renderSignInfo: renderSignInfo,
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