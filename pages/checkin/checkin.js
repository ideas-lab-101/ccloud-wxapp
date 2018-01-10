//获取应用实例
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        activities: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // options 中的 scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
        // var scene = decodeURIComponent(options.scene)
        // if (scene !== 'undefined') {
        //     wx.navigateTo({
        //         url: `/pages/checkin/detail/detail?cid=${scene}`,
        //     })
        // }
        this._initData()
    },

    goToDetail: function(e) {
        console.log(e.target.dataset.cid || e.currentTarget.dataset.cid)
        wx.navigateTo({
            url: `/pages/checkin/detail/detail?cid=${e.target.dataset.cid || e.currentTarget.dataset.cid}`,
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    swiperChange: function(e) {
        this.setData({
            bgImgUrl: this.data.activities[e.detail.current]
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    // onPullDownRefresh: function () {

    // },

    _initData: function() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        wx.request({
            url: app.baseUrl + 'attendance/GetAttendanceList',
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {},
            success: res => {
                wx.hideLoading()
                const activities = res.data.list.map(function(el, index) {
                    return {
                        id: el.AttendanceID,
                        imgUrl: app.resourseUrl + el.AttachURL,
                        name: el.AttendanceName,
                        // location: el.Address
                        desc: el.Desc
                    }
                })
                this.setData({
                    activities: activities
                })
            },
            fail: error => {
                wx.hideLoading()
            }
        })
    }
})