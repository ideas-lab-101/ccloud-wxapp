// doc-search.js
var app = getApp()
import {
  $wuxBackdrop
} from "../../../components/wux/index";

Page({

  data: {
    voteMain: {},
    voteList: [],
    current: 0,
    prev: false,
    next: false
  },

  onLoad: function(options) {
    this.vid = options.id
    this._initData()
  },

  onShow: function() {},

  onReady: function() {

  },

  onShareAppMessage: function() {
    return {
      title: this.data.voteMain.VoteName,
      path: `/pages/vote/voteMain/voteMain?id=${this.vid}`,
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

  linkEvent: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/vote/voteList/voteList?id=' + id
    })
  },

  prevEvent: function() {
    this.data.current--
      if (this.data.current <= 0) {
        this.data.current = 0
      }
    this.setData({
      current: this.data.current
    })
  },

  nextEvent: function() {
    this.data.current++
      if (this.data.current >= this.data.voteList.length - 1) {
        this.data.current = this.data.voteList.length - 1
      }
    this.setData({
      current: this.data.current
    })
  },

  changeEvent: function(e) {
    this.setData({
      current: e.detail.current
    })
    if (this.data.current >= this.data.voteList.length - 1) {
      this.setData({
        next: false
      })
    } else {
      this.setData({
        next: true
      })
    }

    if (this.data.current <= 0) {
      this.setData({
        prev: false
      })
    } else {
      this.setData({
        prev: true
      })
    }
  },


  documentEvent: function(e) {
    $wuxBackdrop().retain()
    this.setData({
      docin: true
    })
  },

  docCloseEvent: function() {
    $wuxBackdrop().release()
    this.setData({
      docin: false
    })
  },
  /**
   *  内置方法
   */
  _initSwiper: function() {
    if (this.data.voteList.length > 1) {
      this.setData({
        next: true
      })
    }
  },

  _initData: function() {
    wx.showLoading({
      title: '加载数据中...'
    })
    wx.request({
      url: app.api.getVoteInfo,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        voteID: this.vid
      },
      success: (res) => {
        let voteInfo = res.data.data
        voteInfo.LogoURL = app.resourseUrl + voteInfo.LogoURL
        wx.setNavigationBarTitle({
          title: voteInfo.VoteName
        })
        this.setData({
          voteMain: voteInfo,
          voteList: res.data.list
        })

        this._initSwiper()
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  }

})