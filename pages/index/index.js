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
            // wx.navigateTo({
            //     url: `/pages/activity/activity?aid=${scene}`,
            // })
            if (scene.indexOf('a_') >= 0) { //活动
                wx.navigateTo({
                    url: `/pages/activity/activity?aid=${scene.slice(2)}`,
                })
            } else if (scene.indexOf('c_') >= 0) { //签到

            } else {
                wx.navigateTo({
                    url: `/pages/index/index`,
                })
            }
        }
        this._initData()
    },

    goToDetail: function (e) {
        const itemType = e.target.dataset.type || e.currentTarget.dataset.type
        switch (itemType){
          case "activity" :
            wx.navigateTo({
              url: `/pages/activity/activity?aid=${e.target.dataset.id || e.currentTarget.dataset.id}`,
            })
            break;
          case "sign" :
            // wx.navigateTo({
            //   url: `/pages/checkin/checkin?cid=${e.target.dataset.id || e.currentTarget.dataset.id}`,
            // })
            break;
          default:
            break;
        }
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
                const datas = res.data.list.map(function (el, index) {
                    var data = Object.assign({
                    },{
                        id: el.ID,
                        'type': el.DataType,
                        imgUrl: app.resourseUrl + el.CoverURL,
                        name: el.Name,
                        location: el.Address,
                        time: el.StartTime,
                        desc: el.Desc,
                        isShowDetail: index === 0,
                        organisation: el.OrgName
                    })
                    return data
                })
                this.setData({
                    items: datas
                })
            },
            complete() {
                wx.hideNavigationBarLoading()
                wx.stopPullDownRefresh()
            }
        })
    },

    showItemDetail(e) {
        const datas = this.data.items,
            index = e.target.dataset.index||e.currentTarget.dataset.index
        datas[index].isShowDetail = !datas[index].isShowDetail
        this.setData({
            items: datas
        })
    }
})