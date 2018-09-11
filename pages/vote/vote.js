const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    votes: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._initData()
  },

  _initData() {
    wx.showNavigationBarLoading()
    wx.request({
      url: app.api.getVoteList,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {},
      success: (res) => {
        this.setData({
          votes: res.data.list
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
    this._initData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})