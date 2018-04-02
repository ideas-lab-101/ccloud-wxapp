
Page({
  data: {
    data_id: null,
    data_type: null,
    disabled: true,
    o_type: 1,
    items: [
      { name: '1', value: '报错反馈', checked: 'true' },
      { name: '2', value: '业务反馈' }
    ]
  },
  onLoad: function (options) {
      this.data.data_id = options.data_id
      this.data.data_type = options.data_type
  },
  radioChange: function (e) {
    this.setData({
      o_type: e.detail.value
    })
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  },
  reply_input: function (e) {
    if (e.detail.value.length > 0) {
      this.setData({
        disabled: false
      })
    } else {
      this.setData({
        disabled: true
      })
    }
  },
  bindFormSubmit: function (e) {
    var content = e.detail.value.textarea;
    getApp().user.isLogin(token => {
      wx.showLoading({
        title: '提交中',
      })
      wx.request({
        url: getApp().api.feedback,
        method: 'post',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          token: token,
          data_id: this.data.data_id,
          data_type: this.data.data_type,
          content: content,
          o_type: this.data.o_type
        }, success: res => {
          wx.showToast({
            title: res.data.msg
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500);
        }, fail: error => {
          wx.showToast({
            title: '请求失败'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500);
        }, complete: () => {

        }
      })
    })
  }
})