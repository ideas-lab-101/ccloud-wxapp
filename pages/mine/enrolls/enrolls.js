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
        if (app.globalData.token) {
            this._initData(0)
        } else {
            app.getToken()
                .then(() => {
                    this._initData(0)
                }, function (err) {
                    this.showErrorModal(err.toString())
                })
        }
    },
    goToDetail: function (e) {
        wx.navigateTo({
            url: `/pages/index/detail/detail?aid=${e.target.dataset.aid || e.currentTarget.dataset.aid}`,
        })
    },
    prev: function (e) {
        this._initData(this.data.pager.pageNumber - 2)
    },

    onShow: function () {

    },

    next: function (e) {
        this._initData(this.data.pager.pageNumber)
    },

    jumpToPage: function (e) {
        this._initData('page:', e.detail.value - 1)
    },


    modifyForm: function (e) {
        wx.navigateTo({
            url: `form/form?eid=${e.target.dataset.eid}&prev=false`,
        })
    },
    previewForm: function (e) {
        wx.navigateTo({
            url: `form/form?eid=${e.target.dataset.eid}&prev=true`,
        })
    },

    _initData: function (pageIndex = 0) {
        wx.showLoading({
            title: '请求数据...',
        })
        wx.request({
            url: app.baseUrl + 'user/GetEnrollList',
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: app.globalData.token,
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
    pay(e) {
        const that = this
        wx.showLoading({
            title: '处理中...',
            mask: true
        })
        wx.request({
            url: app.baseUrl + 'pay/wx_repay',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                prepay_id: e.target.dataset.pid,
                token: app.globalData.token
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