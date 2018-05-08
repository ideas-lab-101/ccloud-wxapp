const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeId: 0,
    activitys: {},
    totalRows: 0,
    page: 0,
    moreDataText: "正在加载更多..",
    noMore: false,
    noData: false,
    hasMore: false,
    isLoading: false,
    resourceURL: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    this.data.typeId = option.typeId
    this._initData()
  },
  _initData() {
    wx.showNavigationBarLoading()
    this.setData({
      isLoading: true
    })
    wx.request({
      url: app.api.activityList,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
          pageIndex: this.data.page,
          typeID: this.data.typeId
      },
      success: (res) => {
        this.setData({
          totalRows: res.data.totalRow,
          resourceURL: app.resourseUrl
        })
        if (this.data.page == 0) {
          this.setData({
            activitys: res.data.list
          })
        } else {
          let o_data = this.data.activitys;
          for (var index in res.data.list) {
            o_data.push(res.data.list[index])
          }
          this.setData({
            activitys: o_data
          })
        }
        //统一的分页调用
        app.setPageMore(this, res.data)
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
      page: 0,
      hasMore: false,
      noMore: false
    })
    this._initData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.isLoading) {
      this.setData({
        page: this.data.page + 1,
        moreDataText: "正在加载更多.."
      })
      this._initData()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})