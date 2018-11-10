// doc-search.js
var app = getApp()
const WxParse = require('../../../components/wxParse/wxParse.js')
import {
  $wuxBackdrop,
  $wuxToast
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
      imageUrl: this.data.voteMain.CoverURL,
      title: this.data.voteMain.VoteName,
      path: `/pages/vote/voteMain/voteMain?id=${this.vid}`,
      success: function(res) {
        // 转发成功
        wx.showToast({
          title: '谢谢转发^_^:)',
          icon: 'success'
        })
      },
      fail: function(res) {
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

  getShareCodeEvent: function() {
    const that = this
    wx.request({
      url: app.api.getShareCode,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'GET',
      data: {
        dataID: this.vid,
        type: 'v'
      },
      success: res => {
        //预览生成的图片
        if (res.data.result) {
          wx.previewImage({
            urls: [res.data.qr_code],
          })
        } else {
          wx.showModal({
            title: '出错了',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    });
  },

  openShareEvent: function() {
    $wuxBackdrop('#wux-backdrop-share').retain()
    this.setData({
      sharein: true
    })
  },

  closeShareLayerEvent: function() {
    $wuxBackdrop('#wux-backdrop-share').release()
    this.setData({
      sharein: false
    })
  },

  searchSubmit: function(e) {
    if (e.detail.value.key.trim() === '') {
      return false
    }
    wx.request({
      url: app.api.doSearch,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        voteID: this.vid,
        key: e.detail.value.key
      },
      success: (res) => {
        if (res.data.result) {
          const id = Number(res.data.data)
          wx.navigateTo({
            url: '/pages/vote/voteDetail/voteDetail?id=' + id
          })
        } else {
          $wuxToast().show({
            type: 'text',
            duration: 1000,
            text: res.data.msg
          })
        }
      },
      complete: () => {}
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
    var that = this;
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
        voteInfo.CoverURL = app.resourseUrl + voteInfo.CoverURL
        wx.setNavigationBarTitle({
          title: voteInfo.VoteName
        })
        this.setData({
          voteMain: voteInfo,
          voteList: res.data.list
        })
        WxParse.wxParse('detail', 'html', voteInfo.Content || '<p>暂无说明</p>', that, 5);
        this._initSwiper()
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  }

})