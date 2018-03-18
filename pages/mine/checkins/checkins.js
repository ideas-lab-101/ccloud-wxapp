import { $wuxActionSheet } from '../../../components/wux'
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
    // goToDetail: function(e) {
    //     wx.navigateTo({
    //         url: `/pages/checkin/detail/detail?cid=${e.target.dataset.cid || e.currentTarget.dataset.cid}`,
    //     })
    // },
    prev: function (e) {
        this._initData(this.data.pager.pageNumber - 2)
    },

    moreOpts(e) {
        const that = this;
        const enrollIndex = e.currentTarget.dataset.index
        const actionConfig = {
            titleText: '签到操作',
            buttons: [{
                text: '查看签到详情',
                method: function (index) {
                    wx.navigateTo({
                        url: `/pages/checkin/checkin?cid=${this.data.enrolls[index].AttendanceID}`,
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
        if (that.data.enrolls[enrollIndex].intState === 0 || that.data.enrolls[enrollIndex].intState === 2) {
            actionConfig.buttons.push({
                text: '修改签到表',
                method: function (index) {
                    wx.navigateTo({
                        url: `form/form?sid=${this.data.enrolls[index].SignID}&prev=false`,
                    })
                }
            });
        } else if (that.data.enrolls[enrollIndex].intState === 99) {
            actionConfig.buttons.push({
                text: '查看签到表',
                method: function (index) {
                    wx.navigateTo({
                        url: `form/form?sid=${this.data.enrolls[index].SignID}&prev=true`,
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
    previewForm: function (e) {
        wx.navigateTo({
            url: `form/form?sid=${e.target.dataset.sid}&prev=true`,
        })
    },

    _initData: function (pageIndex = 0) {
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
    showErrorModal: function (msg = '未知错误，重试一下吧~') {
        wx.showModal({
            title: '出错了',
            content: msg,
            showCancel: false,
            confirmText: '知道了'
        })
    }
})