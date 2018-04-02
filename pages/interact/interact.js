const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activitys: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
      app.user.isLogin(token => {
        this._initData()
      })
  },
  _initData() {
    wx.showNavigationBarLoading()
    wx.request({
      url: app.api.getInteractActivity,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
          token: app.user.authToken
      },
      success: (res) => {
        const datas = res.data.list.map(function (el, index) {
          var data = Object.assign({
          }, {
              id: el.ActivityID,
              imgUrl: app.resourseUrl + el.AttachURL,
              name: el.ActivityName,
              blnOpen: el.blnOpen,
              liveCount: el.liveCount
            })
          return data
        })
        this.setData({
          activitys: datas,
        })
      }, complete: () => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      }
    })
  },
  
  go_interact: function (e) {
    let index = e.target.dataset.index || e.currentTarget.dataset.index
    if (this.data.activitys[index].blnOpen == 0){
        wx.showModal({
          title: '提示',
          content: '此活动上墙未开启，敬请期待',
          showCancel: false,
          confirmText: '知道了'
        })
    }else{

    }
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