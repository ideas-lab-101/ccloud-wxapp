const utils = require('../../utils/util.js')

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    infos: [],
    pager: {
      totalRow: 0,
      pageNumber: 0,
      lastPage: true,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.cid = options.cid
    this._initData()
  },

  onShow: function() {

  },

  goToDetail: function(e) {
    wx.navigateTo({
      url: `infobook/infobook?gid=${e.target.dataset.iid}`,
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
      url: app.api.getInfoList,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        channelID: this.cid,
        pageIndex: this.data.pager.pageNumber,
        pageSize: 10
      },
      success: res => {
        this.setData({
          infos: this.data.infos.concat(res.data.list.map(info => {
            info.FormatTime = utils.convertTime(info.AddTime)
            return info
          })),
          'pager.totalRow': res.data.totalRow,
          'pager.lastPage': res.data.lastPage
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