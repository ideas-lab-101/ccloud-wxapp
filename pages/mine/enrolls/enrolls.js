import { $wuxActionSheet } from '../../../components/wux/index'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        enrolls: [],
        pager: {
            totalEnroll: 0,
            totalPage: 0,
            pageNumber: 1
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
        const enrollIndex = e.currentTarget.dataset.index
        const actionConfig = {
            titleText: '活动操作',
            buttons: [{
                text: '查看活动详情',
                method: function (index) {
                    wx.navigateTo({
                        url: `/pages/activity/activity?aid=${this.data.enrolls[index].ActivityID}`,
                    })
                }
            }],
            buttonClicked(index, item) {
                item.method.call(that, enrollIndex)

                return true
            },
            cancelText: '取消',
            cancel() {
            }
        };
        if (that.data.enrolls[enrollIndex].intState === 0 || that.data.enrolls[enrollIndex].intState === 1 || that.data.enrolls[enrollIndex].intState === 2) {
            actionConfig.buttons.push({
                text: '完善报名信息',
                method: function (index) {
                    wx.navigateTo({
                        url: `form/form?aid=${this.data.enrolls[index].ActivityID}&eid=${this.data.enrolls[index].EnrollID}&prev=false`,
                    })
                }
            });
        } else if (that.data.enrolls[enrollIndex].intState === 99) {
            actionConfig.buttons.push({
                text: '查看报名信息',
                method: function (index) {
                    wx.navigateTo({
                        url: `form/form?aid=${this.data.enrolls[index].ActivityID}&eid=${this.data.enrolls[index].EnrollID}&prev=true`,
                    })
                }
            });
        }
        if (that.data.enrolls[enrollIndex].orderState === 1001) {
            actionConfig.buttons.push({
                text: '缴费',
                method: function (index) {
                    const that = this
                    wx.showLoading({
                        title: '处理中...',
                        mask: true
                    })
                    wx.request({
                        url: app.api.rePay,
                        method: 'POST',
                        header: {
                            'content-type': 'application/x-www-form-urlencoded'
                        },
                        data: {
                            prepay_id: this.data.enrolls[index].prepayID,
                            token: app.user.authToken
                        },
                        success: res => {
                            if (res.data.data) {
                                wx.requestPayment({
                                    'timeStamp': res.data.data.timeStamp,
                                    'nonceStr': res.data.data.nonceStr,
                                    'package': res.data.data.package,
                                    'signType': res.data.data.signType,
                                    'paySign': res.data.data.paySign,
                                    'success': function (res) {
                                        wx.redirectTo({
                                            url: '/pages/result/result?type=success',
                                        })
                                    },
                                    'fail': function (res) {
                                        wx.redirectTo({
                                            url: '/pages/result/result?type=cancel',
                                        })
                                    }
                                })
                            } else {
                                wx.redirectTo({
                                    url: '/pages/result/result?type=cancel',
                                })
                            }
                        },
                        fail: error => {
                            that.showErrorModal('出错了，重试一下吧')
                        },
                        complete: () => {
                            wx.hideLoading()
                        }
                    })
                }
            });
        }
        $wuxActionSheet.show(actionConfig);
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
            url: app.api.enrollList,
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
                    enrolls: res.data.list,
                    pager: {
                        totalEnroll: res.data.totalRow,
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