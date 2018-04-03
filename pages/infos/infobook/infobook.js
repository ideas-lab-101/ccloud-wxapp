const WxParse = require('../../../assets/plugins/wxParse/wxParse.js')
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        is_add: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.gid = options.gid
        this._initData()
    },

    _initData: function () {
        var that = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        wx.request({
            url: app.api.getInfoContent,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                infoID: this.gid
            },
            success: res => {
                wx.hideLoading()
                if (res.data.data) {
                    wx.setNavigationBarTitle({
                        title: res.data.data.Title,
                    })
                    that.setData({
                        Title: res.data.data.Title,
                        Source: res.data.data.Source,
                        AddTime: res.data.data.AddTime,
                    })
                    WxParse.wxParse('detail', 'html', res.data.data.Content || '<p>暂无信息</p>', that, 5);
                } else {
                    wx.showModal({
                        title: '出错了',
                        content: '重试一下吧',
                        showCancel: false,
                        confirmText: "好的"
                    })
                }
            },
            fail: error => {
                wx.hideLoading()
            }
        })
    },
    go_home: function(){
        wx.switchTab({
          url: '/pages/index/index',
        })
    },
    add_favor: function(){
      wx.showNavigationBarLoading()
      app.user.isLogin(token => {
        wx.request({
          url: app.api.userFavor,
          method: 'post',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            token: token,
            dataID: this.gid,
            type: 'info'
          }, success: res => {
            if (res.data.result) {
              this.setData({
                is_add: true
              })
              wx.showToast({
                title: res.data.msg
              })
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
              })
            }
          }, complete: res => {
            wx.hideNavigationBarLoading()
          }
        })
      })
    }
})