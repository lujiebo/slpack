sap.ui.define([
	"com/shunyu/slpack/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/m/Dialog",
	"com/shunyu/slpack/model/Util",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/v2/ODataModel",
	"com/shunyu/slpack/Formatter",
	"sap/ui/core/syncStyleClass",
	"com/shunyu/slpack/LodopFuncs"

], function (BaseController,
	Controller,
	UIComponent,
	MessageBox,
	MessageToast,
	Fragment,
	Dialog,
	Util,
	JSONModel,
	Filter,
	FilterOperator,
	ODataModel,
	Formatter,
	syncStyleClass,
	LodopFuncs) {
	"use strict";

	return BaseController.extend("com.shunyu.slpack.controller.Index", {
		_tagfilterbar: null,

		// 初始化
		onInit: function () {
			this.oRouter = UIComponent.getRouterFor(this);
			var oSearchModel = new JSONModel({});
			this.setModel(oSearchModel, "searchModel");

			var oModel = this.getModel("ZSY_COMM_SH_SRV");
			oModel.read("/ZSY_SH_T001WSet", {
				success: function (oData, oResponse) {
					var oFactoryListModel = new JSONModel(oData);
					this.setModel(oFactoryListModel, "oFactoryList");
				}.bind(this),
				error: function () {
					sap.m.MessageToast.show("读取工厂数据失败,请重新加载");
				}
			});
		},
		/***
		 * 根据工厂取仓库,物料,批次
		 */
		onChangeWerks: function () {
			var oSearchModel = this.getModel("searchModel");
			var oSearch = oSearchModel.getData();
			var afilters = new Array();
			afilters.push(new Filter("Werks", FilterOperator.EQ, oSearch.werks));
			var oModel = this.getModel("ZSY_MM_BULKPACK_SRV");
			oModel.read("/ZSY_SH_T001LSHSet", {
				filters: afilters,
				success: function (oData, oResponse) {
					var ofackModel = new JSONModel(oData); //发出仓库
					ofackModel.setSizeLimit(oData.results.length); //不设置默认是100的 会显示不全
					this.setModel(ofackModel, "ofacklist");
				}.bind(this),
				error: function () {
					sap.m.MessageToast.show("读取发出仓库数据失败,请重新加载");
				}
			});

			// 根据工厂获取物料编号
			oModel.read("/ZSY_SH_MARCSet", {
				filters: afilters,
				success: function (oData, oResponse) {
					var oMaterialModel = new JSONModel(oData.results);
					this.setModel(oMaterialModel, "MaterialModel");
				}.bind(this)
			});

			// 根据工厂获取批次
			oModel.read("/ZSY_S_MCHBSet", {
				filters: afilters,
				success: function (oData, oResponse) {
					var oMchblModel = new JSONModel(oData.results);
					this.setModel(oMchblModel, "oMchblModel");
				}.bind(this)
			});
		},
		/***
		 * 根据发出仓库取目标仓库
		 */
		onChangeFack: function () {
			var oSearchModel = this.getModel("searchModel");
			var oSearch = oSearchModel.getData();
			var afilters = new Array();
			afilters.push(new Filter("Parlg", FilterOperator.EQ, oSearch.stock));
			afilters.push(new Filter("Werks", FilterOperator.EQ, oSearch.werks));
			var oModel = this.getModel("ZSY_MM_BULKPACK_SRV");
			oModel.read("/ZSY_SH_T001LSHSet", {
				filters: afilters,
				success: function (oData, oResponse) {
					if (oData.results.length > 0) {
						var targetCk = oData.results[0]
					}
					var oTargetCkModel = new JSONModel(targetCk); //目标仓库取第一个
					this.setModel(oTargetCkModel, "targetck");
				}.bind(this),
				error: function () {
					sap.m.MessageToast.show("读取发出仓库数据失败,请重新加载");
				}
			});
		},

		formatter: Formatter,

		onExit: function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		// 物料查询
		materialHandleSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter({
				filters: [
					new Filter({
						path: "Matnr",
						operator: FilterOperator.Contains,
						value1: sValue
					}),
					new Filter({
						path: "Maktx",
						operator: FilterOperator.Contains,
						value1: sValue
					})
				],
				and: false
			});
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilter);
		},

		// 选择弹窗返回
		handleClose: function (oEvent) {
			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);

			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				MessageToast.show("You have chosen " + aContexts.map(function (oContext) {
					return oContext.getObject().Name;
				}).join(", "));
			}

		},


		// 物料选择弹窗
		materialHandleValueHelp: function () {
			Fragment.load({
				name: "com.shunyu.slpack.view.MaterialValueHelp",
				controller: this
			}).then(function (oValueHelpDialog) {
				this._oValueHelpDialog = oValueHelpDialog;
				this.getView().addDependent(this._oValueHelpDialog);
				// this._materialconfigValueHelpDialog();
				this._oValueHelpDialog.open();
			}.bind(this));
		},

		_materialconfigValueHelpDialog: function () {
			var sInputValue = this.byId("s_material").getValue(),
				oModel = this.getView().getModel("MaterialModel"),
				aProducts = oModel.getProperty("/");
			// aProducts = oModel.getProperty("/ProductCollection");

			aProducts.forEach(function (oProduct) {
				oProduct.selected = (oProduct.Matnr === sInputValue);
			});
			oModel.setProperty("/", aProducts);
		},

		_customerconfigValueHelpDialog: function () {
			var sInputValue = this.byId("customerInput").getValue(),
				oModel = this.getView().getModel("CustomerModel"),
				aProducts = oModel.getProperty("/");
			// aProducts = oModel.getProperty("/ProductCollection");

			aProducts.forEach(function (oProduct) {
				oProduct.selected = (oProduct.Kunnr === sInputValue);
			});
			oModel.setProperty("/", aProducts);
		},

		// 物料选择后事件
		materialHandleValueHelpClose: function (oEvent) {
			if (oEvent.sId !== "cancel") {
				var oInput = this.byId("s_material");
				// 获取选中行对象
				var rowData = oEvent.mParameters.selectedItem.mAggregations.cells;
				var selectItem = rowData[0].mProperties.text;
				oInput.setValue(selectItem);
			}
		},

		// 执行按钮
		onSearch: function (oEvent) {

			var searchdata = this.getModel("searchModel").getData(),
				aFilterGroupsFilters = [],
				WerkFilters = [], //工厂过滤器
				FackFilters = [], // 发出仓库过滤器
				MaterialFilters = [], //物料编号过滤器
				MchbFilters = []; //批次过滤器

			if (!Util.isNotNull(searchdata.werks)) {
				MessageToast.show("请选择工厂!", {
					at: "center center"
				});
				return;
			}

			if (!Util.isNotNull(searchdata.stock)) {
				MessageToast.show("请选择库存地点!", {
					at: "center center"
				});
				return;
			}

			if (!Util.isNotNull(searchdata.Material)) {
				MessageToast.show("请选择物料编号!", {
					at: "center center"
				});
				return;
			}


			//如果批次不为空,批次过滤器
			if (Util.isNotNull(searchdata.mchb)) {

				MchbFilters.push(new sap.ui.model.Filter(
					"Charg",
					sap.ui.model.FilterOperator.EQ,
					searchdata.mchb
				));
				aFilterGroupsFilters.push(new sap.ui.model.Filter(MchbFilters, true));
			}

			// 工厂过滤器
			WerkFilters.push(new sap.ui.model.Filter(
				"Werks",
				sap.ui.model.FilterOperator.EQ,
				searchdata.werks
			));
			aFilterGroupsFilters.push(new sap.ui.model.Filter(WerkFilters, true));

			//发出仓库过滤器
			FackFilters.push(new sap.ui.model.Filter(
				"Lgort",
				sap.ui.model.FilterOperator.EQ,
				searchdata.stock
			));
			aFilterGroupsFilters.push(new sap.ui.model.Filter(FackFilters, true));

			//物料过滤器
			MaterialFilters.push(new sap.ui.model.Filter(
				"Matnr",
				sap.ui.model.FilterOperator.EQ,
				searchdata.Material
			));
			aFilterGroupsFilters.push(new sap.ui.model.Filter(MaterialFilters, true));

			this.byId("table").setBusy(true);
			var oCommonModel = this.getModel("ZSY_MM_BULKPACK_SRV");
			oCommonModel.read("/ZSY_S_MCHBSet", {
				filters: aFilterGroupsFilters,
				success: function (oData, oResponse) {
					// this.clearSelection();
					var oKcmx = new JSONModel({
						"kcmxlist": oData.results
					}); //库存明细
					oKcmx.setSizeLimit(oData.results.length);
					this.setModel(oKcmx, "oKcmxList");
					this.byId("table").setBusy(false);
				}.bind(this)
			});
		},
		onEditBq: function (params) {
			var selectIndexs = this.byId("table").getSelectedIndices();
			if (selectIndexs.length == 0) {
				MessageToast.show("请至少选择一行!");
			} else {
				var index = selectIndexs[0];
				var selectedRows = this.getModel("oKcmxList").getData().kcmxlist[index];
				var oSearchModel = this.getModel("searchModel");
				var targetckModel = this.getModel("targetck");
				var oSearch = oSearchModel.getData();
				var paramData = {
					material: Util.convertUndefined(selectedRows.Matnr),
					materialName: Util.convertUndefined(selectedRows.Maktx),
					quantity: Util.convertUndefined(selectedRows.Clabs),
					batch: Util.convertUndefined(selectedRows.Charg),
					werks: Util.convertUndefined(oSearch.werks),
					fack: Util.convertUndefined(oSearch.stock),
					mbck: Util.convertUndefined(targetckModel.getData().Lgort)
				}
				this.oRouter.navTo("Slpack", {
					// "path": window.encodeURIComponent(bindingpath.substr(1))
					"params": JSON.stringify(paramData)
				}, true);
			}
		},

		// 获取mac地址
		_onGetMac: function () {
			var that = this;
			if (/macintosh|mac os x/i.test(navigator.userAgent)) {
				$("#plugin a").attr("href", "sunnyoptical_getmac.dmg");
				$.ajax({
					url: "http://127.0.0.1:19101",
					type: "post",
					timeout: 2000,
					success: function (result) {},
					error: function () {
						$.ajax({
							url: "http://127.0.0.1:29101",
							type: "post",
							timeout: 2000,
							success: function (result) {}
						});
					}
				});
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
							return;
						}
						if (LODOP.CVERSION) CLODOP.On_Return = function (TaskID, Value) {
							callback(Value.replace(/-/g, ':'));
						};
						var strResult;
						try {
							strResult = LODOP.GET_SYSTEM_INFO(strINFOType);
							if (String(strResult).indexOf("-") > 0) {
								strResult = strResult.replace(/-/g, ':');
							}
							if (!LODOP.CVERSION) callback(strResult);
							else return;
						} catch (e) {

						}
					}

					function x(num) {
						if (Number(num) <= 1) {
							return "getSystemInfo('NetworkAdapter." + num + ".PhysicalAddress',function(value){setMac(value)})";
						} else {
							return "getSystemInfo('NetworkAdapter." + num + ".PhysicalAddress',function(value){setMac(value);" + x(--num) + "})";
						}
					}

					function setMac(value) {
						that.macAddress = that.macAddress + value + "|";
					}

					setTimeout(function () {
						getSystemInfo('NetworkAdapter.Count', function (value) {
							eval(x(value));
						});
					}, 1000);
				}
			}
		},

		_browserRedirect: function () {
			var sUserAgent = navigator.userAgent.toLowerCase();
			var bIsIpad = sUserAgent.match(/ipad/i) === "ipad";
			var bIsIphoneOs = sUserAgent.match(/iphone os/i) === "iphone os";
			var bIsMidp = sUserAgent.match(/midp/i) === "midp";
			var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) === "rv:1.2.3.4";
			var bIsUc = sUserAgent.match(/ucweb/i) === "ucweb";
			var bIsAndroid = sUserAgent.match(/android/i) === "android";
			var bIsCE = sUserAgent.match(/windows ce/i) === "windows ce";
			var bIsWM = sUserAgent.match(/windows mobile/i) === "windows mobile";
			if (!(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM)) {
				return true;
			}
			return false;
		},
		handleValueHelp1: function () {
			if (!this._oValueHelpDialog1) {
				Fragment.load({
					name: "com.shunyu.slpack.view.LgortValueHelp",
					controller: this
				}).then(function (oValueHelpDialog) {
					this._oValueHelpDialog1 = oValueHelpDialog;
					this.getView().addDependent(this._oValueHelpDialog1);
					this._oValueHelpDialog1.open();
					this._configValueHelpDialog1();
				}.bind(this));
			} else {
				this._configValueHelpDialog1();
				this._oValueHelpDialog1.open();
			}
		},
		_configValueHelpDialog1: function () {
			var that = this,
				sInputValue = this.getView().byId("lgortInput").getValue(),
				oModel = this.getModel("sapDataSource");
			oModel.setUseBatch(false);
			oModel.read("/ZSY_SH_T001LSHSet", {
				success: function (oData) {
					oData.results.forEach(function (oItem) {
						oItem.selected = (oItem.Lgort === sInputValue);
					});
					// console.log(oData)
					that.setModel(new JSONModel({
						"ZSY_SH_T001LSHSet": oData.results
					}));
				},
				error: function () {

				}
			})
		},
		handleValueHelpClose1: function (oEvent) {
			var oBinding = oEvent.getParameter("selectedContexts");
			if (Util.isNotNull(oBinding)) {
				var oModel = this.getModel("sapDataSource"),
					oManrt = oModel.oData,
					oInput = this.getView().byId("lgortInput");
				var aManrt = $.map(oManrt, function (value, index) {
					return [value];
				})
				var bHasSelected = aManrt.some(function (oItem) {
					// console.log(oBinding);
					if (oItem.Lgort == oBinding[0].getObject().Lgort) {
						oInput.setValue(oItem.Lgort);
						oItem.selected = true;
						return true;
					}
				});

				if (!bHasSelected) {
					oInput.setValue(null);
				}

				// var oData = this.getModel("ship").getData();
				// // oData.Ztzbh = oBinding[0].getObject().Bismt;
				// oData.Lgort = oBinding[0].getObject().Lgort;
				// console.log(oData)
			}
		},
		handleSearch1: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Lgort", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		}
	});
});