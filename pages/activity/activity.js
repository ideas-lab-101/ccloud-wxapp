const WxParse = require('../../assets/plugins/wxParse/wxParse.js')
import { $wuxDialog, $wuxButton } from '../../components/wux'

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
        opened: !1,
        noticeContent: {
            isNoticeShow: false,
            title: '项目简介',
            deviceHeight: app.globalData.deviceHeight
        }
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
        const self = this
        this.setData({
            opened: !1,
        })

        this.button = $wuxButton.init('br', {
            position: 'bottomRight',
            buttons: [
                {
                    label: '报名参加',
                    icon: "/assets/images/bmcj.png",
                },
                {
                    label: '参与讨论',
                    icon: "/assets/images/cytl.png",
                },
                {
                    label: '资料',
                    icon: "/assets/images/zl.png",
                },
                {
                    label: '个人中心',
                    icon: "/assets/images/grzx.png",
                },
                {
                    label: '分享',
                    icon: "/assets/images/fx.png",
                }
            ],
            buttonClicked(index, item) {
                index === 0 && self.join()
                index === 1 && self.goToComment()
                index === 2 && self.goToInfoList()
                index === 3 && self.goToUsercenter()
                index === 4 && self.share()
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
            wx.navigateTo({
                url: `/pages/activity/order/order?aid=${this.aid}`,
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '活动已结束',
                showCancel: false
            })
        }
    },

    _initData: function (aid) {
        var that = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        wx.request({
            url: app.baseUrl + 'activity/GetActivityInfo',
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
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
                    // this.cases = res.data.activityFee.map(function (el, index) {
                    //     return {
                    //         text: `${el.FeeName} -- ${el.TotalCost}/人`,
                    //         id: el.FeeID
                    //     }
                    // })
                    this.activityInfo = res.data.activityInfo
                    this.coordinate = JSON.parse(res.data.activityInfo.Coordinate)
                    this.setData({
                        imgUrls: imgUrls,
                        info: res.data.activityInfo,
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

    goToComment: function (e) {
        wx.navigateTo({
            url: `/pages/activity/comments/comments?aid=${this.aid}`,
        })
    },
    goToUsercenter: function (e) {
        wx.switchTab({
            url: '/pages/mine/mine',
        })
    },
    openLocation: function () {
        wx.openLocation({
            latitude: parseFloat(this.coordinate.Latitude),
            longitude: parseFloat(this.coordinate.Longitude),
            name: this.activityInfo.Address,
            scale: 18
        })
    },

    viewImage: function (e) {
        wx.previewImage({
            urls: this.imgOriginUrls,
        })
    },
    share() {
        const that = this
        $wuxDialog.open({
            title: '分享活动给好友',
            content: '【' + this.activityInfo.ActivityName + '】',
            verticalButtons: !0,
            buttons: [
                {
                    text: '转发给好友或微信群',
                    bold: !0,
                    onTap(e) {

                    }
                },
                {
                    text: '生成分享码到朋友圈',
                    bold: !0,
                    onTap(e) {
                        wx.request({
                            url: app.baseUrl + 'system/GetWXSSCode',
                            header: {
                                'content-type': 'application/x-www-form-urlencoded'
                            },
                            data: {
                                token: app.globalData.token,
                                activityID: that.aid
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
    },
    hideNotice() {
        this.setData({
            'noticeContent.isNoticeShow': false
        })
    },
    showFeeDesc(e) {
        const index = e.target.dataset.index || e.currentTarget.dataset.index
        this.setData({
            'noticeContent.content': this.data.cases[index].FeeDesc,
            'noticeContent.isNoticeShow': true
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '【' + this.activityInfo.ActivityName + '】',
            path: `/pages/activity/detail?aid=${this.aid}`,
            success: function (res) {
                // 转发成功
                wx.showToast({
                    title: '转发有奖^_^:)',
                    icon: 'success'
                })
            },
            fail: function (res) {
                // 转发失败
            }
        }
    }
})