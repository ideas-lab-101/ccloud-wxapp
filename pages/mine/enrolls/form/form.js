import {
  $wuxActionSheet,
  $wuxToptips,
  $wuxQrcode,
  $wuxBackdrop
} from '../../../../components/wux/index'
import WxValidate from '../../../../utils/WxValidate'
import SystemEnum from '../../../../utils/SystemEnum'

const app = getApp()
const en = new SystemEnum()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formData: {},
    enrollInfo: {},
    isRenderBaseInfo: false,
    isRenderPhotoInfo: false,
    isRenderSchoolInfo: false,
    isRenderReferInfo: false,
    isRenderGroupInfo: false,
    isPreview: false
  },
  hasQrcode: false,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.eid = options.eid
    this.aid = options.aid
    this.setData({
      isPreview: options.prev === 'true'
    })
    app.user.isLogin(token => {
      this._initData(options.eid)
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
    that._updateEnroll(e.detail.formId, params)
  },
  _updateEnroll(formId, formData) {
    var that = this;
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      url: app.api.updateEnroll,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        enrollID: this.eid,
        formID: formId,
        token: app.user.authToken,
        formData: JSON.stringify(formData)
      },
      success: res => {
        wx.hideLoading()
        if (res.data.result) {
          $wuxToptips().success({
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
    const hideToptips = $wuxToptips().show({
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
    $wuxActionSheet().showSheet({
      titleText: '请选择性别',
      buttons: en.genders,
      buttonClicked: (index, item) => {
        this.setData({
          'formData.sex': item.text
        })
        return true
      },
      cancelText: '取消',
      cancel() {}
    })
  },
  chooseNation: function(e) {
    this.setData({
      'formData.nation': en.nations[e.detail.value]
    })
  },
  chooseProvince: function(e) {
    var that = this
    this.setData({
      'formData.province': en.provinces[e.detail.value].ProvinceName,
      'formData.provinceID': en.provinces[e.detail.value].ProvinceID,
      'formData.city': '',
      'formData.district': ''
    })
    en._getCityData(en.provinces[e.detail.value].ProvinceID, function() {
      that.setData({
        cities: en.cities
      })
    });
  },
  chooseCity: function(e) {
    var that = this
    this.setData({
      'formData.city': en.cities[e.detail.value].CityName,
      'formData.cityID': en.cities[e.detail.value].CityID,
      'formData.district': ''
    })
    en._getDistrictData(en.cities[e.detail.value].CityID, function() {
      that.setData({
        districts: en.districts
      })
    });
  },
  chooseDistrict: function(e) {
    this.setData({
      'formData.district': en.districts[e.detail.value].DistrictName,
      'formData.districtID': en.districts[e.detail.value].DistrictID
    })
  },
  uploadPic: function() {
    var that = this;
    if (this.data.isPreview) {
      return
    }
    // 选择图片
    wx.chooseImage({
      count: 1,
      success: function(res) {
        var filePath = res.tempFilePaths[0];
        wx.uploadFile({
          url: app.api.uploadPhoto,
          filePath: filePath,
          name: 'photoFile',
          formData: {
            'token': app.user.authToken
          },
          success: function(res) {
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
        token: app.user.authToken,
        enrollID: eid
      },
      success: res => {
        //报名信息
        this.data.enrollInfo = res.data.enrollInfo
        wx.setNavigationBarTitle({
          title: res.data.enrollInfo.mode == 1 ? '个人报名表' : '团队报名表'
        })
        const isRenderBaseInfo = res.data.formData.name !== null
        const isRenderGroupInfo = res.data.formData.group !== null
        const isRenderPhotoInfo = res.data.formData.photoURL !== null
        const isRenderSchoolInfo = res.data.formData.school !== null
        const isRenderReferInfo = res.data.formData.referName !== null
        const isRenderRegionInfo = res.data.formData.province !== null
        if (isRenderBaseInfo) {
          en._getGenderData()
          en._getNationData(function() {
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
            'groupNum': {
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
            'groupNum': {
              required: '请输入团队人数'
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
          en._getProvincesData(this.aid, function() {
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
            }
          })
        }
        this.setData({
          isRenderBaseInfo: isRenderBaseInfo,
          isRenderGroupInfo: isRenderGroupInfo,
          isRenderPhotoInfo: isRenderPhotoInfo,
          isRenderSchoolInfo: isRenderSchoolInfo,
          isRenderReferInfo: isRenderReferInfo,
          isRenderRegionInfo: isRenderRegionInfo,
          formData: res.data.formData,
          enrollInfo: this.data.enrollInfo
        })
        this._initValidate()
        this.hasQrcode = res.data.enrollInfo.EnrollCode
        res.data.enrollInfo.EnrollCode && this._initCanvas(res.data.enrollInfo.EnrollCode)
      },
      fail: error => {
        this._showToptips('出错了，重试一下吧')
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  _initCanvas(value) {
    // $wuxQrcode.init('qrcode', value, {
    //     width:200,
    //     height:200,
    //     fgColor: '#000000'
    // })
  },
  attachmentManage() {
    //传入是否为只读模式
    wx.navigateTo({
      url: `../attachment/attachment?eid=${this.eid}&prev=${this.data.isPreview}`
    })
  },
  groupList() {
    wx.navigateTo({
      url: `../grouplist/grouplist?aid=${this.aid}`
    })
  },
  feedback() {
    wx.navigateTo({
      url: `/pages/system/feedback/feedback?data_type=activity&data_id=${this.eid}`
    })
  },
  showQrcode() {
    if (this.hasQrcode) {
      $wuxBackdrop().retain()
      this.setData({ in: true
      })
    } else {
      wx.showModal({
        title: '获取二维码失败',
        content: '报名号未生成',
        showCancel: false
      })
    }
  },
  closeQrcode() {
    $wuxBackdrop().release()
    this.setData({ in: false
    })
  }
})