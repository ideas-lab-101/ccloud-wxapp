import { $wuxActionSheet } from '../../../../components/wux'
import { $wuxToptips } from '../../../../components/wux'
import WxValidate from '../../../../assets/plugins/WxValidate'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cases: [],
        info: {},
        isEnrolled: false,
        formData: {
            sex: '',
            nation: '',
            photoURL: '',
            district: ''
        },
        renderSignInfo: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.cid = options.cid
        wx.getStorage({
            key: 'userInfo',
            success: res => {
                this.setData({
                    formData: res.data
                })
            },
        })
        if (app.globalData.token) {
            this._initData(options.cid)
        } else {
            app.getToken()
                .then(() => {
                    this._initData(options.cid)
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
        $wuxActionSheet.show({
            titleText: '请选择签到项目',
            buttons: this.cases,
            buttonClicked(index, item) {
                that._enroll(item.id, params)
                return true
            },
            cancelText: '取消',
            cancel() {}
        })
    },
    _enroll(tid, formData) {
        var that = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        wx.request({
            url: app.baseUrl + 'attendance/UserSign',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                attendanceID: this.cid,
                tableID: tid,
                coordinate: JSON.stringify(this._coordinate),
                token: app.globalData.token,
                formData: JSON.stringify(formData)
            },
            success: res => {
                wx.hideLoading()
                if (res.data.result) {
                    wx.redirectTo({
                        url: '/pages/result/result?type=checkin',
                    })
                } else {
                    wx.showModal({
                      title: '出错了',
                      content: res.data.msg,
                      showCancel: false
                    })
                    // this._showToptips(res.data)
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

    _initData: function(cid) {
        var that = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        wx.request({
            url: app.baseUrl + 'attendance/GetAttendanceInfo',
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                attendanceID: cid
            },
            success: res => {
                wx.hideLoading()
                if (res.data.result) {
                    this.cases = res.data.attendanceTable.map(function(el, index) {
                        return {
                            text: `${el.TableName} -- ${el.TableTime}`,
                            id: el.TableID
                        }
                    })
                    const renderSignInfo = res.data.attendanceInfo.FormSetting.indexOf('signInfo') >= 0
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
                        imgUrl: app.resourseUrl + res.data.attendanceAttach[0].AttachURL,
                        renderSignInfo: renderSignInfo,
                        info: res.data.attendanceInfo,
                        cases: res.data.attendanceTable
                    })
                    this._initValidate()
                } else {
                    this._showToptips('出错了，重试一下吧')
                }
            },
            fail: error => {
                wx.hideLoading()
                this._showToptips('出错了，重试一下吧')
            },
            complete: () => {
                wx.hideLoading();
            }
        })
        wx.request({
            url: app.baseUrl + 'user/GetSignList',
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: app.globalData.token,
                attendanceID: cid,
                intState: 2,
                pageIndex: 0,
                pageSize: 100
            },
            success: res => {
                this.setData({
                    isEnrolled: res.data.list.length > 0
                })
            },
            fail: error => {
                this._showToptips(error.toString())
            }
        })
    },
    goToUsercenter() {
        wx.switchTab({
            url: '/pages/mine/mine',
        })
    }
})