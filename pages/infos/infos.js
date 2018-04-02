const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        guides: [],
        pager: {
            totalGuide: 0,
            totalPage: 0,
            pageNumber: 1
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.cid = options.cid
      this._initData(0)
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


    goToDetail: function (e) {
        wx.navigateTo({
            url: `infobook/infobook?gid=${e.target.dataset.iid}`,
        })
    },

    _initData: function (pageIndex = 0) {
        wx.showLoading({
            title: '请求数据...',
        })
        wx.request({
            url: app.api.getInfoList,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                channelID: this.cid,
                pageIndex: pageIndex,
                pageSize: 10
            },
            success: res => {
                this.setData({
                    guides: res.data.list,
                    pager: {
                        totalGuide: res.data.totalRow,
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