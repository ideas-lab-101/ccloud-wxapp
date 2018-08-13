const utils = require('../../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
      attach_id: 0,
      video: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let id = options.attach_id
      this.setData({
          attach_id: id
      })

      this.get_data()
  },

  get_data() {
      wx.showLoading({
          title: '加载中...',
          mask: true
      })
      wx.request({
          url: app.api.getAttachInfo,
          header: {
              'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
              attachID: this.data.attach_id
          },
          success: (res) => {
              let attachInfo = res.data.data
              attachInfo.FileSize = attachInfo.AttachSize ? utils.formartFileSize(attachInfo.AttachSize) : '未知大小'
              //如果附件不是视频类型，关闭此页面
              if (attachInfo.AttachType.indexOf('video/') >= 0){
                  this.setData({
                      video: attachInfo
                  })
              }else{
                  wx.navigateBack(1)
              }
          }, complete: () => {
              wx.hideLoading()
          }
      })
  },

//   _getSizeString(bytes) {
//       if (bytes > 1024) {
//           if (bytes > 1024 * 1024) {
//               // 以MB为单位
//               return (bytes / 1024 / 1024).toFixed(2) + 'MB'
//           } else {
//               // 以KB为单位
//               return (bytes / 1024).toFixed(2) + 'KB'
//           }

//       } else {
//           return bytes + 'B'
//       }
//   },

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
})