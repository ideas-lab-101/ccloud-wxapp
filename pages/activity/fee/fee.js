import {
  $wuxBackdrop
} from '../../../components/wux/index'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fees: [],
    pager: {
      totalRow: 0,
      pageNumber: 0,
      lastPage: true,
    },
    noticeContent: {
      isNoticeShow: false,
      title: '项目说明'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.aid = options.aid
    this._initData()
  },

  showDetail(e) {
    $wuxBackdrop().retain()
    const index = e.target.dataset.index  ||e.currentTarget.dataset.index
    this.setData({
      'noticeContent.title': '项目说明',
      'noticeContent.content': this.data.fees[index].FeeDesc,
      in: true
    })
  },

  closeInfoLayerEvent(e) {
    $wuxBackdrop().release()
    this.setData({
      in: false
    })
  },

  onReachBottom: function() {
    if (this.data.pager.lastPage) {
      return false
    }
    this.setData({
      'pager.pageNumber': this.data.pager.pageNumber + 1
    })
    this._initData()
  },

  _initData: function() {
    wx.showLoading({
      title: '请求数据...',
    })
    wx.request({
      url: app.api.feeList,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        activityID: this.aid,
        pageIndex: this.data.pager.pageNumber,
        pageSize: 10
      },
      success: res => {
        this.setData({
          fees: this.data.fees.concat(res.data.list),
          'pager.totalRow': res.data.totalRow,
          'pager.lastPage': res.data.lastPage
        })
      },
      fail: error => {
        this.showErrorModal(error.toString())
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  showErrorModal: function(msg = '未知错误，重试一下吧~') {
    wx.showModal({
      title: '出错了',
      content: msg,
      showCancel: false,
      confirmText: '知道了'
    })
  }
})