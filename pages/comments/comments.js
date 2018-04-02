import { $wuxActionSheet } from '../../components/wux'
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
        pager: {
            totalGuide: 0,
            totalPage: 0,
            pageNumber: 1
        }
    },
    referId: 0,
    onLoad: function (options) {
        this.dataId = options.dataId
        this.dataType = options.dataType
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
            url: app.api.postComment,
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                dataID: this.dataId,
                dataType: this.dataType,
                referID: this.referId,
                formID: e.detail.formId,
                token: app.user.authToken,
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
        app.user.isLogin(token => {
          this.setData({
            taPlaceholder: '用户留言',
            isTaFocused: true
          })
          this.referId = 0
        })
    },
    commentOnComment(commentIndex) {
        app.user.isLogin(token => {
          this.setData({
            taPlaceholder: `回复 ${this.data.comments[commentIndex].nickname}:`,
            isTaFocused: true
          })
          this.referId = this.data.comments[commentIndex].CommentID
        })
    },
    deleteComment(commentIndex) {
        const that = this;
        $wuxActionSheet.show({
            titleText: '确认删除该条评论吗',
            className: 'cancel-action',
            buttons: [{ text: '删除' }],
            buttonClicked(index, item) {
                wx.request({
                    url: app.api.delComment,
                    method: 'POST',
                    header: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                        commentID: that.data.comments[commentIndex].CommentID,
                        token: app.user.authToken
                    },
                    success: res => {
                        if (res.data.result) {
                            that._initData();
                        } else {
                            that._openModal(res.data.msg);
                        }
                    },
                    fail: error => {
                        this._openModal(error.toString())
                    }
                })
                return true
            },
            cancelText: '取消',
            cancel() { }
        });
    },
    moreOpts(e) {
        const that = this;
        const commentIndex = e.currentTarget.dataset.index
        const actionConfig = {
            titleText: '评论操作',
            buttons: [{ text: '回复' }],
            buttonClicked(index, item) {
                that.commentOnComment(commentIndex);
                return true
            },
            cancelText: '取消',
            cancel() {
            }
        };
        if (that.data.comments[commentIndex].openid === app.user.authToken) {
            actionConfig.destructiveText = '删除';
            actionConfig.destructiveButtonClicked = function () {
                that.deleteComment(commentIndex);
            };
        }
        $wuxActionSheet.show(actionConfig);
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
            url: app.api.getCommentList,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                dataType: this.dataType,
                dataID: this.dataId,
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