class User {
    constructor() {
        try {
            let authToken = wx.getStorageSync('authToken')
            if (authToken) {
                this.authToken = authToken
            } else {
                throw false;
            }
        } catch (e) {
            this.authToken = false
        }

        try {
            let userInfo = wx.getStorageSync('userInfo')
            if (userInfo) {
                this.userInfo = userInfo
            } else {
                throw false;
            }
        } catch (e) {
            this.userInfo = null
        }
    }

    /**
     * 是否登录过
     * 
     * @returns boolean
     * @memberof User
     */
    isLogin() {
        return this.authToken
    }

    /**
     * 检测用户是否登录，未登录进行登录操作
     * 
     * @param {any} cb (authToken)
     * @memberof User
     */
    checkLogin(cb) {
        try {
            let authToken = wx.getStorageSync('authToken')
            if (authToken) {
                typeof cb == "function" && cb(authToken)
            } else {
                throw false;
            }
        } catch (e) {
            this.getAuthToken(res => {
                typeof cb == "function" && cb(res)
            })
        }
    }

    /**
     * 获取用户AuthToken
     * 
     * @param {any} cb (authToken)
     * @memberof User
     */
    getAuthToken(cb) {
        var that = this
        this._getWxUserInfo((userInfo, code) => {
            that._goLogin(code, userInfo, authToken => {
                typeof cb == "function" && cb(authToken)
            });
        });
    }

    /**
     * 用户登录
     * 
     * @param {any} code 
     * @param {any} userInfo 
     * @param {any} cb (authToken)
     * @memberof User
     */
    _goLogin(code, userInfo, cb) {
        wx.showNavigationBarLoading()
        wx.request({
            url: getApp().api.login,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                userInfo: JSON.stringify(userInfo),
                code: code
            },
            method: 'POST',
            success: res => {
                if (res.data.code == 1) {
                    wx.setStorageSync('userInfo', res.data.user)
                    this.userInfo = res.data.user
                    wx.setStorageSync('authToken', res.data.token)
                    this.authToken = res.data.token
                    typeof cb == "function" && cb(res.data.token)
                } else {
                    wx.showModal({
                        content: '登录失败',
                        showCancel: false
                    })
                }
            },
            complete: function () {
                wx.hideNavigationBarLoading();
                // wx.hideLoading();
            }
        })
    }

    /**
     * 获取微信用户信息
     * 
     * @param {any} cb (userInfo, code)
     * @memberof User
     */
    _getWxUserInfo(cb) {
        //调用登录接口
        wx.login({
            success: res => {
                var code = res.code;
                wx.getUserInfo({
                    success: res => {
                        typeof cb == "function" && cb(res.userInfo, code)
                    },
                    fail: res => {
                        wx.showModal({
                            content: '您拒绝了用户授权，如需重新授权，请到个人中心点击立即登录按钮授权！',
                            confirmText: '立即前往',
                            success: res => {
                                if (res.confirm) {
                                    wx.switchTab({
                                        url: '/pages/mine/mine',
                                    })
                                } else if (res.cancel) { }
                            }
                        })
                    }
                })
            }
        })
    }
}
module.exports = User;