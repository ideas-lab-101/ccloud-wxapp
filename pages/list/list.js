const app = getApp()
const utils = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeId: '',
    orgId: '',
    activitys: [],
    pager: {
      totalRow: 0,
      totalPage: 0,
      pageNumber: 0,
      lastPage: true,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      if (decodeURIComponent(options.typeId) !== 'undefined'){
          this.data.typeId = options.typeId
      }
      if (decodeURIComponent(options.orgId) !== 'undefined'){
          this.data.orgId = options.orgId
      }
      this._initData()
  },
  _initData() {
    wx.showNavigationBarLoading()
    wx.request({
      url: app.api.activityList,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        pageIndex: this.data.pager.pageNumber,
        typeID: this.data.typeId,
        orgID: this.data.orgId,
      },
      success: (res) => {
        this.setData({
          activitys: this.data.activitys.concat(res.data.list.map(activity => {
            activity.AttachURL = app.resourseUrl + activity.AttachURL
            return activity
          })),
          pager: {
            totalRow: res.data.totalRow,
            totalPage: res.data.totalPage,
            lastPage: res.data.lastPage,
            pageNumber: res.data.pageNumber - 1
          }
        })
      }, complete: () => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      'pager.pageNumber': 0,
      'pager.lastPage': true
    })
    this._initData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.pager.lastPage) {
      return false
    }
    this.setData({
      'pager.pageNumber': this.data.pager.pageNumber + 1
    })
    this._initData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})