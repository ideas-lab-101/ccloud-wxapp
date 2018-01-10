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
    onLoad: function(options) {
        if (app.globalData.token) {
            this._initData(0)
        } else {
            app.getToken()
                .then(() => {
                    this._initData(0)
                }, function(err) {
                    this.showErrorModal(err.toString())
                })
        }
    },
    goToDetail: function(e) {
        wx.navigateTo({
            url: `/pages/checkin/detail/detail?cid=${e.target.dataset.cid || e.currentTarget.dataset.cid}`,
        })
    },
    prev: function(e) {
        this._initData(this.data.pager.pageNumber - 2)
    },

    onShow: function() {

    },

    next: function(e) {
        this._initData(this.data.pager.pageNumber)
    },

    jumpToPage: function(e) {
        this._initData('page:', e.detail.value - 1)
    },


    modifyForm: function(e) {
        wx.navigateTo({
            url: `form/form?sid=${e.target.dataset.sid}&prev=false`,
        })
    },
    previewForm: function(e) {
        wx.navigateTo({
            url: `form/form?sid=${e.target.dataset.sid}&prev=true`,
        })
    },

    _initData: function(pageIndex = 0) {
        wx.showLoading({
            title: '请求数据...',
        })
        wx.request({
            url: app.baseUrl + 'user/GetSignList',
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
    showErrorModal: function(msg = '未知错误，重试一下吧~') {
        wx.showModal({
            title: '出错了',
            content: msg,
            showCancel: false,
            confirmText: '知道了'
        })
    }
})