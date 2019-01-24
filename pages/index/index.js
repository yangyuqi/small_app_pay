
//获取应用实例
const app = getApp()
var interval = null //倒计时函数
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    time: '获取验证码', //倒计时 
    currentTime: 61,
    phone: "",
    code: "",
    ishow: true,
    getCode:"",
    getopenId:"",
    nikeName:""

  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      // url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        nickName: app.globalData.userInfo.nickName
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          nickName: res.userInfo.nickName
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
            nickName: res.userInfo.nickName
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  sendCodeNum: function () {
    this.setData({
      disabled: true
    })
    this.getCode();
  },

  getCode: function (options) {
    var that = this;
    var currentTime = that.data.currentTime
    if (!this.data.phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'loading'
      })
      return
    }

    if (interval == null) {
      interval = setInterval(function () {
        currentTime--;
        that.setData({
          time: currentTime + '秒'
        })

        if (currentTime <= 0) {
          clearInterval(interval)
          that.setData({
            time: '重新发送',
            currentTime: 61,
            disabled: false
          })
        }
      }, 1000)
    }

    wx.request({
      url: 'https://paydo.ughen.cn/wx/message/sendMessage',
      method:"post",
      data: {
        "mobile": that.data.phone,
        "type":"Register"
      },
      header: {
        "Content-Type": "application/json"
      }, 
      success:function(res){
        that.setData({
          getCode :res.data.data.code
        })
      },

      fail:function(res){
      }

    })
  },

  dologin: function () {
    var self =this
    if (!self.data.phone){
      wx.showToast({
        title: '请输入手机号',
        icon:'loading'
      })
      return
    }

    if (!self.data.code) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'loading'
      })
      return
    }
    if (self.data.code != self.data.getCode){ 
      wx.showToast({
        title: '验证码不一致',
        icon: 'loading'
      })
      return
    }
    if (!self.data.nickName){
      wx.showToast({
        title: '请先给应用授权',
        icon: 'loading'
      })
      return
    }

    wx.request({
      url: 'https://paydo.ughen.cn/wxUser/register',
      method:"post",
      data:{
        "userIdEntity": self.data.getopenId,
        "phone": self.data.phone,
        "type":0,
        "nikeName": self.data.nickName
      },
      header: {
        "Content-Type": "application/json"
      },

      success:function(res){
        if(res.data.code==200){
          wx.navigateTo({
            url: '../code/index?getopenId=' + self.data.getopenId + "&userId=" + res.data.stuId,
          })
        }
      },

      fail:function(res){
      
      }
    })

  },
  getPhone: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },

  getMyCode: function (e) {
    this.setData({
      code: e.detail.value
    })
  },

  onShow:function(){
    var self = this
    app.userCodeReadyCallback = function (res) {
      wx.request({
        url: "https://paydo.ughen.cn/wxUser/getUserIdEntity",
        method: 'post',
        data:{
          "code": res,
          "platformType":0
        },
        header: {
          "Content-Type": "application/json"
        }, 
        success: function (e) {
          if (e.data.openId){
              self.setData({
              getopenId: e.data.openId
            })
          }

          if (!e.data.stuList.length) {
               self.setData({
               ishow:false
             })
          }else{
            wx.redirectTo({
              url: '../code/index?getopenId=' + e.data.openId + "&userId=" + e.data.stuList[0].id,
            })
          }
        }
      })
    }
  },

  onHide:function(){
    this.setData({
      ishow: true
    })
  },
  closeDialog:function(){
    this.setData({
      ishow:true
    })
  },
  notDialog:function(){
    this.setData({
      ishow: false
    })
  }
})
