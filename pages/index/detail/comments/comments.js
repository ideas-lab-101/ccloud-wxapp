const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        comments: [],
        isTaFocused: false,
        taPlaceholder: '用户留言',
        taContent: '',
        userOpenId: app.globalData.token,
        pager: {
            totalGuide: 0,
            totalPage: 0,
            pageNumber: 1
        }
    },
    referId: 0,
    onLoad: function (options) {
        this.aid = options.aid
        this._initData()
    },
    postComment(e) {
        if (e.detail.value.comment === '') {
            return
        }
        wx.showLoading({
            title: '发送中...',
        })
        wx.request({
            url: app.baseUrl + 'activity/UserComment',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                activityID: this.aid,
                referID: this.referId,
                formID: e.detail.formId,
                token: app.globalData.token,
                content: e.detail.value.comment
            },
            success: res => {
                wx.hideLoading()
                if (res.data.result) {
                    wx.showToast({
                        title: res.data.msg,
                        icon: 'success',
                        duration: 2000
                    })
                    this.setData({
                        taContent: '',
                        isTaFocused: false
                    })
                    this._initData();
                } else {
                    this._openModal(res.data.msg)
                }
            },
            fail: error => {
                wx.hideLoading()
                this._openModal(error.toString())
            }
        })
    },
    commentOnActivity() {
        if (app.globalData.token) {
            this.setData({
                taPlaceholder: '用户留言',
                isTaFocused: true
            })
            this.referId = 0
        } else {
            app.getToken()
                .then(() => {
                    this.setData({
                        taPlaceholder: '用户留言',
                        isTaFocused: true
                    })
                    this.referId = 0
                }, function (err) {
                    this._openModal(err.toString())
                })
        }
    },
    commentOnComment(e) {
        if (app.globalData.token) {
            this.setData({
                taPlaceholder: `回复 ${e.target.dataset.name}:`,
                isTaFocused: true
            })
            this.referId = e.target.dataset.cid
        } else {
            app.getToken()
                .then(() => {
                    this.setData({
                        taPlaceholder: `回复 ${e.target.dataset.name}:`,
                        isTaFocused: true
                    })
                    this.referId = e.target.dataset.cid
                }, function (err) {
                    this._openModal(err.toString())
                })
        }
    },
    hideTa: function () {
        this.setData({
            isTaFocused: false
        })
    },
    prev: function (e) {
        this._initData(this.data.pager.pageNumber - 2)
    },

    next: function (e) {
        this._initData(this.data.pager.pageNumber)
    },

    jumpToPage: function (e) {
        this._initData(e.detail.value - 1)
    },
    _initData: function (pageIndex = 0) {
        wx.showLoading({
            title: '请求数据...',
        })
        wx.request({
            url: app.baseUrl + 'activity/GetActivityComment',
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                activityID: this.aid,
                pageIndex: pageIndex,
                pageSize: 10
            },
            success: res => {
                wx.hideLoading()
                this.setData({
                    comments: res.data.list,
                    pager: {
                        totalComment: res.data.totalRow,
                        totalPage: res.data.totalPage,
                        pageNumber: res.data.pageNumber
                    }
                })
            },
            fail: error => {
                wx.hideLoading()
                this._openModal(error.toString())
            }
        })
    },

    _openModal: function (msg = '未知错误，重试一下吧~') {
        wx.showModal({
            title: '出错了',
            content: msg,
            showCancel: false,
            confirmText: '知道了'
        })
    }
})