class SystemEnum {

  constructor(options = {}) {
    Object.assign(this, {
      options,
    })
  }

  app = getApp()
  
  genders = [] //性别
  _getGenderData() {
    wx.request({
      url: this.app.api.enumValues,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        masterID: 23
      },
      success: res => {
        if (res.data.list) {
          this.genders = res.data.list.map(function (el, index) {
            return {
              text: el.Caption
            }
          })
        } else {
          // this._showToptips('出错了，重试一下吧')
        }
      },
      fail: error => {
        // this._showToptips('出错了，重试一下吧')
      }
    })
  }
  nations= [] //国家
  _getNationData(callback) {
    wx.request({
      url: this.app.api.enumValues,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        masterID: 26
      },
      success: res => {
        if (res.data.list) {
          this.nations = res.data.list.map(function (el, index) {
            return el.Caption
          })
          callback()
          // this.setData({
          //   nations: this.nations
          // })
        } else {
          // this._showToptips('出错了，重试一下吧')
        }
      },
      fail: error => {
        // this._showToptips('出错了，重试一下吧')
      }
    })
  }

  provinces= [] // 省
  _getProvincesData(aid, callback) {
    wx.request({
      url: this.app.api.provinces,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        activityID: aid
      },
      success: res => {
        this.provinces = res.data;
        callback()
        // this.setData({
        //   provinces: this.provinces
        // })
      },
      fail: error => {
        // this._showToptips('出错了，重试一下吧')
      }
    })
  }

  cities = []  // 市
  _getCityData(pid, callback) {
    wx.request({
      url: this.app.api.cities,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        provinceID: pid
      },
      success: res => {
        this.cities = res.data.list;
        callback()
        // this.setData({
        //   cities: this.cities
        // })
      },
      fail: error => {
        // this._showToptips('出错了，重试一下吧')
      }
    })
  }

  districts= [] // 区
  _getDistrictData(cid, callback) {
    wx.request({
      url: this.app.api.districts,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        cityID: cid
      },
      success: res => {
        if (res.data.list) {
          this.districts = res.data.list
          callback()
          // this.setData({
          //   districts: this.districts
          // })
        } else {
          // this._showToptips('出错了，重试一下吧')
        }
      },
      fail: error => {
        // this._showToptips('出错了，重试一下吧')
      }
    })
  }

}
export default SystemEnum  