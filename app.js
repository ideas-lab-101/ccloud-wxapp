const User = require('/utils/user.class')
const Pages = require('/utils/pages.class')
const HOST = "https://ccloud.ideas-lab.cn/wxss";

App({
    onLaunch: function () {
        var app = this
        wx.getSystemInfo({
            success: function (res) {
                app.globalData.deviceHeight = res.windowHeight
                app.globalData.deviceWidth = res.windowWidth
            },
        })
    },
    user: new User(),
    pages: new Pages(),
    setPageMore(pageModel, pageData) {
        if (pageData.totalRow <= 0) {
            pageModel.setData({
                noData: true,
                noMore: false,
                hasMore: false,
            })
        }
        if (pageData.lastPage || pageData.totalRow == 0) {
            pageModel.setData({
                noMore: true,
                hasMore: false,
                moreDataText: "没有更多了"
            })
        } else {
            pageModel.setData({
                hasMore: true
            })
        }
        pageModel.setData({
            isLoading: false
        })
    },
    getToken() {
        const app = this
        return new Promise(function (resolve, reject) {
            // 登录
            wx.login({
                success: res => {
                    // 发送 res.code 到后台换取 openId, sessionKey, unionId
                    var code = res.code
                    // 获取用户信息
                    wx.getSetting({
                        success: res => {
                            wx.getUserInfo({
                                success: res => {
                                    // 可以将 res 发送给后台解码出 unionId
                                    app.globalData.userInfo = res.userInfo
                                    wx.getStorage({
                                        key: 'token',
                                        success: function (res) {
                                            app.globalData.token = res.data
                                            resolve()
                                        },
                                        fail: function () {
                                            wx.request({
                                                url: app.baseUrl + 'system/WXSSMain',
                                                method: 'POST',
                                                header: {
                                                    'content-type': 'application/x-www-form-urlencoded'
                                                },
                                                data: {
                                                    userInfo: JSON.stringify(app.globalData.userInfo),
                                                    code: code
                                                },
                                                success: res => {
                                                    if (res.data.result) {
                                                        app.globalData.token = res.data.token
                                                        wx.setStorage({
                                                            key: 'token',
                                                            data: res.data.token
                                                        })
                                                        resolve()
                                                    } else {
                                                        reject(res.data.msg || '网络连接失败')
                                                    }
                                                },
                                                fail: error => {
                                                    reject(error)
                                                }
                                            })
                                        }
                                    })
                                },
                                fail: function () {
                                    wx.showModal({
                                        title: '提示',
                                        content: '需要授权登录才能继续使用，是否重新登录？',
                                        success: function (res) {
                                            if (res.confirm) {
                                                if (wx.openSetting) {//当前微信的版本 ，是否支持openSetting
                                                    wx.openSetting({
                                                        success: (res) => {
                                                            if (res.authSetting["scope.userInfo"]) {//如果用户重新同意了授权登录
                                                                wx.getUserInfo({//跟上面的wx.getUserInfo  sucess处理逻辑一样
                                                                    success: function (res) {// 可以将 res 发送给后台解码出 unionId
                                                                        app.globalData.userInfo = res.userInfo
                                                                        wx.request({
                                                                            url: app.baseUrl + 'system/WXSSMain',
                                                                            method: 'POST',
                                                                            header: {
                                                                                'content-type': 'application/x-www-form-urlencoded'
                                                                            },
                                                                            data: {
                                                                                userInfo: JSON.stringify(app.globalData.userInfo),
                                                                                code: code
                                                                            },
                                                                            success: res => {
                                                                                if (res.data.result) {
                                                                                    app.globalData.token = res.data.token
                                                                                    resolve()
                                                                                } else {
                                                                                    reject(res.data.msg || '网络连接失败')
                                                                                }
                                                                            },
                                                                            fail: error => {
                                                                                reject(error)
                                                                            }
                                                                        })

                                                                    }
                                                                })
                                                            } else {//用户还是拒绝
                                                                app.fail()
                                                            }
                                                        },
                                                        fail: function () {//调用失败，授权登录不成功
                                                            app.fail()
                                                        }
                                                    })
                                                } else {
                                                    app.fail()
                                                }
                                            }
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        })
    },
    fail() {
        wx.showModal({
            title: '授权失败',
            content: '很遗憾，我们不能为你提供完整服务了',
            showCancel: false
        })
    },
    api: {
        login: HOST + '/system/WXSSMain',
        index: HOST + '/system/index'
    },
    baseUrl: 'https://ccloud.ideas-lab.cn/wxss/',
    // baseUrl: 'http://test.ideas-lab.cn/wxss/',
    resourseUrl: 'https://ccloud.ideas-lab.cn/resource/',
    // resourseUrl: 'https://test.ideas-lab.cn/resource/ccloud/',
    globalData: {
        userInfo: null
    }
})