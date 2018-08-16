import {
  $wuxActionSheet,
  $wuxToptips,
  $wuxBackdrop,
  $wuxDialog
} from '../../../../components/wux/index'
const qiniuUploader = require("../../../../utils/qiniuUploader.js")
const utils = require('../../../../utils/util.js')

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noticeContent: {
      isNoticeShow: false,
      title: '附件管理说明'
    },
    isPreview: false
  },
  imageFileCount: 0, // 已上传的图片类型附件数量
  videoFileCount: 0, // 已上传的视频类型附件数量
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.eid = options.eid
    this.setData({
      isPreview: options.prev === 'true'
    })
    app.user.isLogin(token => {
      this._initData(options.eid)
    })
  },
  addAttachment() {
    if (this.data.isPreview) {
      wx.showModal({
        title: '提示',
        content: '活动已归档',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }
    // 校验上传次数
    if (this.opInfo.opCount >= this.opInfo.opLimit) {
      wx.showModal({
        title: '添加失败',
        content: '上传附件次数已超过限制',
        showCancel: false
      })
      return
    }
    const that = this
    $wuxActionSheet().showSheet({
      titleText: '请选择附件类型',
      buttons: [{
          text: '图片',
          method: '_uploadImage'
        },
        {
          text: '视频',
          method: '_uploadVideo'
        }
      ],
      buttonClicked(index, item) {
        if (that.qiNiuToken) {
          that[item.method]()
        } else {
          that._getUploadToken(that[item.method])
        }
        return true
      },
      cancelText: '取消',
      cancel() {}
    })
  },
  _getUploadToken(callback) {
    wx.request({
      url: app.api.getUploadToken,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {},
      success: res => {
        if (res.data.upToken) {
          this.qiNiuToken = res.data.upToken
          typeof callback === 'function' && callback()
        } else {
          this._showToptips('出错了，重试一下吧')
        }
      },
      fail: error => {
        this._showToptips('出错了，重试一下吧')
      }
    })
  },
  _uploadImage() {
    // 校验附件数量
    if (this.imageFileCount >= this.opInfo.picLimit) {
      this._showToptips(`最多可上传${this.opInfo.picLimit}份图片附件`)
      return false
    }
    const that = this
    // 选择图片
    wx.chooseImage({
      count: 1,
      success: function(res) {
        // 1. 限制文件大小
        const imageSize = res.tempFiles[0].size
        if (imageSize > that.opInfo.picSize * 1024 * 1024) {
          wx.showModal({
            title: '上传失败',
            content: '所选图片大小不能大于' + that.opInfo.picSize + 'M',
            showCancel: false
          })
          return
        }
        // 2. 文件命名
        const filePath = res.tempFilePaths[0]
        let filePathArr = filePath.split('.')
        const fileType = filePathArr[filePathArr.length - 1]
        const timeStamp = utils.formatTime(new Date())
        const fileName = `${timeStamp}.${fileType}`
        // 交给七牛上传
        wx.showLoading({
          title: '上传中...',
          mask: true
        })
        qiniuUploader
          .upload(filePath, (uploadRes) => {
            // console.log(uploadRes.imageURL, uploadRes.key)
            const attachInfo = {
              AttachName: fileName,
              AttachSize: imageSize,
              AttachDesc: '',
              AttachURL: uploadRes.imageURL,
              AttachKey: uploadRes.hash
            }
            that._setAttachment(attachInfo, 1)
          }, (error) => {
            wx.hideLoading()
            that._showToptips('上传失败，请重试')
          }, {
            uploadURL: app.qiniuUploadUrl,
            region: 'SCN',
            domain: app.qiniuDomain,
            key: `${app.user.authToken}/${that.eid}/${fileName}`,
            uptoken: that.qiNiuToken
          })
      }
    })
  },
  _uploadVideo() {
    // 校验附件数量
    if (this.videoFileCount >= this.opInfo.videoLimit) {
      this._showToptips(`最多可上传${this.opInfo.videoLimit}份视频附件`)
      return false
    }
    const that = this
    wx.chooseVideo({
      sourceType: ['album'],
      compressed: true,
      camera: 'back',
      success: function(res) {
        console.log(res)
        // 1. 限制视频长度
        const fileSize = res.size,
          videoDuration = res.duration
        if (videoDuration > that.opInfo.videoLength * 60) {
          wx.showModal({
            title: '上传失败',
            content: '所选视频长度不能超过' + that.opInfo.videoLength + '分钟',
            showCancel: false
          })
          return
        }
        // 2. 文件命名
        const filePath = res.tempFilePath
        let filePathArr = filePath.split('.')
        const fileType = filePathArr[filePathArr.length - 1]
        const timeStamp = utils.formatTime(new Date())
        const fileName = `${timeStamp}.${fileType}`
        // 交给七牛上传
        wx.showLoading({
          title: '上传中...',
          mask: true
        })
        qiniuUploader
          .upload(filePath, uploadRes => {
            // console.log(uploadRes)
            const attachInfo = {
              AttachName: fileName,
              AttachSize: fileSize,
              AttachDesc: '',
              AttachURL: uploadRes.imageURL,
              AttachKey: uploadRes.hash
            }
            that._setAttachment(attachInfo, 1)
          }, (error) => {
            wx.hideLoading()
            that._showToptips('上传失败，请重试')
          }, {
            uploadURL: app.qiniuUploadUrl,
            region: 'SCN',
            domain: app.qiniuDomain,
            key: `${app.user.authToken}/${that.eid}/${fileName}`,
            uptoken: that.qiNiuToken
          }, res => {
            console.log('上传进度', res.progress)
            console.log('已经上传的数据长度', res.totalBytesSent)
            console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
          })
      }
    })
  },
  _setAttachment(attachInfo, opType) {
    // opType(1 - 新增；2 - 修改；0 - 删除)
    // console.log(attachInfo)
    wx.request({
      url: app.api.setEnrollAttachment,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: app.user.authToken,
        enrollID: this.eid,
        opType: opType,
        attachInfo: JSON.stringify(attachInfo)
      },
      success: res => {
        //console.log(res.data)
        if (res.data.result) {
          $wuxToptips().success({
            hidden: !0,
            text: res.data.msg,
          })
          this._initData()
        } else {
          this._showToptips('出错了，重试一下吧')
        }
      },
      fail: error => {
        this._showToptips('出错了，重试一下吧')
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },
  // validators: {},
  // validationMsgs: {},
  // _initValidate() {
  //     this.WxValidate = new WxValidate(this.validators, this.validationMsgs)
  // },
  _showToptips(error) {
    const hideToptips = $wuxToptips().show({
      timer: 3000,
      text: error.msg || error || '操作错误',
      hidden: true,
      success: () => {}
    })
  },
  _initData() {
    var that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      url: app.api.getAttachList,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: app.user.authToken,
        enrollID: this.eid
      },
      success: res => {
        this.opInfo = res.data.opInfo
        let imageFileCount = 0,
          videoFileCount = 0;
        let attachments = res.data.list.map(attachment => {
          attachment.fileType = attachment.AttachType.split('/')[0]
          if (attachment.fileType === 'image') {
            imageFileCount++
          } else if (attachment.fileType === 'video') {
            videoFileCount++
          }
          attachment.fileSize = attachment.AttachSize ? utils.formartFileSize(attachment.AttachSize) : '未知大小'
          return attachment
        })
        this.imageFileCount = imageFileCount
        this.videoFileCount = videoFileCount
        this.setData({
          attachments: attachments
        })
      },
      fail: error => {
        this._showToptips('出错了，重试一下吧')
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  moreOpts(e) {
    const that = this
    const index = e.currentTarget.dataset.index
    const actionConfig = ({
      titleText: '附件操作',
      buttons: [{
          text: '查看附件',
          method: '_queryAttachment',
          args: [that.data.attachments[index]]
        },
        {
          text: '附件描述',
          method: '_editAttachmentDesc',
          args: [that.data.attachments[index]]
        }
      ],
      buttonClicked(index, item) {
        that[item.method].apply(that, item.args)
        // item.method.call(that, item.args)
        return true
      },
      cancelText: '取消',
      cancel() {}
    })
    if (!this.data.isPreview) {
      actionConfig.destructiveText = '删除附件';
      actionConfig.destructiveButtonClicked = function() {
        wx.showModal({
          title: '删除附件',
          content: '确定删除该附件吗？',
          success: res => {
            if (res.confirm) {
              that._setAttachment(that.data.attachments[index], 0)
            }
          }
        })
        return true
      };
    } else {
      actionConfig.destructiveText = ''
      actionConfig.destructiveButtonClicked = null
    }
    $wuxActionSheet().showSheet(actionConfig);
  },
  _editAttachmentDesc(attachInfo) {
    const that = this
    $wuxDialog().prompt({
      title: '请输入附件描述',
      content: '不超过200个字',
      defaultText: attachInfo.AttachDesc,
      placeholder: '',
      maxlength: 200,
      onConfirm(e, response) {
        // const content = that.data.$wux.dialog.prompt.response
        attachInfo.AttachDesc = response
        that._setAttachment(attachInfo, 2)
      },
    })
  },
  _queryAttachment(attachInfo) {
    const that = this
    if (attachInfo.AttachType.indexOf('image/') >= 0) {
      wx.previewImage({
        urls: [attachInfo.AttachURL]
      })
    } else if (attachInfo.AttachType.indexOf('video/') >= 0) {
      wx.navigateTo({
        url: '/pages/system/video/video?attach_id=' + attachInfo.AttachID
      })
    }
  },

  showInfo() {
    $wuxBackdrop().retain()
    let message = `可上传图片文件${this.opInfo.picLimit}张`
    message += `，图片大小限制${this.opInfo.picSize}M`
    message += `，可上传视频文件${this.opInfo.videoLimit}份`
    message += `，视频时长限制${this.opInfo.videoLength}分钟。`
    this.setData({
      'noticeContent.content': message,
      in: true
    })
  },

  closeInfoLayerEvent(e) {
    $wuxBackdrop().release()
    this.setData({ in: false
    })
  },
})