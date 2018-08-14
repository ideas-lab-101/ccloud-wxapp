import { $wuxActionSheet } from '../../../../../components/wux/index'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        members: [],
        pager: {
            totalMember: 0,
            totalPage: 0,
            pageNumber: 1
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.aid = options.aid
        app.user.isLogin(token => {
          this._initData(0)  
        })
    },

    prev: function (e) {
        this._initData(this.data.pager.pageNumber - 2)
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
            url: app.api.getGroupEnrollList,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                activityID: this.aid,
                token: app.user.authToken,
                pageIndex: pageIndex,
                pageSize: 10
            },
            success: res => {
                this.setData({
                    members: res.data.list,
                    pager: {
                        totalMember: res.data.totalRow,
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