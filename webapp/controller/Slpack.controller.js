/// <reference types="@openui5/ts-types" /> #
sap.ui.define([
  "com/shunyu/slpack/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/core/Fragment",
  "sap/m/Dialog",
], function (
  BaseController,
  JSONModel,
  MessageBox,
  MessageToast,
  Filter,
  FilterOperator,
  Fragment,
  Dialog
) {
  "use strict";

  return BaseController.extend("com.shunyu.slpack.controller.Slpack", {
    onInit: function () {
      this.getRouter().getRoute("Slpack").attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function (oEvent) {
	 this._onGetMac(); //获取mac地址
      // ...初始化厂区
      var checkokstatus = new JSONModel();
      var checkokstatusdata = {
        checksoktatus: [{
          "factoryName": "B区",
          "factoryCode": "B"
        }, {
          "factoryName": "兰江",
          "factoryCode": "L"
        }, {
          "factoryName": "新基地",
          "factoryCode": "Q"
        }]
      };
      checkokstatus.setData(checkokstatusdata);
      this.getView().setModel(checkokstatus, "checkokmodel");

	  var params = JSON.parse(oEvent.getParameter("arguments").params);
	  console.log(params)
      //抬头物料form model
      var oMaterialModel = new JSONModel(params);
      oMaterialModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
      this.setModel(oMaterialModel, "oMaterialModel");
      this.getView().bindElement({
        path: "/",
        model: "oMaterialModel"
      });

      var that = this;
      var oCustomerModel = this.getModel("ZSY_MM_BULKPACK_SRV");
      var sPath = "/ZSY_S_QM22Set";
      var sQM22Filters = [];
	  sQM22Filters.push(new Filter("Zwerks", FilterOperator.EQ, params.werks));
	  sQM22Filters.push(new Filter("Zmatnr", FilterOperator.EQ, params.material));

      //客户表的model
      var oKunnrModel = new JSONModel();
      oCustomerModel.read(sPath, {
        filters: sQM22Filters,
        success: function (oData) {
          oKunnrModel.setData(oData);
          that.setModel(oKunnrModel, "oKunnrModel");
          that.getView().bindElement({
            path: "/",
            model: "oKunnrModel"
          });
        },
      });
    },
	/**
		 * 获取mac地址
		 */
		_onGetMac: function () {
			// var UserInfo = sap.ushell.Container.getService("UserInfo");
			// console.log(UserInfo);
			var that = this;
			if (/macintosh|mac os x/i.test(navigator.userAgent)) {
				$("#plugin a").attr("href", "sunnyoptical_getmac.dmg")
				$.ajax({
					url: "http://127.0.0.1:19101",
					type: "post",
					timeout: 2000,
					success: function (result) {
						console.log("第一次" + result);
					},
					error: function () {
						$.ajax({
							url: "http://127.0.0.1:29101",
							type: "post",
							timeout: 2000,
							success: function (result) {
								console.log("第二次" + result);
							}
						})
					}
				})
			} else {
				if (this._browserRedirect()) {
					var LODOP; //声明为全局变量 

					function getSystemInfo(strINFOType, callback) {
						//LODOP=getLodop();
						try {
							LODOP = getLodop();
						} catch (e) {}
						if (!LODOP) {
							setTimeout("getSystemInfo('" + strINFOType + "'," + callback + ")", 500);
							return
						}
						if (LODOP.CVERSION) CLODOP.On_Return = function (TaskID, Value) {
							callback(Value.replace(/-/g, ':'))
						};
						var strResult
						try {
							strResult = LODOP.GET_SYSTEM_INFO(strINFOType);
							if (String(strResult).indexOf("-") > 0) {
								strResult = strResult.replace(/-/g, ':')
							}
							if (!LODOP.CVERSION) callback(strResult);
							else return;
						} catch (e) {

						}
					}


					function x(num) {

						if (Number(num) <= 1) {
							return "getSystemInfo('NetworkAdapter." + num + ".PhysicalAddress',function(value){setMac(value)})"
						} else {
							return "getSystemInfo('NetworkAdapter." + num + ".PhysicalAddress',function(value){setMac(value);" + x(--num) + "})"
						}
					}

					function setMac(value) {
						that.macAddress = that.macAddress + value + "|";
						console.log(that.macAddress)
					}

					setTimeout(function () {
						getSystemInfo('NetworkAdapter.Count', function (value) {
							eval(x(value))
						})
					}, 1000);

				}
			}
		},
		_browserRedirect: function () {
			var sUserAgent = navigator.userAgent.toLowerCase();
			var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
			var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
			var bIsMidp = sUserAgent.match(/midp/i) == "midp";
			var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
			var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
			var bIsAndroid = sUserAgent.match(/android/i) == "android";
			var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
			var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
			if (!(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM)) {
				return true;
			}
			return false;
		},
		onNavBack: function (oEvent) {
			this.getRouter().navTo("Index", {}, true);
		},
    onPackNumChange: function (oEvent) {
      var oMaterialModel = this.getModel("oMaterialModel");
      if (!this._isNumber(oEvent.getSource().getValue())) {
        MessageToast.show("输入的格式有误，请重新输入！");
        oEvent.getSource().setValue("");
        return;
      };
      this._setFormData(oEvent.getSource().getValue(), oMaterialModel.oData.packQuantity, oMaterialModel.oData.printBatch);
    },

    onPackQuanChange: function (oEvent) {
      var oMaterialModel = this.getModel("oMaterialModel");
      if (!this._isNumber(oEvent.getSource().getValue())) {
        MessageToast.show("输入的格式有误，请重新输入！");
        oEvent.getSource().setValue("");
        return;
      };
      this._setFormData(oMaterialModel.oData.packNum, oEvent.getSource().getValue(), oMaterialModel.oData.printBatch);
    },

    onPrintBatchChange: function (oEvent) {
      var oMaterialModel = this.getModel("oMaterialModel");
      this._setFormData(oMaterialModel.oData.packNum, oMaterialModel.oData.packQuantity, oEvent.getSource().getValue());
    },

    _setFormData: function (packNum, packQuantity, printBatch) {
      var oMaterialModel = this.getModel("oMaterialModel");
      var oTotal = null;
      if (packNum && packNum != null && packQuantity && packQuantity != null) {
        oTotal = parseInt(packNum) * parseInt(packQuantity);
        if (oMaterialModel.oData.quantity < oTotal) {
          oTotal = null;
          MessageToast.show("打包数量合计不允许超过库存数量，请重新输入！");
        }
      };

      oMaterialModel.setData({
        werks: oMaterialModel.oData.werks,
        lgort: oMaterialModel.oData.lgort,
        umlgo: oMaterialModel.oData.umlgo,
        material: oMaterialModel.oData.material,
        materialName: oMaterialModel.oData.materialName,
        quantity: oMaterialModel.oData.quantity,
        batch: oMaterialModel.oData.batch,
        printBatch: printBatch,
        packNum: packNum,
        packQuantity: packQuantity,
        total: oTotal
      });
    },

    onGenerateHu: function () {
      var that = this;
      var oMaterialModel = this.getModel("oMaterialModel");
      if (!(oMaterialModel.oData.total && oMaterialModel.oData.total != null)) {
        MessageBox.error("请输入打包个数和打包数量！");
        return;
      }

      var ocustomerTable = this.byId("customerTable");
      if (ocustomerTable.getSelectedIndices().length == 0) {
        MessageBox.error("请选择一列客户！");
        return;
      };
      var oKunnrModel = this.getModel("oKunnrModel");

      MessageBox.confirm("确认生成HU标签？", {
        title: "Confirm",
        styleClass: "sapUiSizeCompact",
        actions: [sap.m.MessageBox.Action.YES,
          sap.m.MessageBox.Action.NO
        ],
        emphasizedAction: sap.m.MessageBox.Action.YES,
        textDirection: sap.ui.core.TextDirection.Inherit,
        onClose: function (oAction) {
          if (oAction === sap.m.MessageBox.Action.YES) {
            that._generateHU(oMaterialModel, oKunnrModel.oData.results[ocustomerTable.getSelectedIndices()[0]]);
          }
        }
      });
    },

    _generateHU: function (oMaterialModel, kunnrData) {

      var deepCreate_h2i = [];

      for (var i = 1; i <= oMaterialModel.oData.packNum; i++) {
        var oitem2 = {
          Zxh: i,
          Matnr: oMaterialModel.oData.material,
          Vemng: oMaterialModel.oData.packQuantity,
          Werks: oMaterialModel.oData.werks,
          Lgort: oMaterialModel.oData.lgort,
          Umlgo: oMaterialModel.oData.umlgo,
          Customerid: kunnrData.Zhzf,
          Cmatnr: kunnrData.Zchbzbh,
          Charg: oMaterialModel.oData.batch,
          Ccharg: oMaterialModel.oData.printBatch
        };
        deepCreate_h2i.push(oitem2);
      };

      var oDeep = {
        Zxh: 1,
        deepCreate_h2i: deepCreate_h2i
      };
      var oCreateHuModel = this.getModel("ZSY_MM106_BULK_PACKING_SRV");
      oCreateHuModel.create("/huHeaderSet", oDeep, {
        success: function (oData) {
          console.log(oData);
        },
        error: function (oData, oResponse) {
          MessageBox.error("生成失败，服务器错误！");
        }
      });

      var oHuModel = new JSONModel({
        results: [{
          Exidv: "1000013361",
          Matnr: "PP-TEST-03",
          Vemng: "10"
        }, {
          Exidv: "1000013362",
          Matnr: "PP-TEST-04",
          Vemng: "20"
        }, {
          Exidv: "1000013363",
          Matnr: "PP-TEST-05",
          Vemng: "30"
        }]
      });
      this.setModel(oHuModel, "oHuModel");
    },

    /**
     * 删除HuTable行项目
     * @param {*} oEvent 
     */
    onDeleteHuItem: function (oEvent) {
      var that = this;
      var oHuModel = this.getModel("oHuModel")
      var sPath = oEvent.getSource().getBindingContext("oHuModel").getPath();
      var oHuNumber = oEvent.getSource().getBindingContext("oHuModel").getProperty(sPath).Exidv
      MessageBox.confirm("你确定要删除 " + oHuNumber + " 这项吗？", {
        title: "Confirm",
        styleClass: "sapUiSizeCompact",
        actions: [sap.m.MessageBox.Action.YES,
          sap.m.MessageBox.Action.NO
        ],
        emphasizedAction: sap.m.MessageBox.Action.YES,
        textDirection: sap.ui.core.TextDirection.Inherit,
        onClose: function (oAction) {
          if (oAction === sap.m.MessageBox.Action.YES) {
            // eslint-disable-next-line radix          
            var oIndex = parseInt(sPath.split('/')[sPath.split('/').length - 1]);
            var oHuData = oHuModel.getProperty("/results");
            oHuData.splice(oIndex, 1);
            oHuModel.refresh();
          }
        }
      });
    },

    onPrintBtnPress: function () {
      var oHuModel = this.getModel("oHuModel");
      if (oHuModel == undefined) {
        MessageToast.show("未获取到Hu,请先生成标签");
        return;
      }
      var oHuIndex = this.byId("oHuTable").getSelectedIndices();
      if (oHuIndex.length == 0) {
        MessageToast.show("请至少选择一列Hu进行打印");
        return;
      }
      var oHuModel = this.getModel("oHuModel");
      var oHuData = [];
      for (var i = 0; i < oHuIndex.length; i++) {
        oHuData.push(oHuModel.oData.results[oHuIndex[i]])
      };

      var oPrintHuModel = new JSONModel(oHuData);
      this.getView().setModel(oPrintHuModel, "oPrintHuModel");
      var oView = this.getView();
      var that = this;
      var oPrintInfoModel = this.getModel("ZSY_MM_PRINT_INFO_SRV");
      oPrintInfoModel.read("/ZSY_PRINT_BQMBSet", {
        // filters: [aKunnrFilter],
        success: function (oData) {
          var item = oData.results;
          var oModel = new JSONModel(item);
          that.getView().setModel(oModel, "LabelModel");
        },
        error: function (oResponse) {
          MessageToast.show("未获取到打印模板数据");
        }
      });

      var macAddress = "4C:EB:BD:5E:55:43";
      var aMacFilter = [];
      if (macAddress !== "") {
        //未获取到mac地址，直接通过用户名读取 获取打印机;获取到了mac地址，传入mac地址，获取打印机
        aMacFilter.push(new Filter("Zmaci", FilterOperator.EQ, macAddress));
      }

      // 初始化打印机选择界面
      oPrintInfoModel.read("/ZSY_PRINT_DJYBHSet", {
        filters: aMacFilter,
        success: function (oData) {
          var item = oData.results;
          var oModel = new JSONModel(item);
          that.getView().setModel(oModel, "PrinterModel");
        }
      });

      if (!this.byId("printLabelTag")) {
        Fragment.load({
          id: oView.getId(),
          name: "com.shunyu.slpack.view.Print",
          controller: this
        }).then(function (oDialog) {
          oView.addDependent(oDialog);
          oDialog.open();
        });
      } else {
        this.byId("printLabelTag").open();
      }
    },

    // 标签选择弹窗
    labelHandleValueHelp: function () {
      var that = this;
      Fragment.load({
        name: "com.shunyu.slpack.view.LabelValueHelp",
        controller: this
      }).then(function (oValueHelpDialog) {
        this._oValueHelpDialog = oValueHelpDialog;
        this.getView().addDependent(this._oValueHelpDialog);
        // this._customerconfigValueHelpDialog();
        this._oValueHelpDialog.open();
      }.bind(this));
    },

    // 打印机选择弹窗
    printerHandleValueHelp: function () {
      Fragment.load({
        name: "com.shunyu.slpack.view.PrinterValueHelp",
        controller: this
      }).then(function (oValueHelpDialog) {
        this._oValueHelpDialog = oValueHelpDialog;
        this.getView().addDependent(this._oValueHelpDialog);
        // this._customerconfigValueHelpDialog();
        this._oValueHelpDialog.open();
      }.bind(this));
    },


    labelHandleSearch: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilter = new Filter({
        filters: [
          new Filter({
            path: "Zbqbh",
            operator: FilterOperator.Contains,
            value1: sValue
          }),
          new Filter({
            path: "Zbqgn",
            operator: FilterOperator.Contains,
            value1: sValue
          }),
          new Filter({
            path: "Zbqmc",
            operator: FilterOperator.Contains,
            value1: sValue
          }),
          new Filter({
            path: "Zsfsp",
            operator: FilterOperator.Contains,
            value1: sValue
          })
        ],
        and: false
      });
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter(oFilter);
    },

    // 标签选择后事件
    labelHandleValueHelpClose: function (oEvent) {
      if (oEvent.sId !== "cancel") {
        var printLabel = this.byId("printLabel");
        var labelFunction = this.byId("labelFunction");
        // 获取选中行对象
        var rowData = oEvent.mParameters.selectedItem.mAggregations.cells;
        var labelCode = rowData[0].mProperties.text;
        var labelFunc = rowData[1].mProperties.text;
        printLabel.setValue(labelCode);
        labelFunction.setValue(labelFunc);
      }
    },

    // 打印机选择后事件
    printerHandleValueHelpClose: function (oEvent) {
      if (oEvent.sId !== "cancel") {
        var oInput = this.byId("printer");
        // 获取选中行对象
        var rowData = oEvent.mParameters.selectedItem.mAggregations.cells;
        var selectItem = rowData[0].mProperties.text;
        oInput.setValue(selectItem);
      }
    },

    // 确定打印按钮
    print: function () {
      var printLabel = this.getView().byId("printLabel").getValue();
      var labelFunction = this.getView().byId("labelFunction").getValue();
      var printer = this.getView().byId("printer").getValue();
      var order = this.getView().byId("order").getValue();
      var vendor = this.getView().byId("vendor").getValue();
      var line = this.getView().byId("line").getValue();
      var planVersion = this.getView().byId("planVersion").getValue();
      var inspectorNum = this.getView().byId("inspectorNum").getValue();
      var warehouse = this.getView().byId("warehouse").getValue();
      var inspectionBatch = this.getView().byId("inspectionBatch").getValue();
      var date = this.getView().byId("date").getValue();
      var factory = this.getView().byId("factory").getValue();

      // 校验必填字段
      if ((printLabel === "" || printLabel.length === 0)) {
        MessageToast.show("请选择标签！", {
          at: "center center"
        });
        return false;
      }

      if (printer === "" || printer.length === 0) {
        MessageToast.show("请选择打印机！", {
          at: "center center"
        });
        return false;
      }

      if (date !== "" || date.length > 0) {
        if (!date.match(
            /^(?:(?!0000)[0-9]{4}([-/.]?)(?:(?:0?[1-9]|1[0-2])([-/.]?)(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])([-/.]?)(?:29|30)|(?:0?[13578]|1[02])([-/.]?)31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)([-/.]?)0?2([-/.]?)29)$/
          )) {
          MessageToast.show("日期格式不正确！\n(请选择日期)", {
            at: "center center"
          });
          return false;
        }
      }
      if (factory === "B区") {
        factory = "B";
      } else if (factory === "兰江") {
        factory = "L";
      } else if (factory === "新基地") {
        factory = "Q";
      }

      // 传输给后台的打印对象
      var obj = {
        // 工厂
        "Zwerks": "",
        // 模板编号
        "Zmbmc": printLabel,
        // 标签功能
        "Zbqgn": labelFunction,
        // 打印机编号
        "Zdyjmc": printer,
        // 工单号
        "Zgdh": order,
        // 供应商
        "Zgys": vendor,
        // 线体
        "Zxt": line,
        // 方案版本
        "Zfabb": planVersion,
        // 检验员工号
        "Zjyygh": inspectorNum,
        // 仓别
        "Zcb": warehouse,
        // 检验批
        "Zjyp": inspectionBatch,
        // 日期
        "Zrq": date,
        // 厂区
        "Zcq": factory,
        // HU集合
        "ZSY_LR_I2Set": []
      };

      var oPrintHuData = this.getModel("oPrintHuModel").oData;
      var labelPrintModel = this.getModel("ZSY_FIORI_LABELREDO_SRV");
      var oWerks = "1500";


      for (var i = 0; i < oPrintHuData.length; i++) {
        var temp = {
          "Exidv": oPrintHuData[i].Exidv,
          "Zwerks": oWerks
        };
        obj.ZSY_LR_I2Set.push(temp);
      }
      labelPrintModel.create("/ZSY_LR_I1Set", obj, {
        success: function (oData) {
          if (oData.Zreturn === "E|该标签模板不在打印范围内，请选择其他模板") {
            MessageToast.show("该标签模板不在打印范围内，请选择其他模板！", {
              at: "center center"
            });
            return;
          }
          if (oData.Zreturn === "") {
            var list = oData.ZSY_LR_I2Set.results;
            var succ = true;
            var failList = [];
            for (var j = 0; j < list.length; j++) {
              var result = list[j];
              if (result.Ztype === "E") {
                // 失败
                failList.push(result.Zmessage);
                succ = false;
              }
            }

            // 有失败的时候
            if (!succ) {
              var str = "";
              for (var k = 0; k < failList.length; k++) {
                str += failList[k] + "\n";
              }
              MessageBox.error(str);
              return;
            }
          }
          MessageToast.show("打印成功！", {
            at: "center center"
          });
        },
        error: function (mes) {
          MessageToast.show("打印失败，服务器错误", {
            at: "center center"
          });
        }
      });

      this._clearnewform();
      // this.clearnewtagmodel();
      // this.getView().getModel("obqselectModel").setProperty("/startselect", false);
      this.byId("printLabelTag").close();

    },

    // 返回按钮
    onExitPrintFragment: function () {
      this._clearnewform();
      // this.clearnewtagmodel();
      this.byId("printLabelTag").close();
    },

    // 清理
    _clearnewform: function () {
      this.getView().byId("printLabel").setValue("");
      this.getView().byId("labelFunction").setValue("");
      this.getView().byId("printer").setValue("");
      this.getView().byId("order").setValue("");
      this.getView().byId("vendor").setValue("");
      this.getView().byId("line").setValue("");
      this.getView().byId("planVersion").setValue("");
      this.getView().byId("inspectorNum").setValue("");
      this.getView().byId("warehouse").setValue("");
      this.getView().byId("inspectionBatch").setValue("");
      this.getView().byId("date").setValue("");
      this.getView().byId("factory").setValue("");
    },

    _isNumber: function (value) {
      if (isNaN(value)) {
        return false;
      } else {
        return true;
      }
    },

  });

});
