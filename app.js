const Version = '1.8.8';
const User = require('/utils/user')
const Pages = require('/utils/pages')
//const HOST = "https://ccloud.ideas-lab.cn/";
const HOST = "http://web.tunnel.cdqidi.cn/";

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
    resourseUrl: HOST+ 'resource/',
    // resourseUrl: HOST + 'resource/ccloud/',
    qiniuUploadUrl: 'https://up-z2.qbox.me',
    qiniuDomain: 'http://cloud.ideas-lab.cn/',
    globalData: {

    },
    user: new User(),
    pages: new Pages(),
    api: {
      //系统类
      login: HOST + 'wxss/system/WXSSMain',
      index: HOST + 'wxss/system/index',
      mainList: HOST + 'wxss/system/mainList',
      getUploadToken: HOST + 'wxss/system/GetUploadToken',
      feedback: HOST + "wxss/system/Feedback",
      getShareCode: HOST + "wxss/system/GetWXSSCode",
      scanCodeLogin: HOST + "wxss/system/ScanLogin",
      getSystemNotice: HOST + "wxss/system/GetSystemNotice",
      //账户类
      accountInfo: HOST + "wxss/user/GetAccountInfo",
      uploadPhoto: HOST + 'wxss/user/UploadPhoto',
      enrollList: HOST + 'wxss/user/GetEnrollList',
      userFavor: HOST + 'wxss/user/userFavor',
      userFollow: HOST + 'wxss/user/userFollow',

      //基础数据
      provinces: HOST + 'wxss/activity/GetActivityScope',
      cities: HOST + 'wxss/system/GetCityList',
      districts: HOST + 'wxss/system/GetDistricts',
      enumValues: HOST + 'wxss/system/GetEnumDetail',
      search: HOST + 'wxss/system/Search',
      hotSerach: HOST + 'wxss/system/GetHotSearch',
      searchTip: HOST + 'wxss/system/SearchTip',
      //活动相关
      catalog: HOST + 'wxss/activity/GetCatalogIndex',
      activityList: HOST + 'wxss/activity/GetActivityList',
      enroll: HOST + 'wxss/activity/UserEnroll',
      activityInfo: HOST + 'wxss/activity/GetActivityInfo',
      feeList: HOST + 'wxss/activity/GetFeeList',
      activityEnroll: HOST + 'wxss/activity/GetActivityEnroll',
      updateEnroll: HOST + 'wxss/activity/UpdateEnrollInfo',
      enrollInfo: HOST + 'wxss/activity/GetEnrollInfo',
      getAttachList: HOST + 'wxss/activity/GetEnrollAttach',
      getAttachInfo: HOST + 'wxss/activity/GetAttachInfo',
      setEnrollAttachment: HOST + 'wxss/activity/SetEnrollAttach',
      getGroupEnrollList: HOST + 'wxss/activity/GetGroupEnrollList',
      //支付相关
      wxPay: HOST + 'wxss/pay/wxPay',
      rePay: HOST + 'wxss/pay/wx_repay',
      //留言相关
      getCommentList: HOST + 'wxss/comment/GetCommentList',
      postComment: HOST + 'wxss/comment/PostComment',
      delComment: HOST + 'wxss/comment/DelComment',
      //资讯相关
      getInfoContent: HOST + 'wxss/info/GetInfoContent',
      getInfoList: HOST + 'wxss/info/GetInfoList',
      //消息相关
      getMessageList: HOST + 'wxss/message/GetMessageList',
      readMessage: HOST + 'wxss/message/SetMessage',
      //互动相关
      getInteractActivity: HOST + 'wxss/interact/getInteractActivity'
    },
})