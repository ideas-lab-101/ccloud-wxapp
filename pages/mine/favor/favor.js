const utils = require('../../../utils/util.js')

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    objectType: [],
    current: 0,
    code: '',
    favors: [],
    pager: {
      totalRow: 0,
      pageNumber: 0,
      lastPage: true,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getObjectType().then(() => {
      this._initData()
    })

  },

  getObjectType: function () {
    return new Promise((resolve, reject) =>{
      wx.request({
        url: app.api.objectType,
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
        },
        success: res => {
          this.setData({
            objectType: res.data.list,
            code: res.data.list[this.data.current].ObjectCode
          })
          resolve()
        },
        fail: error => {
          reject()  
        },
        complete: () => {

        }
      }) 
    })
  },

  goDetail: function(e){
    const id = e.currentTarget.dataset.id
    switch (this.data.code){
      case 'activity':
        wx.navigateTo({
          url: '/pages/activity/activity?aid=' + id,
        })
        break;
      case 'info':
        wx.navigateTo({
          url: '/pages/infos/infobook/infobook?gid=' + id,
        })
        break;
      case 'vote':
        wx.navigateTo({
          url: '/pages/vote/vote?vid=' + id,
        })
        break;
      default:
        break;
    }
  },

  changeTypeEvent: function (e) {
    const index = e.currentTarget.dataset.index
    const code = e.currentTarget.dataset.code
    this.setData({
      current: index,
      code: code,
      favors: [],
      'pager.pageNumber': 0,
      'pager.lastPage': true
    })
    this._initData()
  },

  onReachBottom: function () {
    if (this.data.pager.lastPage) {
      return false
    }
    this.setData({
      'pager.pageNumber': this.data.pager.pageNumber + 1
    })
    this._initData()
  },

  _initData: function () {
    wx.showLoading({
      title: '请求数据...',
    })
    wx.request({
      url: app.api.favorList,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: app.user.authToken,
        type: this.data.code,
        pageIndex: this.data.pager.pageNumber,
        pageSize: 10
      },
      success: res => {
        this.setData({
          favors: this.data.favors.concat(res.data.list.map(favor => {
            favor.CoverURL = app.resourseUrl + favor.CoverURL
            favor.FormartTime = utils.convertTime(favor.AddTime)
            return favor
          })),
          "pager.totalRow" : res.data.totalRow,
          "pager.lastPage" : res.data.lastPage
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

  cancelFavorEvent: function(e){
    const id = e.currentTarget.dataset.id
    const type = e.currentTarget.dataset.type
    const index = e.currentTarget.dataset.index
    wx.showLoading({
      title: '请求数据...',
    })
    wx.request({
      url: app.api.userFavor,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: app.user.authToken,
        type: type,
        dataID: id
      },
      success: res => {
        this.data.favors.splice(index, 1)
        this.setData({
          favors: this.data.favors
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


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
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