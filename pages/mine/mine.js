const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {
            avatarUrl: '/assets/images/mine.png',
        },
        // noticeContent: {
        //     isNoticeShow: false,
        //     deviceHeight: app.globalData.deviceHeight
        // },
        // activityList: []
    },
    goToEnrolls: function () {
        wx.navigateTo({
            url: 'enrolls/enrolls',
        })
    },
    goToCheckins: function () {
        wx.navigateTo({
            url: 'checkins/checkins',
        })
    },
    goToGuides: function () {
        wx.navigateTo({
            url: '/pages/infos/infos?cid=6',
        })
    },
    showAbout() {
        this.setData({
            'noticeContent.title': '关于我们',
            'noticeContent.content': `教育信息化专家`,
            'noticeContent.isNoticeShow': true
        })
    },
    hideNotice() {
        this.setData({
            'noticeContent.isNoticeShow': false
        })
    },
    onLoad: function (options) {
      // getApp().pages.add(this);
    },
    onReady: function () {
      if (app.globalData.token) {
        this._initData()
      } else {
        app.getToken()
          .then(() => {
            this._initData()
          }, function (err) {
            this._showErrorModal(err.toString())
          })
      }
    },
    _initData: function () {
        wx.showLoading({
            title: '请求数据...',
        })
        wx.request({
            url: app.baseUrl + 'user/GetAccountInfo',
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: app.globalData.token
            },
            success: res => {
                this.setData({
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

    _showErrorModal: function (msg = '未知错误，重试一下吧~') {
        wx.showModal({
            title: '出错了',
            content: msg,
            showCancel: false,
            confirmText: '知道了'
        })
    }
})