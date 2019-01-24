// pages/code/index.js

var QbCode = require('../../utils/weapp-qrcode.js')
var qrcode; 
var internal = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTime : 5,
    getopenId:"",
    stuId:"",
    equipmentNo:"",
    price:"",
    codeData:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    self.setData({
      stuId: options.userId,
      getopenId: options.getopenId,
      codeData: {
        "stuId": options.userId,
        "openId": options.getopenId,
        "platformType": 0,
        "timeStamp": Date.parse(new Date())/1000
      }
    })
    console.log("--" + options.getopenId)
    qrcode = new QbCode('canvas', {
      text: "" + Date.parse(new Date()) / 1000 + "+" + options.getopenId + "+" + self.data.stuId,
      width: 275,
      height: 275,
      }
    )

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
    var self = this
    if(qrcode!=null){
      self.doLoad()
    }
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },


  doLoad:function(){
    var self = this
      wx.request({
        url: 'https://paydo.ughen.cn/sweep/sentMsgRedis',
        method:"post",
        data:{
          "stuId": this.data.stuId,
          "platformType":0,
          "timestamp": Date.parse(new Date())/1000
        },
        header: {
          "Content-Type": "application/json"
        },
        success:function(res){
            if(res.data.code==200){
              self.doPay(res.data.stuMap.price, res.data.stuMap.equipmentNo)
            }
        },
        fail:function(){
           self.doLoad() 
        }
      })
  },

  doAction:function(){
      var self = this
      wx.request({
        url: 'https://paydo.ughen.cn/sweep/sweepCode',
        method: "post",
        data: {
          "price": 0.01,
          "statusCode": JSON.stringify(self.data.codeData),
          "equipmentNo": "1111"
        },
        header: {
          "Content-Type": "application/json"
        },
        success: function (res) {
          if (res.data.code == 200) {
            self.doPay(res.data.stuMap.price, res.data.stuMap.equipmentNo )
          } else {
            // self.doAction()
          }
        },
        fail:function(){
          wx.showToast({
            title: '失败',
            icon: 'loading'
          })
        }
      })
      },

  doPay: function (price, equipmentNo){
        wx.request({
          url: 'https://paydo.ughen.cn/wxPay/wxOrderNotify',
          method: "post",
          header: {
            "Content-Type": "application/json"
          },
          data: {
            "money": price,
            "userIdentity": this.data.getopenId,
            "userId": this.data.stuId,
            "equipmentNo": equipmentNo
          },
          success: function (res) {
            if (res.data.code = 200) {
              wx.requestPayment({
                timeStamp: "" + res.data.data.timeStamp,
                nonceStr: "" + res.data.data.nonceStr,
                package: "" + res.data.data.package,
                signType: "" + res.data.data.signType,
                paySign: "" + res.data.data.sign,
                appId: res.data.data.appId,
                success: function (res) {
                  if (res.errMgs = "requestPayment:ok") {
                    wx.redirectTo({
                      url: '../success/index',
                    })
                  }
                }
              })
            }
          }

        })
      }
      
})