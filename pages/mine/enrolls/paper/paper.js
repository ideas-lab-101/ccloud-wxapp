const app = getApp();
import Poster from 'wxa-plugin-canvas/poster/poster';

Page({
  data: {
    value: '',
    fgColor: 'black',
  },

  onLoad: function (options) {
    this.eid = options.eid

    app.user.isLogin(token => {
      this._initData()
    })
  },

  _initData: function () {
    wx.showLoading({
      title: '请求数据...',
    })
    wx.request({
      url: app.api.enrollPaper,
      method: 'GET',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        enrollID: this.eid,
        token: app.user.authToken
      },
      success: res => {
        console.log(res.data);
        this.setData({
          content: res.data,
          value: res.data.info.EnrollCode
        }, () => {

          /**
           * 开始绘制
           */
          this.previewImage()
              .then(() => {
                this.initPoster()
              })
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
  showErrorModal: function(msg = '未知错误，重试一下吧~') {
    wx.showModal({
      title: '出错了',
      content: msg,
      showCancel: false,
      confirmText: '知道了'
    })
  },


  /**
   * 展示二维码
   * @returns {Promise<unknown>}
   */
  previewImage() {
    return new Promise(resolve => {

      const that = this.selectComponent('#qrcode')
      wx.canvasToTempFilePath({
        canvasId: 'wux-qrcode',
        success: (res) => {

          this.setData({ imageCode: res.tempFilePath }, () => {
            resolve()
          })

        }
      }, that)

    })
  },


  /**
   * 导出图片
   * @param e
   */
  initPoster() {
    const equipment = this.getSystemInfo()
    const { content, imageCode } = this.data

    const images = [
      {
        width: 250,
        height: 250,
        x: 240,
        y: 670,
        zIndex: 100,
        url: imageCode,
      },
      {
        width: 750,
        height: 1100,
        x: 0,
        y: 0,
        url: content.bgImg,
      }
    ]

    const posterConfig = {
      width: 750,
      height: 1334,
      backgroundColor: '#1596f2',
      hideLoading: false,
      debug: false,
      pixelRatio: equipment.pixelRatio,
      blocks: [],
      texts: [
        {
          x: 60,
          y: 80,
          baseLine: 'middle',
          text: content.info.ActivityName,
          fontSize: 38,
          color: '#ffffff',
          zIndex: 200,
          width: 750 - 120,
          lineNum: 2,
          fontWeight: 'bold'
        },
        {
          x: 100,
          y: 300,
          baseLine: 'middle',
          text: content.info.FeeName,
          fontSize: 34,
          color: '#000000',
          zIndex: 200,
          width: 750 - 200,
          fontWeight: 'bold'
        },
        {
          x: 100,
          y: 380,
          fontSize: 32,
          baseLine: 'middle',
          text: '姓名',
          lineNum: 1,
          color: '#999999',
          zIndex: 200,
          width: 750 - 200
        },
        {
          x: 100,
          y: 420,
          fontSize: 32,
          baseLine: 'middle',
          text: content.info.name,
          lineNum: 1,
          color: '#000000',
          zIndex: 200,
          width: 750 - 200
        },
        {
          x: 100,
          y: 480,
          fontSize: 32,
          baseLine: 'middle',
          text: '电话',
          lineNum: 1,
          color: '#999999',
          zIndex: 200,
          width: 750 - 200
        },
        {
          x: 100,
          y: 530,
          fontSize: 32,
          baseLine: 'middle',
          text: content.info.tel,
          lineNum: 1,
          color: '#000000',
          zIndex: 200,
          width: 750 - 200
        },
        {
          x: 300,
          y: 970,
          fontSize: 28,
          baseLine: 'middle',
          text: '长按保存',
          lineNum: 1,
          color: '#999999',
          zIndex: 200,
          width: equipment.screenWidth
        },
      ],
      images: images
    }

    this.data.posterConfig = posterConfig
    this.onCreatePoster()
  },
  /**
   * 异步生成海报
   */
  onCreatePoster() {
    const { posterConfig } = this.data
    wx.showLoading({
      title: `二维码生成中...`,
      mask: true
    })
    this.setData({ posterConfig }, () => {
      Poster.create(true);    // 入参：true为抹掉重新生成
    });
  },

  /**
   * 生成二维码回调函数
   * @param e
   */
  onPosterSuccess(e) {
    const { detail } = e;
    this.setData({
      posterUrl: detail
    })
    wx.hideLoading()
  },
  onPosterFail(err) {
    console.error(err);
    wx.hideLoading()
  },


  getSystemInfo() {
      try {
        const systemInfo = wx.getSystemInfoSync()
        console.log(systemInfo)
        return systemInfo
      } catch(e) { /* Ignore */ }
  }
})