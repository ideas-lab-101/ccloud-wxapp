var app = getApp()
Page({

  data: {
    attachList: [],
    enroll: {},
    form: {}
  },

  onLoad: function(options) {
    this._initData(options.id)
  },

  onReady: function() {},

  onShow: function() {},

  onShareAppMessage: function() {
    //导向到列表页面
    let voter = this.data.form.name
    return {
      title: `我是【${voter}】,请给我投一票吧！`,
      path: `/pages/vote/voteList/voteList?id=${this.data.enroll.ItemID}&voterId=${this.data.enroll.openid}`,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '谢谢转发^_^:)',
          icon: 'success'
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  /**
   *  内置方法
   */
  _initData: function(id) {
    wx.showLoading({
      title: '加载数据中...'
    })
    wx.request({
      url: app.api.getVoteDetail,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        enrollID: id
      },
      success: (res) => {
        this.setData({
          attachList: res.data.attachList,
          enroll: res.data.enroll,
          form: res.data.form
        })
        // wx.setNavigationBarTitle({
        //   title: res.data.enroll.ItemName
        // })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  previewEvent: function(e) {
    const index = e.currentTarget.dataset.index

    let attachInfo = this.data.attachList[index]
    if (attachInfo.AttachType == 'image') {
      wx.previewImage({
        urls: [attachInfo.AttachURL]
      })
    } else if (attachInfo.AttachType == 'video') {
      wx.navigateTo({
        url: '/pages/system/video/video?attach_id=' + attachInfo.AttachID
      })
    }
  }

})