// pages/mine/enrolls/paper/paper.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.eid = options.eid
    app.user.isLogin(token => {
      this._initData()
    })
  },

  _initData: function () {
    wx.showLoading({
      title: '请求数据...',
    })
    wx.request({
      url: app.api.enrollPaper,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        enrollID: this.eid,
        token: app.user.authToken
      },
      success: res => {
        console.log(res);
      },
      fail: error => {
        this.showErrorModal(error.toString())
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

})