const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page_show: false,
    is_login: false,
    token: app.user.ckLogin(),
    userInfo: [],
    msgCount: 0,
  },
  /**
   * 活动记录
   */
  goToEnrolls: function() {
    getApp().user.isLogin(token => {
      wx.navigateTo({
        url: 'enrolls/enrolls',
      })
    })
  },
  goToCoupon: function() {
    wx.showModal({
      title: '提示',
      content: '功能即将开放',
      showCancel: false,
      confirmText: '知道了'
    })
  },
  /**
   * 消息记录
   */
  goToMessage: function() {
    getApp().user.isLogin(token => {
      wx.navigateTo({
        url: 'message/message',
      })
    })
  },
  goToGuides: function() {
    wx.navigateTo({
      url: '/pages/infos/infos?cid=6',
    })
  },
  onLoad: function(options) {
    app.pages.add(this);
  },
  onReady: function() {
    if (app.user.ckLogin()) {
      wx.showLoading({
        title: '加载中',
      })
      this._initData()
    } else {
      this.setData({
        page_show: true
      })
    }
  },
  onShow: function() {
    this.setData({
      is_login: app.user.ckLogin()
    })
    if (app.user.ckLogin()) {
      //获取最新消息
      this.get_systemNotice()
    }
  },
  login() {
    app.user.isLogin(token => {
      this.setData({
        token: token
      })
      wx.showLoading({
        title: '加载中',
      })
      this._initData()
    })
  },
  get_userInfo(res) {
    if (res.detail.errMsg == "getUserInfo:ok") {
      this.login()
    }
  },
  get_systemNotice() {
    wx.request({
      url: app.api.getSystemNotice,
      method: 'get',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: app.user.authToken
      },
      success: res => {
        this.setData({
          msgCount: res.data.msgCount
        })
      },
      complete: res => {

      }
    })
  },
  /**
   * 活动互动
   */
  goToInteract() {
    getApp().user.isLogin(token => {
      wx.navigateTo({
        url: '/pages/interact/interact',
      })
    })
  },
  /**
   * 活动投票
   */
  goToVote() {
    wx.showModal({
      title: '提示',
      content: '功能即将开放',
      showCancel: false,
      confirmText: '知道了'
    })
  },
  /**
   * 我的收藏
   */
  goToFavor() {
    getApp().user.isLogin(token => {
      wx.navigateTo({
        url: '/pages/mine/favor/favor',
      })
    })
  },
  /**
   * 扫码登陆
   */
  scan_code() {
    getApp().user.isLogin(token => {
      //调起扫码
      wx.scanCode({
        onlyFromCamera: false,
        success: res => {
          let data = res.result
          try {
            var obj = JSON.parse(data);
            if (obj.type == 'login') {
              this.scan_login(obj.key)
            } else {
              wx.showToast({
                title: '错误的二维码！',
                icon: 'none',
              })
            }
          } catch (e) {
            wx.showToast({
              title: '错误的二维码！',
              icon: 'none',
            })
          }
        },
        fail: function(res) {

        },
        complete: function(res) {

        },
      })
    })
  },
  scan_login(key) {
    wx.showModal({
      content: '是否登录网页版？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '正在登录',
          })
          wx.request({
            url: app.api.scanCodeLogin,
            method: 'post',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              token: app.user.authToken,
              key: key
            },
            success: res => {
              if (res.data.code == 1) {
                wx.showToast({
                  title: res.data.msg,
                })
              } else {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                })
              }
            },
            complete: res => {

            }
          })
        }
      }
    })
  },
  _initData: function() {
    wx.showLoading({
      title: '请求数据...',
    })
    wx.request({
      url: app.api.accountInfo,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: app.user.authToken
      },
      success: res => {
        this.setData({
          is_login: true,
          page_show: true,
          userInfo: res.data.data
        })
      },
      fail: error => {
        this._showErrorModal(error.toString())
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  _showErrorModal: function(msg = '未知错误，重试一下吧~') {
    wx.showModal({
      title: '出错了',
      content: msg,
      showCancel: false,
      confirmText: '知道了'
    })
  }
})