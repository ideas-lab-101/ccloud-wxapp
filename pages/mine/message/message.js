import { $wuxActionSheet } from '../../../components/wux/index'
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
            that.readMessage(messageIndex)
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

    readMessage(index){
      if (this.data.messages[index].ReadTime == null){
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
            }, success: res => {
              if (res.data.result) {
                let data = this.data.messages
                data[index].ReadTime = 'now'
                this.setData({
                  messages: data,
                  'noticeContent.content': this.data.messages[index].Content,
                  'noticeContent.isNoticeShow': true
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
      }else{
        this.setData({
          'noticeContent.content': this.data.messages[index].Content,
          'noticeContent.isNoticeShow': true
        })
      }
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