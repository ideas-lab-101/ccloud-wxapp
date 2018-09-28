import { $wuxToast } from "../../../components/wux/index"

var app = getApp()
Page({

    data: {
        ranking: [],
        voterData: {},
        voterDataIndex: -1,
        voteItemInfo: {}
    },

    onLoad: function (options) {
        /**
         * 指定投票人
         */
        if (decodeURIComponent(options.voterId) !== 'undefined'){
            this.voterId = options.voterId
        }else {
            this.voterId = app.user.authToken
        }
        this._initData(options.id)
    },

    onReady: function () {

    },

    onShow: function () {

    },

    onShareAppMessage: function () {

    },

    infoEvent: function (e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/vote/voteDetail/voteDetail?id='+id
        })
    },

    voteEvent: function (e) {
        const id = e.currentTarget.dataset.id
        const index = e.currentTarget.dataset.index

        getApp().user.isLogin(token => {
            wx.request({
                url: app.api.voteDeliver,
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    token: token,
                    memberID: id
                },
                success: (res) => {
                    if (res.data.result) {
                        const i = `ranking[${index}].vCount`
                        this.setData({
                            [i]: res.data.vCount
                        })
                        if (id === this.data.voterData.MemberID) {
                            this.setData({
                                'voterData.vCount': res.data.vCount
                            })
                        }

                        $wuxToast().show({
                            type: 'success',
                            duration: 1500,
                            color: '#fff',
                            text: '投票成功',
                            success: () => {}
                        })
                    }else{
                        //提示投票失败的原因
                    }
                },
                complete: () => {}
            })
        })
    },

    /**
     *  内置方法
     */

    _initData: function (id) {
        wx.showLoading({
            title: '加载数据中...'
        })
        wx.request({
            url: app.api.getVoteItemInfo,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: app.user.authToken,
                itemID: id
            },
            success: (res) => {
                console.log(res)
              const temp = this._getDefaultVoter(res.data.list)
                this.setData({
                    voteItemInfo: res.data.data,
                    ranking: res.data.list,
                    voterData: temp,
                    voterDataIndex: this.data.voterDataIndex
                })
                wx.setNavigationBarTitle({
                    title: res.data.data.ItemName
                })
            },
            complete: () => {
                wx.hideLoading()
            }
        })
    },
    
    /**
     * 默认投票人
     */
    _getDefaultVoter: function (list) {
        return list.find((item, index) => {
            if (item.openid === this.voterId) {
                this.data.voterDataIndex = index
                return item
            }
        })
    }

})