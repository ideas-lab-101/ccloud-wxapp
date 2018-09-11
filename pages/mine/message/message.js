import {
  $wuxActionSheet,
  $wuxBackdrop
} from '../../../components/wux/index'
const utils = require('../../../utils/util.js')

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    messages: [],
    pager: {
      totalRow: 0,
      pageNumber: 0,
      lastPage: true,
    },
    noticeContent: {
      isNoticeShow: false,
      title: '消息详情'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    app.user.isLogin(token => {
      this._initData()
    })
  },

  moreOpts(e) {
    const that = this;
    const messageIndex = e.currentTarget.dataset.index
    const actionConfig = {
      titleText: '消息操作',
      buttons: [{
        text: '查看消息详情',
        method: function(index) {
          that.readMessage(messageIndex)
        }
      }],
      buttonClicked(index, item) {
        item.method.call(that, messageIndex)
        return true
      },
      cancelText: '取消',
      cancel() {}
    };
    $wuxActionSheet().showSheet(actionConfig);
  },

  closeInfoLayerEvent(e) {
    $wuxBackdrop().release()
    this.setData({ in: false
    })
  },

  readMessage(index) {
    $wuxBackdrop().retain()
    this.setData({
      'noticeContent.title': '消息详情',
      'noticeContent.content': this.data.messages[index].Content,
      in: true
    })
    //更新消息阅读标志
    if (this.data.messages[index].ReadTime == null) {
      wx.showNavigationBarLoading()
      app.user.isLogin(token => {
        wx.request({
          url: app.api.readMessage,
          method: 'post',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            token: token,
            messageID: this.data.messages[index].MessageID
          },
          success: res => {
            if (res.data.result) {
              let data = this.data.messages
              data[index].ReadTime = 'now'
              this.setData({
                messages: data
              })
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
              })
            }
          },
          complete: res => {
            wx.hideNavigationBarLoading()
          }
        })
      })
    }
  },

  onReachBottom: function () {
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
      url: app.api.getMessageList,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: app.user.authToken,
        pageIndex: this.data.pager.pageNumber,
        pageSize: 10
      },
      success: res => {
        this.setData({
          messages: this.data.messages.concat(res.data.list.map(message => {
            message.FormatTime = utils.convertTime(message.AddTime)
            return message
          })),
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