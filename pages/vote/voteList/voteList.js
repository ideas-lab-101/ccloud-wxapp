import { $wuxToast } from "../../../components/wux/index"

var app = getApp()
Page({

    data: {
        voteItemInfo: {},
        ranking: [],
        top: 0,
        pager: {
          totalRow: 0,
          totalPage: 0,
          pageIndex: 1
        },
        /** 特定参赛人 */
        voterData: {}
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
        // this.voterId = "ov74Q0SywFpwoEWAJMmfYS8Gd4sg"
        this.itemID = options.id
        this._initData()
        this.getRankingList()
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
                    voteID: this.data.voteItemInfo.VoteID,
                    memberID: id
                },
                success: (res) => {
                    if (res.data.result) {
                        const i = `ranking[${index}].vCount`
                        this.setData({
                            [i]: res.data.vCount
                        })
                      if (this.data.voterData && id === this.data.voterData.MemberID) {
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
                        $wuxToast().show({
                          type: 'text',
                          duration: 1500,
                          color: '#fff',
                          text: res.data.msg,
                          success: () => { }
                        })
                    }
                },
                complete: () => {}
            })
        })
    },

    /**
     *  内置方法
     */

    _initData: function () {
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
                itemID: this.itemID,
                voterID: this.voterId
            },
            success: (res) => {
                // const temp = this._getDefaultVoter(res.data.list)
                const temp = {}
                this.setData({
                    voteItemInfo: res.data.data,
                    voterData: res.data.voter
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
     * 获得列表数据
     */
    getRankingList(){
      wx.showLoading({
        title: '加载数据中...',
      })
      wx.request({
        url: app.api.getVoteItemList,
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          itemID: this.itemID,
          pageIndex: this.data.pager.pageIndex -1,
          pageSize: 20
        },
        success: res => {
          console.log(res.data)
          this.setData({
            ranking: res.data.list,
            pager: {
              totalRow: res.data.totalRow,
              totalPage: res.data.totalPage,
              pageIndex: res.data.pageNumber
            }
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
    },

  prev() {
      this.setData({
        'pager.pageIndex': this.data.pager.pageIndex - 1,
        top: 0
      })
      this.getRankingList()
    },
    next() {
      this.setData({
        'pager.pageIndex': this.data.pager.pageIndex +1,
        top: 0
      })
      this.getRankingList()
    },
    jumpToPage(e) {
      this.setData({
        'pager.pageIndex': e.detail.value
      })
        this.getRankingList()
    }

})