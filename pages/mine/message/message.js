import { $wuxActionSheet } from '../../../components/wux'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        messages: [],
        pager: {
            totalMessage: 0,
            totalPage: 0,
            pageNumber: 1
        },
        noticeContent: {
          isNoticeShow: false,
          title: '消息详情',
          deviceHeight: app.globalData.deviceHeight
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.user.isLogin(token => {
            this._initData(0)
        })  
    },

    prev: function (e) {
        this._initData(this.data.pager.pageNumber - 2)
    },

    moreOpts(e) {
      const that = this;
      const messageIndex = e.currentTarget.dataset.index
      const actionConfig = {
        titleText: '消息操作',
        buttons: [{
          text: '查看消息详情',
          method: function (index) {
            this.setData({
              'noticeContent.content': this.data.messages[messageIndex].Content,
              'noticeContent.isNoticeShow': true
            })
          }
        }],
        buttonClicked(index, item) {
          item.method.call(that, messageIndex)
          return true
        },
        cancelText: '取消',
        cancel() {
        }
      };
      $wuxActionSheet.show(actionConfig);
    },

    hideNotice() {
      this.setData({
        'noticeContent.isNoticeShow': false
      })
    },

    next: function (e) {
        this._initData(this.data.pager.pageNumber)
    },

    jumpToPage: function (e) {
        this._initData('page:', e.detail.value - 1)
    },

    _initData: function (pageIndex = 0) {
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
                pageIndex: pageIndex,
                pageSize: 10
            },
            success: res => {
                this.setData({
                    messages: res.data.list,
                    pager: {
                        totalMessage: res.data.totalRow,
                        totalPage: res.data.totalPage,
                        pageNumber: res.data.pageNumber
                    }
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
    showErrorModal: function (msg = '未知错误，重试一下吧~') {
        wx.showModal({
            title: '出错了',
            content: msg,
            showCancel: false,
            confirmText: '知道了'
        })
    }
})