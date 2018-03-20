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
        isRenderBaseInfo: false,
        isRenderPhotoInfo: false,
        isRenderSchoolInfo: false,
        isRenderReferInfo: false,
        hasAttachList:false,
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
    _initData(eid) {
        var that = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        wx.request({
            url: app.api.enrollInfo,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: app.globalData.token,
                enrollID: eid
            },
            success: res => {
                const isRenderBaseInfo = res.data.formData.name !== null
                const isRenderPhotoInfo = res.data.formData.photoURL !== null
                const isRenderSchoolInfo = res.data.formData.school !== null
                const isRenderReferInfo = res.data.formData.referName !== null
                const isRenderRegionInfo = res.data.formData.province !== null
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
                if (isRenderRegionInfo) {
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
                    isRenderBaseInfo: isRenderBaseInfo,
                    isRenderPhotoInfo: isRenderPhotoInfo,
                    isRenderSchoolInfo: isRenderSchoolInfo,
                    isRenderReferInfo: isRenderReferInfo,
                    isRenderRegionInfo: isRenderRegionInfo,
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
        this._getAttachmentData(eid)
    },
    _getAttachmentData(eid) {
        wx.request({
            url: app.api.getAttachList,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: app.globalData.token,
                enrollID: eid
            },
            success: res => {
                this.setData({
                    attachments: res.data.list,
                    attachmentOpCount: res.data.opCount,
                    hasAttachList:true
                })
            },
            fail: error => {
                this._showToptips('出错了，重试一下吧')
            }
        })
    }
})