import { $wuxActionSheet } from '../../../components/wux'
import { $wuxToptips } from '../../../components/wux'
import WxValidate from '../../../assets/plugins/WxValidate'
import SystemEnum from '../../../utils/SystemEnum'

const app = getApp()
const en = new SystemEnum()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        fees: [],
        mode: 0,
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
        isRenderRegionInfo: false,
        isRenderGroupInfo: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.aid = options.aid
        this.mode = options.mode
        this.setData({
          mode: options.mode
        })
        //取缓存数据
        wx.getStorage({
            key: 'userInfo',
            success: res => {
                this.setData({
                    formData: res.data
                })
            },
        })
        app.user.isLogin(token => {
            this._initData(options.aid)
        })
    },

    formSubmit(e) {
        if (!this.feeId && this.mode == 1) { //仅针对个人报名
            this._showToptips('请选择报名项目')
            return false
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
        this._enroll(this.feeId ? this.feeId:0, params)
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
                mode: this.mode,
                feeID: fid,
                token: app.user.authToken,
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
                        title: '提示',
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
                token: app.user.authToken
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
            text: error.msg || error || '请填写正确的字段',
            hidden: true,
            success: () => { }
        })
    },
    chooseGender: function () {
        $wuxActionSheet.show({
            titleText: '请选择性别',
            buttons: en.genders,
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
            'formData.nation': en.nations[e.detail.value]
        })
    },
    chooseFee: function (e) {
        this.setData({
            feeName: this.data.fees[e.detail.value].text
        })
        this.feeId = this.data.fees[e.detail.value].id
    },
    chooseProvince: function (e) {
        var that = this
        this.setData({
            'formData.province': en.provinces[e.detail.value].ProvinceName,
            'formData.city': '',
            'formData.district': ''
        })
        en._getCityData(en.provinces[e.detail.value].ProvinceID, function(){
          that.setData({
            cities: en.cities
          })
        });
    },
    chooseCity: function (e) {
        var that = this
        this.setData({
            'formData.city': en.cities[e.detail.value].CityName,
            'formData.district': ''
        })
        en._getDistrictData(en.cities[e.detail.value].CityID , function () {
          that.setData({
            districts: en.districts
          })
        });
    },
    chooseDistrict: function (e) {
        this.setData({
            'formData.district': en.districts[e.detail.value].DistrictName
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
                        'token': app.user.authToken
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
            url: app.api.activityEnroll,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                activityID: aid,
                mode: this.mode
            },
            success: res => {
                wx.hideLoading()
                if (res.data.result) {
                    const isRenderBaseInfo = res.data.formSetting.FormSetting.indexOf('baseInfo') >= 0
                    const isRenderPhotoInfo = res.data.formSetting.FormSetting.indexOf('photoInfo') >= 0
                    const isRenderSchoolInfo = res.data.formSetting.FormSetting.indexOf('schoolInfo') >= 0
                    const isRenderReferInfo = res.data.formSetting.FormSetting.indexOf('referInfo') >= 0
                    const isRenderRegionInfo = res.data.formSetting.FormSetting.indexOf('regionInfo') >= 0
                    const isRenderGroupInfo = res.data.formSetting.FormSetting.indexOf('groupInfo') >= 0
                    if (isRenderBaseInfo) {
                        en._getGenderData()
                        en._getNationData(function(){
                          that.setData({
                            nations: en.nations
                          })
                        })
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
                    if (isRenderGroupInfo) {
                      Object.assign(this.validators, {
                        'group': {
                          required: true
                        },
                        'contactName': {
                          required: true
                        },
                        'contactTel': {
                          required: true,
                          tel: true,
                        },
                      })
                      Object.assign(this.validationMsgs, {
                        'group': {
                          required: '请输入团队名称'
                        },
                        'contactName': {
                          required: '请输入联系人姓名',
                        },
                        'contactTel': {
                          required: '请输入联系人手机',
                          tel: '请输入正确的手机号',
                        },
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
                    if (isRenderRegionInfo) {
                        en._getProvincesData(this.aid, function(){
                            that.setData({
                              provinces: en.provinces
                            })
                        })
                        Object.assign(this.validators, {
                            'province': {
                                required: true
                            },
                            'city': {
                                required: true
                            },
                            'district': {
                                required: true
                            },
                            'address': {
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
                            },
                            'address': {
                              required: '请输入街道地址'
                            },
                        })
                    }
                    this.setData({
                        imgUrl: app.resourseUrl + res.data.activityAttach[0].AttachURL,
                        isRenderBaseInfo: isRenderBaseInfo,
                        isRenderPhotoInfo: isRenderPhotoInfo,
                        isRenderSchoolInfo: isRenderSchoolInfo,
                        isRenderReferInfo: isRenderReferInfo,
                        isRenderRegionInfo: isRenderRegionInfo,
                        isRenderGroupInfo: isRenderGroupInfo,
                        info: res.data.activityInfo,
                        fees: res.data.activityFee.map(function (el, index) {
                            return {
                                text: `${el.FeeName} -- ${el.TotalCost} 元/人`,
                                id: el.FeeID
                            }
                        })
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
                token: app.user.authToken,
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
        wx.navigateTo({
          url: '/pages/mine/enrolls/enrolls',
        })
    }
})