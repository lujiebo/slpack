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

], function(BaseController,
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
		onInit: function() {
			// var rootPath = jQuery.sap.getModulePath("com.shunyu.slpack");

			// 需要初始化下拉框的值
			var searchdatamodel = this.getModel("sapDataSource");
			var item;
			var me = this;

			// HU号
			searchdatamodel.read("/ZSY_SH_VEKPSet", {
				success: function(oData, oResponse) {
					item = oData.results;
					var oModel = new JSONModel(item);
					me.getView().setModel(oModel, "HUModel");
				}
			});

			// 物料编号
			searchdatamodel.read("/ZSY_SH_MAKTSet", {
				success: function(oData, oResponse) {
					item = oData.results;
					var oModel = new JSONModel(item);
					me.getView().setModel(oModel, "MaterialModel");
				}
			});

			// 客户编号
			searchdatamodel.read("/ZSY_SH_KNA1Set", {
				success: function(oData, oResponse) {
					item = oData.results;
					var oModel = new JSONModel(item);
					me.getView().setModel(oModel, "CustomerModel");
				}
			});

			var oSearchModel = new JSONModel({
				HUCode: null,
				materialCode: null,
				customerMaterialCode: null,
				batch: null,
				customerCode: null,
				dateStart: null,
				dateEnd: null
			});
			// 不知道干什么用的
			// oSearchModel.setDefaultBindingMode(sap.ui.model.BindingMode.ThreeWay);
			me.setModel(oSearchModel, "searchModel");

			var filterModel = new JSONModel();
			// filterModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			me.setModel(filterModel, "filterModel");

			var obqselectModel = new JSONModel({
				isselect: false,
				startselect: false
			});

			me.setModel(obqselectModel, "obqselectModel");

			this.macAddress = "";
			// 获取mac地址
			this._onGetMac();

		},

		/*这一套是查询条件 弹窗*/
		formatter: Formatter,

		onExit: function() {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		// HU号查询
		HUHandleSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Exidv", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		// 物料查询
		materialHandleSearch: function(oEvent) {
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

		// 客户查询
		customerHandleSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter({
				filters: [
					new Filter({
						path: "Kunnr",
						operator: FilterOperator.Contains,
						value1: sValue
					}),
					new Filter({
						path: "Name1",
						operator: FilterOperator.Contains,
						value1: sValue
					}),
					new Filter({
						path: "Land1",
						operator: FilterOperator.Contains,
						value1: sValue
					}),
					new Filter({
						path: "Ort01",
						operator: FilterOperator.Contains,
						value1: sValue
					})
				],
				and: false
			});
			var oBinding = oEvent.getSource().getBinding("items");

			oBinding.filter(oFilter);
		},

		// 标签查询
		labelHandleSearch: function(oEvent) {
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

		// 打印机查询
		printerHandleSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter({
				filters: [
					new Filter({
						path: "Zdyjnumber",
						operator: FilterOperator.Contains,
						value1: sValue
					}),
					new Filter({
						path: "Zdyjname",
						operator: FilterOperator.Contains,
						value1: sValue
					}),
					new Filter({
						path: "Zcfdd",
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
		handleClose: function(oEvent) {
			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);

			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				MessageToast.show("You have chosen " + aContexts.map(function(oContext) {
					return oContext.getObject().Name;
				}).join(", "));
			}

		},

		// HU号选择弹窗
		HUHandleValueHelp: function() {
			Fragment.load({
				name: "com.shunyu.slpack.view.HUValueHelp",
				controller: this
			}).then(function(oValueHelpDialog) {
				this._oValueHelpDialog = oValueHelpDialog;
				this.getView().addDependent(this._oValueHelpDialog);
				// this._HUconfigValueHelpDialog();
				this._oValueHelpDialog.open();
			}.bind(this));
			/*if (this._oValueHelpDialog) {
				Fragment.load({
					name: "com.shunyu.slpack.view.HUValueHelp",
					controller: this
				}).then(function (oValueHelpDialog) {
					this._oValueHelpDialog = oValueHelpDialog;
					this.getView().addDependent(this._oValueHelpDialog);
					// this._configValueHelpDialog();
					this._oValueHelpDialog.open();
				}.bind(this));
			} else {
				// this._configValueHelpDialog();
				this._oValueHelpDialog.open();
			}*/
		},

		_HUconfigValueHelpDialog: function() {
			var sInputValue = this.byId("HUInput").getValue(),
				oModel = this.getView().getModel("HUModel"),
				aProducts = oModel.getProperty("/");
			// aProducts = oModel.getProperty("/ProductCollection");

			aProducts.forEach(function(oProduct) {
				oProduct.selected = (oProduct.Exidv === sInputValue);
			});
			oModel.setProperty("/", aProducts);
		},

		// 物料选择弹窗
		materialHandleValueHelp: function() {
			Fragment.load({
				name: "com.shunyu.slpack.view.MaterialValueHelp",
				controller: this
			}).then(function(oValueHelpDialog) {
				this._oValueHelpDialog = oValueHelpDialog;
				this.getView().addDependent(this._oValueHelpDialog);
				// this._materialconfigValueHelpDialog();
				this._oValueHelpDialog.open();
			}.bind(this));
		},

		_materialconfigValueHelpDialog: function() {
			var sInputValue = this.byId("materialInput").getValue(),
				oModel = this.getView().getModel("MaterialModel"),
				aProducts = oModel.getProperty("/");
			// aProducts = oModel.getProperty("/ProductCollection");

			aProducts.forEach(function(oProduct) {
				oProduct.selected = (oProduct.Matnr === sInputValue);
			});
			oModel.setProperty("/", aProducts);
		},

		// 客户选择弹窗
		customerHandleValueHelp: function() {
			Fragment.load({
				name: "com.shunyu.slpack.view.CustomerValueHelp",
				controller: this
			}).then(function(oValueHelpDialog) {
				this._oValueHelpDialog = oValueHelpDialog;
				this.getView().addDependent(this._oValueHelpDialog);
				// this._customerconfigValueHelpDialog();
				this._oValueHelpDialog.open();
			}.bind(this));
		},

		_customerconfigValueHelpDialog: function() {
			var sInputValue = this.byId("customerInput").getValue(),
				oModel = this.getView().getModel("CustomerModel"),
				aProducts = oModel.getProperty("/");
			// aProducts = oModel.getProperty("/ProductCollection");

			aProducts.forEach(function(oProduct) {
				oProduct.selected = (oProduct.Kunnr === sInputValue);
			});
			oModel.setProperty("/", aProducts);
		},

		// 标签选择弹窗
		labelHandleValueHelp: function() {
			var that = this;
			Fragment.load({
				name: "com.shunyu.slpack.view.LabelValueHelp",
				controller: this
			}).then(function(oValueHelpDialog) {
				this._oValueHelpDialog = oValueHelpDialog;
				this.getView().addDependent(this._oValueHelpDialog);
				// this._customerconfigValueHelpDialog();
				console.log(that.getView().getModel("LabelModel"));
				this._oValueHelpDialog.open();
			}.bind(this));
		},

		// 打印机选择弹窗
		printerHandleValueHelp: function() {
			Fragment.load({
				name: "com.shunyu.slpack.view.PrinterValueHelp",
				controller: this
			}).then(function(oValueHelpDialog) {
				this._oValueHelpDialog = oValueHelpDialog;
				this.getView().addDependent(this._oValueHelpDialog);
				// this._customerconfigValueHelpDialog();
				this._oValueHelpDialog.open();
			}.bind(this));
		},

		// HU号选择后事件
		HUHandleValueHelpClose: function(oEvent) {
			if (oEvent.sId !== "cancel") {
				var oInput = this.byId("HUInput");
				// 获取选中行对象
				var rowData = oEvent.mParameters.selectedItem.mAggregations.cells;
				var selectItem = rowData[0].mProperties.text;
				oInput.setValue(selectItem);
			}
		},

		// 物料选择后事件
		materialHandleValueHelpClose: function(oEvent) {
			if (oEvent.sId !== "cancel") {
				var oInput = this.byId("materialInput");
				// 获取选中行对象
				var rowData = oEvent.mParameters.selectedItem.mAggregations.cells;
				var selectItem = rowData[0].mProperties.text;
				oInput.setValue(selectItem);
			}
		},

		// 客户选择后事件
		customerHandleValueHelpClose: function(oEvent) {
			if (oEvent.sId !== "cancel") {
				var oInput = this.byId("customerInput");
				// 获取选中行对象
				var rowData = oEvent.mParameters.selectedItem.mAggregations.cells;
				var selectItem = rowData[0].mProperties.text;
				oInput.setValue(selectItem);
			}
		},

		// 标签选择后事件
		labelHandleValueHelpClose: function(oEvent) {
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
		printerHandleValueHelpClose: function(oEvent) {
			if (oEvent.sId !== "cancel") {
				var oInput = this.byId("printer");
				// 获取选中行对象
				var rowData = oEvent.mParameters.selectedItem.mAggregations.cells;
				var selectItem = rowData[0].mProperties.text;
				oInput.setValue(selectItem);
			}
		},
		/*这一套是查询条件 弹窗*/

		// 执行按钮
		onSearch: function(oEvent) {

			var searchdata = this.getModel("searchModel").oData,
				HUCodeFilters = [],
				MaterialCodeFilters = [],
				MustomerMaterialCodeFilters = [],
				BatchFilters = [],
				lgortFilters = [],
				CustomerCodeFilters = [],
				DateStartFilters = [],
				DateEndFilters = [],
				aFilterGroupsFilters = [];

			// 日期校验
			if ((searchdata.dateStart === "" || searchdata.dateStart === null || searchdata.dateStart.length === 0) ||
				(searchdata.dateEnd === "" || searchdata.dateEnd === null || searchdata.dateEnd.length === 0)) {
				MessageToast.show("请选择开始结束的日期！\n为必选项", {
					at: "center center"
				});
				return false;
			}

			// 日期校验正则
			var regex =
				/^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-))$/;

			if (!searchdata.dateStart.match(regex)) {
				MessageToast.show("开始日期格式不正确！\n(请选择日期)", {
					at: "center center"
				});
				return false;
			}

			if (!searchdata.dateEnd.match(regex)) {
				MessageToast.show("结束日期格式不正确！\n(请选择日期)", {
					at: "center center"
				});
				return false;
			}

			// 起始必须小于等于结束
			if (searchdata.dateStart > searchdata.dateEnd) {
				MessageToast.show("前后日期有误！\n(请重新选择日期)", {
					at: "center center"
				});
				return false;
			}

			// 日期合格
			DateStartFilters.push(new sap.ui.model.Filter(
				"Erdat",
				sap.ui.model.FilterOperator.GE,
				searchdata.dateStart
			));
			aFilterGroupsFilters.push(new sap.ui.model.Filter(DateStartFilters, true));

			DateEndFilters.push(new sap.ui.model.Filter(
				"Erdat",
				sap.ui.model.FilterOperator.LE,
				searchdata.dateEnd
			));
			aFilterGroupsFilters.push(new sap.ui.model.Filter(DateEndFilters, true));

			if (searchdata.HUCode && searchdata.HUCode.length > 0) {
				HUCodeFilters.push(new sap.ui.model.Filter(
					"Exidv",
					sap.ui.model.FilterOperator.Contains,
					searchdata.HUCode
				));
				aFilterGroupsFilters.push(new sap.ui.model.Filter(HUCodeFilters, true));
			}

			if (searchdata.materialCode && searchdata.materialCode.length > 0) {
				MaterialCodeFilters.push(new sap.ui.model.Filter(
					"Matnr",
					sap.ui.model.FilterOperator.Contains,
					searchdata.materialCode
				));
				aFilterGroupsFilters.push(new sap.ui.model.Filter(MaterialCodeFilters));
			}

			if (searchdata.customerMaterialCode && searchdata.customerMaterialCode.length > 0) {
				MustomerMaterialCodeFilters.push(new sap.ui.model.Filter(
					"Cmatnr",
					sap.ui.model.FilterOperator.Contains,
					searchdata.customerMaterialCode
				));
				aFilterGroupsFilters.push(new sap.ui.model.Filter(MustomerMaterialCodeFilters, true));
			}

			if (searchdata.batch && searchdata.batch.length > 0) {
				BatchFilters.push(new sap.ui.model.Filter(
					"Charg",
					sap.ui.model.FilterOperator.Contains,
					searchdata.batch
				));
				aFilterGroupsFilters.push(new sap.ui.model.Filter(BatchFilters, true));
			}

			if (searchdata.lgort && searchdata.lgort.length > 0) {
				lgortFilters.push(new sap.ui.model.Filter(
					"Lgort",
					sap.ui.model.FilterOperator.Contains,
					searchdata.lgort
				));
				aFilterGroupsFilters.push(new sap.ui.model.Filter(lgortFilters, true));
			}

			if (searchdata.customerCode && searchdata.customerCode.length > 0) {
				CustomerCodeFilters.push(new sap.ui.model.Filter(
					"Customerid",
					sap.ui.model.FilterOperator.Contains,
					searchdata.customerCode
				));
				aFilterGroupsFilters.push(new sap.ui.model.Filter(CustomerCodeFilters, true));
			}

			this.byId("tagTable").setBusy(true);
			var afterfiltermodel = this.getModel("filterModel");
			var that = this;
			var searchdatamodel = this.getModel("sapSearchDataSource");
			searchdatamodel.read("/ZSY_S_LABELREDOSet", {
				filters: aFilterGroupsFilters,
				success: function(oData, oResponse) {
					that.clearSelection();
					var item = oData.results;
					afterfiltermodel.setData(item);
					that.getView().byId("tagTable").setBusy(false);
				}
			});
		},

		// 确定按钮触发事件
		printLabelTag: function() {
			var oTable = this.byId("tagTable").getSelectedContexts();
			if (oTable.length) {
				var oView = this.getView();
				if (!this.byId("printLabelTag")) {
					Fragment.load({
						id: oView.getId(),
						name: "com.shunyu.slpack.view.newtagDialog",
						controller: this
					}).then(function(oDialog) {
						oView.addDependent(oDialog);
						oDialog.open();
					});
				} else {
					this.byId("printLabelTag").open();
				}

				// 初始化标签选择界面
				var me = this;
				var searchdatamodel = this.getModel("sapSearchDataSource");
				var ofilterModel = this.getModel("filterModel");
				var customerCode = this.getModel("searchModel").oData.customerCode;
				var oCus = [];
				oTable.map(function(value, index) {
					var oCustomersId = ofilterModel.oData[value.sPath.substr(1)].Customerid;
					if (oCustomersId !== "" && oCus.indexOf(oCustomersId) === -1) {
						oCus.push(oCustomersId);
					}
				});

				var aFilters = [];

				var bSelected = this.getView().getModel("obqselectModel").getProperty("/startselect");
				console.log(bSelected);

				// 修改标签选择界面
				if (bSelected) {
					var that = this;
					var searchdatamodel = this.getModel("sapSearchDataSource");

					searchdatamodel.read("/ZSY_S_ZBQMBSet", {

						success: function(oData, oResponse) {
							var item = oData.results;
							var oModel = new JSONModel(item);
							that.getView().setModel(oModel, "LabelModel");
							console.log(that.getView().getModel("LabelModel"));
						}
					});
				} else {

					if (oCus.length > 0) {
						oCus.map(function(value, index) {
							console.log(value);
							aFilters.push(new Filter("Kunnr", sap.ui.model.FilterOperator.Contains, value));
						});
					};

					var aKunnrFilter = new sap.ui.model.Filter({
						filters: aFilters,
						and: false
					});
					searchdatamodel.read("/ZSY_S_ZBQMBSet", {
						filters: [aKunnrFilter],
						success: function(oData, oResponse) {
							var item = oData.results;
							var oModel = new JSONModel(item);
							me.getView().setModel(oModel, "LabelModel");
						}
					});
				}

				var aMacFilter = [];
				if (this.macAddress !== "") {
					//未获取到mac地址，直接通过用户名读取 获取打印机;获取到了mac地址，传入mac地址，获取打印机
					aMacFilter.push(new Filter("Zmaci", FilterOperator.EQ, this.macAddress));
				}

				// 初始化打印机选择界面
				var printModel = this.getModel("sapPrinterDataSource");
				printModel.read("/ZSY_PRINT_DJYBHSet", {
					filters: aMacFilter,
					success: function(oData, oResponse) {
						var item = oData.results;
						var oModel = new JSONModel(item);
						me.getView().setModel(oModel, "PrinterModel");
					}
				});

				// ...初始化厂区 等等数据
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

			} else {
				MessageToast.show("请选择要打印的数据！", {
					at: "center center"
				});
			}
		},

		// 返回按钮
		onbacktable: function() {
			this.clearnewform();
			// this.clearnewtagmodel();
			this.getView().getModel("obqselectModel").setProperty("/startselect", false);
			this.byId("printLabelTag").close();
		},

		// 确定打印按钮
		print: function() {
			var filterModel = this.getModel("filterModel");

			var oTable = this.byId("tagTable").getSelectedContexts();

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

			var labelPrintModel = this.getModel("sapSearchDataSource");

			labelPrintModel.setUseBatch(true);
			for (var i = 0; i < oTable.length; i++) {
				var path = oTable[i].sPath.substr(1);
				var data = filterModel.oData[path];

				var temp = {
					"Exidv": data.Exidv,
					"Zwerks": data.Werks
				};

				obj.ZSY_LR_I2Set.push(temp);

			}
			labelPrintModel.create("/ZSY_LR_I1Set", obj, {
				success: function(oData, oResponse) {
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
				error: function(mes) {
					var errormes = JSON.parse(mes.responseText).error.message.value;
					MessageToast.show(errormes, {
						at: "center center"
					});
				}
			});

			this.clearnewform();
			// this.clearnewtagmodel();
			this.getView().getModel("obqselectModel").setProperty("/startselect", false);
			this.byId("printLabelTag").close();

		},

		// 清理
		clearnewform: function() {
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

		clearSelection: function() {
			this.byId("tagTable").removeSelections();
		},

		// get MAC address

		// 获取mac地址
		_onGetMac: function() {
			var that = this;
			if (/macintosh|mac os x/i.test(navigator.userAgent)) {
				$("#plugin a").attr("href", "sunnyoptical_getmac.dmg");
				$.ajax({
					url: "http://127.0.0.1:19101",
					type: "post",
					timeout: 2000,
					success: function(result) {},
					error: function() {
						$.ajax({
							url: "http://127.0.0.1:29101",
							type: "post",
							timeout: 2000,
							success: function(result) {}
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
						if (LODOP.CVERSION) CLODOP.On_Return = function(TaskID, Value) {
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

					setTimeout(function() {
						getSystemInfo('NetworkAdapter.Count', function(value) {
							eval(x(value));
						});
					}, 1000);
				}
			}
		},

		_browserRedirect: function() {
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
		handleValueHelp1: function() {
			if (!this._oValueHelpDialog1) {
				Fragment.load({
					name: "com.shunyu.slpack.view.LgortValueHelp",
					controller: this
				}).then(function(oValueHelpDialog) {
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
		_configValueHelpDialog1: function() {
			var that = this,
				sInputValue = this.getView().byId("lgortInput").getValue(),
				oModel = this.getModel("sapDataSource");
			oModel.setUseBatch(false);
			oModel.read("/ZSY_SH_T001LSHSet", {
				success: function(oData) {
					oData.results.forEach(function(oItem) {
						oItem.selected = (oItem.Lgort === sInputValue);
					});
					// console.log(oData)
					that.setModel(new JSONModel({
						"ZSY_SH_T001LSHSet": oData.results
					}));
				},
				error: function() {

				}
			})
		},
		handleValueHelpClose1: function(oEvent) {
			var oBinding = oEvent.getParameter("selectedContexts");
			if (Util.isNotNull(oBinding)) {
				var oModel = this.getModel("sapDataSource"),
					oManrt = oModel.oData,
					oInput = this.getView().byId("lgortInput");
				var aManrt = $.map(oManrt, function(value, index) {
					return [value];
				})
				var bHasSelected = aManrt.some(function(oItem) {
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
		handleSearch1: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Lgort", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		onAllClicked: function(oEvent) {
			console.log("click");
			var bSelected = oEvent.getParameter("selected");
			console.log(bSelected);
			this.getView().getModel("obqselectModel").setProperty("/isselect", bSelected);

			// 修改标签选择界面
			if (bSelected) {
				var that = this;
				var searchdatamodel = this.getModel("sapSearchDataSource");

				searchdatamodel.read("/ZSY_S_ZBQMBSet", {

					success: function(oData, oResponse) {
						var item = oData.results;
						var oModel = new JSONModel(item);
						that.getView().setModel(oModel, "LabelModel");
						console.log(that.getView().getModel("LabelModel"));
					}
				});
			}else{
				
				var me = this;
					var oTable = this.byId("tagTable").getSelectedContexts();
				var searchdatamodel = this.getModel("sapSearchDataSource");
				var ofilterModel = this.getModel("filterModel");
				var customerCode = this.getModel("searchModel").oData.customerCode;
				var oCus = [];
				oTable.map(function(value,index){
				  var oCustomersId  = ofilterModel.oData[value.sPath.substr(1)].Customerid;
				  if(oCustomersId !== "" && oCus.indexOf(oCustomersId) === -1){
				  	oCus.push(oCustomersId);
				  }
				});
				
				var aFilters = [];
				if(oCus.length > 0)
				{
					oCus.map(function(value,index){
					 	aFilters.push(new Filter("Kunnr",sap.ui.model.FilterOperator.Contains,value));
					});
				};
				
				var aKunnrFilter = new sap.ui.model.Filter({
					filters:aFilters,
					and:false
				});
				searchdatamodel.read("/ZSY_S_ZBQMBSet", {
					filters:[aKunnrFilter],
					success: function (oData, oResponse) {
						var item = oData.results;
						var oModel = new JSONModel(item);
						me.getView().setModel(oModel, "LabelModel");
					}
				});
				
				
				
				
				
			}

		}
	});
});