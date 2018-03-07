//获取应用实例
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        items: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // options 中的 scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
        var scene = decodeURIComponent(options.scene)
        if (scene !== 'undefined') {
            wx.navigateTo({
                url: `/pages/index/detail/detail?aid=${scene}`,
            })
            // if (scene.indexOf('a_') >= 0) {
            //     wx.navigateTo({
            //         url: `/pages/index/detail/detail?aid=${scene.slice(2)}`,
            //     })
            // } else if (scene.indexOf('c_') >= 0) {
            //     wx.navigateTo({
            //         url: `/pages/checkin/detail/detail?cid=${scene.slice(2)}`,
            //     })
            // } else {
            //     wx.navigateTo({
            //         url: `/pages/index/detail/detail?aid=${scene}`,
            //     })
            // }
        }
        this._initData()
    },

    goToDetail: function (e) {
        wx.navigateTo({
            url: `/pages/index/detail/detail?aid=${e.target.dataset.aid || e.currentTarget.dataset.aid}`,
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this._initData();
    },

    _initData: function () {
        wx.showNavigationBarLoading()
        wx.request({
            url: app.api.index,
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {},
            success: res => {
                const items = res.data.list.map(function (el, index) {
                    return {
                        id: el.ID,
                        'type': el.DataType,
                        imgUrl: app.resourseUrl + el.CoverURL,
                        name: el.Name,
                        location: el.Address,
                        time: el.StartTime,
                        desc: el.Desc,
                        isShowDetail: false,
                        organisation: el.OrgName
                    }
                })
                this.setData({
                    items: items
                })
            },
            complete() {
                wx.hideNavigationBarLoading()
                wx.stopPullDownRefresh()
            }
        })
    },

    showItemDetail(e) {
        const items = this.data.items
        items[e.target.dataset.index].isShowDetail = !items[e.target.dataset.index].isShowDetail
        this.setData({
            items: items
        })
    }
})