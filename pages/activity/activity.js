const WxParse = require('../../assets/plugins/wxParse/wxParse.js')
import { $wuxDialog, $wuxButton, $wuxActionSheet } from '../../components/wux'

const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabIndex: 0,
        imgUrls: [],
        cases: [],
        info: {},
        org: {},
        is_follow: false,
        opened: !1,
        noticeContent: {
            isNoticeShow: false,
            deviceHeight: app.globalData.deviceHeight
        },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.aid = options.aid
        this._initData(options.aid)
        this.initButton()
    },
    initButton() {
        const that = this
        this.setData({
            opened: !1,
        })

        this.button = $wuxButton.init('br', {
            position: 'bottomRight',
            buttons: [
                {
                    label: '留言',
                    icon: "/assets/images/cytl.png",
                    method: 'goToComment'

                },
                {
                    label: '精彩瞬间',
                    icon: "/assets/images/media.png",
                    method: 'goToMedia'

                }
            ],
            buttonClicked(index, item) {
                that[item.method].call(that)
                return true
            },
            callback(vm, opened) {
                vm.setData({
                    opened,
                })
            },
        })
    },
    setTabIndex: function (e) {
        this.setData({
            tabIndex: parseInt(e.target.dataset.tabIndex)
        })
    },

    join: function () {
        if (this.activityInfo.intState == 1) {
            if (this.data.info.mode == 3) {
                const that = this
                $wuxActionSheet.show({
                  titleText: '选择报名类型',
                  buttons: [{
                      text: '个人报名',
                    },
                    {
                      text: '团体报名',
                    }],
                  buttonClicked(index, item) {
                      wx.navigateTo({
                        url: `/pages/activity/order/order?aid=${that.aid}&mode=${index + 1}`,
                      })
                      return true
                  },
                  cancelText: '取消',
                  cancel() { }
                })
            } else {
                wx.navigateTo({
                    url: `/pages/activity/order/order?aid=${this.aid}&mode=${this.data.info.mode}`,
                })
            }
        } else {
            wx.showModal({
                title: '提示',
                content: '活动已结束',
                showCancel: false
            })
        }
    },

    btn_follow: function (event) {
        let orgID = event.currentTarget.dataset.id;
        app.user.isLogin(token => {
            wx.showNavigationBarLoading()
            wx.request({
                url: app.api.userFollow,
                method: 'post',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    token: token,
                    orgID: orgID
                }, success: res => {
                    if (res.data.result) {
                        this.setData({
                            is_follow: res.data.is_follow
                        })
                    } else {
                        wx.showToast({
                            title: res.data.msg,
                        })
                    }
                }, complete: res => {
                    wx.hideNavigationBarLoading()
                }
            })
        })
    },

    _initData: function (aid) {
        var that = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        wx.request({
            url: app.api.activityInfo,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: app.user.ckLogin(),
                activityID: aid
            },
            success: res => {
                wx.hideLoading()
                if (res.data.result) {
                    const imgUrls = this.imgUrls = res.data.activityAttach.map(function (el, index) {
                        return app.resourseUrl + el.AttachURL
                    })
                    this.imgOriginUrls = this.imgUrls.map(function (el, index) {
                        return el.replace('/s/', '/o/')
                    })
                    this.activityInfo = res.data.activityInfo
                    wx.setNavigationBarTitle({
                      title: res.data.activityInfo.ActivityName
                    })
                    this.coordinate = JSON.parse(res.data.activityInfo.Coordinate)
                    
                    let orgInfo = res.data.orgInfo
                    orgInfo.LogoURL = app.resourseUrl + orgInfo.LogoURL
                     
                    this.setData({
                        imgUrls: imgUrls,
                        info: res.data.activityInfo,
                        org: orgInfo,
                        is_follow: res.data.is_follow,
                        cases: res.data.activityFee
                    })
                    WxParse.wxParse('detail', 'html', res.data.activityInfo.Content || '<p>暂无详情</p>', that, 5);
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
    goToInfoList: function (e) {
        if (this.activityInfo.ChannelSetting) {
            wx.navigateTo({
                url: `/pages/infos/infos?cid=${this.activityInfo.ChannelSetting}`,
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '尚未发布资料',
                showCancel: false
            })
        }
    },
    goToMedia: function (e){
      if (this.activityInfo.Media) {
        wx.navigateToMiniProgram({
          appId: 'wxb7f754f66ce708ae',
          path: this.activityInfo.Media,
          envVersion: 'release',
          success(res) {
            // 打开成功  
          }
        })  
      } else {
        wx.showModal({
          title: '提示',
          content: '敬请期待',
          showCancel: false
        })
      }
    },
    goTop: function (e) {
        wx.pageScrollTo({
            scrollTop: 0
        })
    },
    goToComment: function (e) {
        wx.navigateTo({
            url: `/pages/comments/comments?dataType=activity&dataId=${this.aid}`,
        })
    },
    showMoreFee: function (e){
        wx.navigateTo({
          url: `fee/fee?aid=${this.aid}`,
        })
    },
    goToUsercenter: function (e) {
        wx.switchTab({
            url: '/pages/mine/mine',
        })
    },
    openLocation: function () {
      if (this.activityInfo.Coordinate){
          wx.openLocation({
            latitude: parseFloat(this.coordinate.Latitude),
            longitude: parseFloat(this.coordinate.Longitude),
            name: this.activityInfo.Address,
            scale: 18
          })
      }
    },
    callTel: function () {
      if (this.activityInfo.ContactTel){
        wx.makePhoneCall({
          phoneNumber: this.activityInfo.ContactTel
        })
      }
    },
    showSchedule: function () {
      if (this.activityInfo.Schedule) {
        this.setData({
          'noticeContent.title': '活动安排',
          'noticeContent.content': this.activityInfo.Schedule,
          'noticeContent.isNoticeShow': true
        })
      }
    },
    viewImage: function (e) {
        wx.previewImage({
            urls: this.imgOriginUrls,
        })
    },
    share() {
        const that = this
        app.user.isLogin(token => {
            $wuxDialog.open({
                title: '分享活动给好友',
                content: this.activityInfo.ActivityName,
                verticalButtons: !0,
                buttons: [
                    {
                        text: '转发好友或群',
                        bold: !0,
                        onTap(e) {

                        }
                    },
                    {
                        text: '生成活动封面',
                        bold: !0,
                        onTap(e) {
                            wx.request({
                                url: app.api.getShareCode,
                                header: {
                                    'content-type': 'application/x-www-form-urlencoded'
                                },
                                data: {
                                    token: token,
                                    dataID: that.aid,
                                    type: 'a',
                                },
                                success: res => {
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
                            })
                        }
                    },
                    {
                        text: '取消分享',
                        bold: false,
                        onTap(e) {
                        }
                    },
                ],
            })
        })    
    },
    hideNotice() {
        this.setData({
            'noticeContent.isNoticeShow': false
        })
    },
    showFeeDesc(e) {
        const index = e.target.dataset.index || e.currentTarget.dataset.index
        this.setData({
            'noticeContent.title': '项目介绍',
            'noticeContent.content': this.data.cases[index].FeeDesc,
            'noticeContent.isNoticeShow': true
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: this.activityInfo.ActivityName,
            path: `/pages/activity/activity?aid=${this.aid}`,
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
    }
})