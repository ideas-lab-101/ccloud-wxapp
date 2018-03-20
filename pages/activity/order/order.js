import { $wuxActionSheet } from '../../../components/wux'
import { $wuxToptips } from '../../../components/wux'
import WxValidate from '../../../assets/plugins/WxValidate'
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
        isRenderBaseInfo: false,
        isRenderPhotoInfo: false,
        isRenderSchoolInfo: false,
        isRenderReferInfo: false,
        isRenderRegionInfo:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.aid = options.aid
        wx.getStorage({
            key: 'userInfo',
            success: res => {
                this.setData({
                    formData: res.data
                })
            },
        })
        if (app.globalData.token) {
            this._initData(options.aid)
        } else {
            app.getToken()
                .then(() => {
                    this._initData(options.aid)
                }, function (err) {
                    this._showToptips(err.toString())
                })
        }
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
            titleText: '请选择报名项目',
            buttons: this.cases,
            buttonClicked(index, item) {
                that._enroll(item.id, params)
                return true
            },
            cancelText: '取消',
            cancel() { }
        })
    },
    _enroll(fid, formData) {
        var that = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        wx.request({
            url: app.api.enroll,
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                activityID: this.aid,
                feeID: fid,
                token: app.globalData.token,
                formData: JSON.stringify(formData)
            },
            success: res => {
                wx.hideLoading()
                if (res.data.result) {
                    //根据是否支付来控制
                    if (res.data.orderInfo) {
                        $wuxToptips.success({
                            hidden: !0,
                            text: '报名表提交成功',
                        })
                        //支付
                        this._pay(res.data.orderInfo, res.data.enrollID)
                    } else {
                        wx.redirectTo({
                            url: '/pages/result/result?type=success',
                        })
                    }
                } else {
                    wx.showModal({
                        title: '出错了',
                        content: res.data.msg,
                        showCancel: false
                    })
                }
            },
            fail: error => {
                wx.hideLoading()
                this._showToptips('出错了，重试一下吧')
            }
        })
    },
    _pay(order, enrollId) {
        const that = this
        wx.showLoading({
            title: '支付中...',
            mask: true
        })
        wx.request({
            url: app.api.wxPay,
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                out_trade_no: order.orderCode,
                total_fee: order.totalPrice,
                token: app.globalData.token
            },
            success: res => {
                if (res.data.data) {
                    wx.requestPayment({
                        'timeStamp': res.data.data.timeStamp,
                        'nonceStr': res.data.data.nonceStr,
                        'package': res.data.data.package,
                        'signType': res.data.data.signType,
                        'paySign': res.data.data.paySign,
                        'success': function (res) {
                            wx.redirectTo({
                                url: '/pages/result/result?type=success',
                            })
                        },
                        'fail': function (res) {
                            wx.redirectTo({
                                url: '/pages/result/result?type=cancel',
                            })
                        }
                    })
                } else {
                    wx.redirectTo({
                        url: '/pages/result/result?type=cancel',
                    })
                }
            },
            fail: error => {
                that._showToptips('出错了，重试一下吧')
            },
            complete: () => {
                wx.hideLoading()
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
    genders: [],
    _getGenderData() {
        wx.request({
            url: app.api.enumValues,
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
            url: app.api.enumValues,
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
    provinces: [],
    _getProvincesData() {
        wx.request({
            url: app.api.provinces,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                activityID: this.aid
            },
            success: res => {
                this.provinces = res.data;
                this.setData({
                    provinces: this.provinces
                })
            },
            fail: error => {
                this._showToptips('出错了，重试一下吧')
            }
        })
    },
    chooseProvince: function (e) {
        this.setData({
            'formData.province': this.provinces[e.detail.value].ProvinceName,
            'formData.city': '',
            'formData.district': ''           
        })
        this._getCityData(this.provinces[e.detail.value].ProvinceID);
    },
    cities: [],
    _getCityData(pid) {
        wx.request({
            url: app.api.cities,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                provinceID: pid
            },
            success: res => {
                this.cities = res.data.list;
                this.setData({
                    cities: this.cities
                })
            },
            fail: error => {
                this._showToptips('出错了，重试一下吧')
            }
        })
    },
    chooseCity: function (e) {
        this.setData({
            'formData.city': this.cities[e.detail.value].CityName,
            'formData.district': ''  
        })
        this._getDistrictData(this.cities[e.detail.value].CityID);
    },
    districts: [],
    _getDistrictData(cid) {
        wx.request({
            url: app.api.districts,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                cityID: cid
            },
            success: res => {
                if (res.data.list) {
                    this.districts = res.data.list
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
    chooseDistrict: function (e) {
        this.setData({
            'formData.district': this.districts[e.detail.value].DistrictName
        })
    },
    uploadPic: function () {
        var that = this;
        // 选择图片
        wx.chooseImage({
            count: 1,
            success: function (res) {
                var filePath = res.tempFilePaths[0];
                wx.showLoading({
                    title: '上传中...',
                    mask: true
                })
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
                    },
                    fail: err => {
                        that._showToptips(err.toString())
                    },
                    complete: () => {
                        wx.hideLoading()
                    }
                })
            }
        })
    },
    deletePic() {
        if (this.data.photoURL !== '') {
            wx.showModal({
                title: '删除图片',
                content: '确定删除该图片吗？',
                success: res => {
                    if (res.confirm) {
                        this.setData({
                            photoURL: ''
                        })
                    }
                }
            })
        }
    },
    _initData: function (aid) {
        var that = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        wx.request({
            url: app.api.activityInfo,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                activityID: aid
            },
            success: res => {
                wx.hideLoading()
                if (res.data.result) {
                    this.cases = res.data.activityFee.map(function (el, index) {
                        return {
                            text: `${el.FeeName} -- ${el.TotalCost} 元/人`,
                            id: el.FeeID
                        }
                    })
                    const isRenderBaseInfo = res.data.activityInfo.FormSetting.indexOf('baseInfo') >= 0
                    const isRenderPhotoInfo = res.data.activityInfo.FormSetting.indexOf('photoInfo') >= 0
                    const isRenderSchoolInfo = res.data.activityInfo.FormSetting.indexOf('schoolInfo') >= 0
                    const isRenderReferInfo = res.data.activityInfo.FormSetting.indexOf('referInfo') >= 0
                    const isRenderRegionInfo = res.data.activityInfo.FormSetting.indexOf('regionInfo') >= 0
                    if (isRenderBaseInfo) {
                        this._getGenderData()
                        this._getNationData()
                        Object.assign(this.validators, {
                            'name': {
                                required: true
                            },
                            'sex': {
                                required: true,
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
                            'name': {
                                required: '请输入姓名',
                            },
                            'sex': {
                                required: '请选择性别',
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
                    if (isRenderSchoolInfo) {
                        Object.assign(this.validators, {
                            'school': {
                                required: true
                            },
                            'grade': {
                                required: true
                            }
                        })
                        Object.assign(this.validationMsgs, {
                            'school': {
                                required: '请输入学校'
                            },
                            'grade': {
                                required: '请输入年级'
                            }
                        })
                    }
                    if (isRenderPhotoInfo) {
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
                    if (isRenderRegionInfo){
                        this._getProvincesData();
                        Object.assign(this.validators, {
                            'province': {
                                required: true
                            },
                            'city': {
                                required: true
                            },
                            'district': {
                                required: true
                            }
                        })
                        Object.assign(this.validationMsgs, {
                            'province': {
                                required: '请选择所在省份',
                            },
                            'city': {
                                required: '请选择所在市'
                            },
                            'district': {
                                required: '请选择所在区'
                            }
                        })
                    }
                    this.setData({
                        imgUrl: app.resourseUrl + res.data.activityAttach[0].AttachURL,
                        isRenderBaseInfo: isRenderBaseInfo,
                        isRenderPhotoInfo: isRenderPhotoInfo,
                        isRenderSchoolInfo: isRenderSchoolInfo,
                        isRenderReferInfo: isRenderReferInfo,
                        isRenderRegionInfo: isRenderRegionInfo,
                        info: res.data.activityInfo,
                        cases: res.data.activityFee
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
            url: app.api.enrollList,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: app.globalData.token,
                activityID: aid,
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