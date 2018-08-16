const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    members: [],
    pager: {
      totalRow: 0,
      totalPage: 0,
      pageNumber: 0,
      lastPage: true,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.aid = options.aid
    app.user.isLogin(token => {
      this._initData()
    })
  },

  onReachBottom: function () {
    if (this.data.pager.lastPage) {
      return false
    }
    this.setData({
      'pager.pageNumber': this.data.pager.pageNumber + 1
    })
    this._initData()
  },
  
  _initData: function() {
    wx.showLoading({
      title: '请求数据...',
    })
    wx.request({
      url: app.api.getGroupEnrollList,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        activityID: this.aid,
        token: app.user.authToken,
        pageIndex: this.data.pager.pageNumber,
        pageSize: 10
      },
      success: res => {
        this.setData({
          members: this.data.members.concat(res.data.list),
          pager: {
            totalRow: res.data.totalRow,
            totalPage: res.data.totalPage,
            lastPage: res.data.lastPage,
            pageNumber: res.data.pageNumber - 1
          }
        })
      },
      fail: error => {
        this.showErrorModal(error.toString())
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  showErrorModal: function(msg = '未知错误，重试一下吧~') {
    wx.showModal({
      title: '出错了',
      content: msg,
      showCancel: false,
      confirmText: '知道了'
    })
  }
})