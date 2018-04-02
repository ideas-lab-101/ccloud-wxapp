//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    no_data: false,
    ls_load: false,
    data_list:[],
    resourceURL: ''
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    //加载首页
    this.get_data()
  },
  get_data() {
    this.setData({
      is_load: true
    })
    wx.request({
      url: getApp().api.catalog,
      data: {

      },
      success: (res) => {

        this.setData({
          data_list:res.data.list,
          resourceURL: app.resourseUrl
        })

        wx.stopPullDownRefresh()
      }, complete: () => {
        wx.hideLoading()
      }
    })
  },
  go_search() {
    wx.navigateTo({
      url: '../search/search',
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      no_data: false
    })
    this.get_data()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    /*if (this.data.more && !this.data.ls_load) {
      this.setData({
        page: this.data.page + 1,
        more_data: "正在加载更多.."
      })
      this.get_data()
    }*/

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
