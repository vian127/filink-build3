import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {PageModel} from '../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../shared-module/model/query-condition.model';
import {StorageLanguageInterface} from '../../../../../assets/i18n/storage/storage.language.interface';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {NzI18nService} from 'ng-zorro-antd';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {StorageTotalNumModel} from '../../share/model/storage-total-num.model';
import {Router} from '@angular/router';
import * as _ from 'lodash';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {DeviceTypeEnum} from '../../../../core-module/enum/facility/facility.enum';
import {EquipmentTypeEnum} from '../../../../core-module/enum/equipment/equipment.enum';
import {SelectModel} from '../../../../shared-module/model/select.model';
import {MaterialTypeEnum} from '../../share/enum/material-type.enum';
import {StorageApiService} from '../../share/service/storage-api.service';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {StorageListModel} from '../../share/model/storage-list.model';
import {ListExportModel} from '../../../../core-module/model/list-export.model';
import {IS_TRANSLATION_CONST} from '../../../../core-module/const/common.const';
import {ExportRequestModel} from '../../../../shared-module/model/export-request.model';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {SupplierDataModel} from '../../../../core-module/model/supplier/supplier-data.model';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {StorageUtil} from '../../share/util/storage.util';
import {ProductInfoModel} from '../../../../core-module/model/product/product-info.model';
import {FilterValueModel} from '../../../../core-module/model/work-order/filter-value.model';
import {StorageSynopsisChartComponent} from '../../share/component/storage-synopsis-chart/storage-synopsis-chart.component';

/**
 * ????????????
 */
@Component({
  selector: 'app-storage-synopsis',
  templateUrl: './storage-synopsis.component.html',
  styleUrls: ['./storage-synopsis.component.scss']
})
export class StorageSynopsisComponent implements OnInit {
  // ??????????????????
  @ViewChild('materialType') public materialTypeTemplate: TemplateRef<HTMLDocument>;
  // ?????????????????????
  @ViewChild('supplierTemp') public supplierTemp: TemplateRef<any>;
  // ??????????????????
  @ViewChild('materialModelTemp') public materialModelTemp: TemplateRef<any>;
  // ??????????????????
  @ViewChild('unitPriceTemp') public unitPriceTemp: TemplateRef<any>;
  // ?????????????????????
  @ViewChild('storageChart') public storageChart: StorageSynopsisChartComponent;
  // ?????????
  public storageLanguage: StorageLanguageInterface;
  public commonLanguage: CommonLanguageInterface;
  // ????????????
  public dataSet: StorageListModel[] = [];
  // ????????????
  public pageBean: PageModel = new PageModel();
  // ????????????
  public tableConfig: TableConfigModel = new TableConfigModel();
  // ??????????????????
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // ????????????????????????
  public storageTotalNumModel: StorageTotalNumModel = new StorageTotalNumModel();
  // ??????????????????
  public deviceTypeEnum = DeviceTypeEnum;
  // ??????????????????
  public equipmentTypeEnum = EquipmentTypeEnum;
  // ???????????????
  public languageEnum = LanguageEnum;
  // ??????????????????
  public materialTypeEnum = MaterialTypeEnum;
  // ?????????????????????
  public isShowCharts: boolean = false;
  // ???????????????
  public selectSupplierObject: FilterValueModel = new FilterValueModel();
  // ?????????????????????
  public isShowSupplier: boolean = false;
  // ??????????????????????????????
  public selectSupplierList: SupplierDataModel[] = [];
  // ????????????????????????
  public isShowModel: boolean = false;
  // ??????????????????
  public modelFilterCondition: FilterCondition = new FilterCondition();
  // ?????????????????????????????????????????????
  public productTypeDataSource = [];
  // ???????????????id
  public selectModelId: string[] = [];
  // ?????????????????????
  public selectModelObject: FilterValueModel = new FilterValueModel();
  // ?????????????????????
  private supplierFilterValue: FilterCondition;
  // ????????????????????????
  private modelFilterValue: FilterCondition;
  constructor(public $nzI18n: NzI18nService,
              public $router: Router,
              public $storageApiService: StorageApiService,
              public $message: FiLinkModalService) { }

  /**
   * ?????????
   */
  public ngOnInit(): void {
    // ???????????????
    this.storageLanguage = this.$nzI18n.getLocaleData(LanguageEnum.storage);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    // ???????????????
    this.initTableConfig();
    this.queryStorageList();
    // ????????????
    this.queryTotalNum();
  }

  /**
   * ??????
   */
  public pageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.queryStorageList();
  }
  /**
   * ????????????????????????
   */
  public openSupplierSelector(filterValue: FilterCondition): void {
    this.isShowSupplier = true;
    this.supplierFilterValue = filterValue;
    this.supplierFilterValue.operator = OperatorEnum.in;
  }
  /**
   * ???????????????????????????
   */
  public onSelectSupplier(event: SupplierDataModel[]): void {
    this.selectSupplierList = event;
    StorageUtil.selectSupplier(event, this);
  }

  /**
   * ???????????????????????????
   */

  public openMaterialModel(filterValue: FilterCondition): void {
    this.isShowModel = true;
    this.productTypeDataSource = FacilityForCommonUtil.getRoleFacility(this.$nzI18n).concat(
      FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n)
    );
    this.modelFilterValue = filterValue;
    this.modelFilterValue.operator = OperatorEnum.in;
  }

  /**
   * ?????????????????????????????????
   */
  public handleModelOk(event: ProductInfoModel[]): void {
    event.forEach(item => {
      this.selectModelId.push(item.productId);
    });
    StorageUtil.selectModel(event, this);
    this.isShowModel = false;
  }
  /**
   * ??????????????????
   */
  private queryStorageList(): void {
    this.tableConfig.isLoading = true;
    this.$storageApiService.queryStorageList(this.queryCondition).subscribe((res: ResultModel<StorageListModel[]>) => {
      this.tableConfig.isLoading = false;
      if (res.code === ResultCodeEnum.success) {
        this.dataSet = res.data || [];
        this.pageBean.Total = res.totalCount;
        this.pageBean.pageIndex = res.pageNum;
        this.pageBean.pageSize = res.size;
        // ??????????????????????????????
        if (!_.isEmpty(this.dataSet)) {
          this.dataSet.forEach(item => {
            // ??????????????????????????????????????????????????????????????????????????????
            if (String(item.materialType) === String(MaterialTypeEnum.facility)) {
              item.iconClass = CommonUtil.getFacilityIConClass(item.materialCode);
            } else if (String(item.materialType) === String(MaterialTypeEnum.equipment)) {
              item.equipmentType = item.materialCode;
              item.iconClass = CommonUtil.getEquipmentTypeIcon(item as any);
            } else {
              // ??????????????????????????? ??????????????????
              item.iconClass = '';
            }
          });
        }
      } else {
        this.$message.error(res.msg);
      }
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * ???????????????
   */
  private initTableConfig(): void {
    this.tableConfig = {
      isDraggable: true,
      isLoading: false,
      showSizeChanger: true,
      showSearchSwitch: true,
      showPagination: true,
      notShowPrint: false,
      scroll: {x: '1200px', y: '600px'},
      noIndex: true,
      showSearchExport: true,
      primaryKey: '19-1',
      columnConfig: [
        // ??????
        {type: 'select', fixedStyle: {fixedLeft: true, style: {left: '0'}}, width: 60},
        // ??????
        {
          type: 'serial-number',
          width: 60,
          title: this.commonLanguage.serialNumber,
          fixedStyle: {fixedLeft: true, style: {left: '60px'}}
        },
        {
          // ????????????
          title: this.storageLanguage.materialName,
          key: 'materialName',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ????????????
          title: this.storageLanguage.materialSerial,
          key: 'materialNumber',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ????????????
          title: this.storageLanguage.materialType,
          key: 'materialCode',
          width: 150,
          type: 'render',
          renderTemplate: this.materialTypeTemplate,
          configurable: true,
          isShowSort: true,
          searchable: true,
          searchConfig: {
            type: 'select',
            selectType: 'multiple',
            selectInfo: this.getMaterialTypeSelect(),
            label: 'label',
            value: 'code'
          }
        },
        {
          // ????????????
          title: this.storageLanguage.productModel,
          key: 'materialModelName',
          width: 150,
          isShowSort: true,
          sortKey: 'materialModel',
          searchKey: 'materialModel',
          searchable: true,
          configurable: true,
          searchConfig: {type: 'render', renderTemplate: this.materialModelTemp}
        },
        {
          // ????????????
          title: this.storageLanguage.warehousingCode,
          key: 'warehousingId',
          width: 200,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ???????????????
          title: this.storageLanguage.softwareVersion,
          key: 'softwareVersion',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ???????????????
          title: this.storageLanguage.hardwareVersion,
          key: 'hardwareVersion',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ????????????(?????????????????? ?????????-?????????)
          title: this.storageLanguage.materialNum,
          key: 'remainingNum',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ????????????
          title: this.storageLanguage.materialUnitPrice,
          key: 'materialUnitPrice',
          width: 150,
          type: 'render',
          renderTemplate: this.unitPriceTemp,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ?????????
          title: this.storageLanguage.supplier,
          key: 'supplierName',
          width: 150,
          isShowSort: true,
          sortKey: 'supplierId',
          searchKey: 'supplierId',
          searchable: true,
          configurable: true,
          searchConfig: {type: 'render', renderTemplate: this.supplierTemp}
        },
        {
          // ????????????
          title: this.storageLanguage.storageTime,
          key: 'warehousingDate',
          width: 150,
          isShowSort: true,
          pipe: 'date',
          pipeParam: 'yyyy-MM-dd hh:mm:ss',
          configurable: true,
          searchable: true,
          searchConfig: {type: 'dateRang'}
        },
        // ??????
        {
          title: this.storageLanguage.remark, key: 'remark', width: 150, isShowSort: true,
          searchable: true, configurable: true,
          searchConfig: {type: 'input'}
        },
        { // ?????????
          title: this.commonLanguage.operate,
          searchable: true,
          searchConfig: {type: 'operate'},
          key: '', width: 100,
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      bordered: false,
      showSearch: false,
      rightTopButtons: [
        {
          // ?????????
          text: this.storageLanguage.summaryGraph,
          iconClassName: 'fiLink-analysis',
          handle: () => {
            this.isShowCharts = true;
            this.storageChart.handleSearch();
          },
        }
      ],
      // ??????
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition.sortField = event.sortField;
        this.queryCondition.sortCondition.sortRule = event.sortRule;
        this.queryStorageList();
      },
      // ??????
      handleSearch: (event: FilterCondition[]) => {
        this.queryCondition.pageCondition.pageNum = 1;
        this.queryCondition.filterConditions = event;
        // ????????????????????????????????????
        if (!event.length) {
          this.selectSupplierList = [];
          this.selectModelId = [];
          this.selectSupplierObject = new FilterValueModel();
          this.selectModelObject = new FilterValueModel();
        }
        this.queryStorageList();
      },
      // ??????
      handleExport: (event: ListExportModel<StorageListModel[]>) => {
        this.handleExport(event);
      },
    };
  }

  /**
   * ?????????????????????????????????????????????
   */
  private queryTotalNum(): void {
    this.$storageApiService.queryMaterialTotal().subscribe((res: ResultModel<StorageTotalNumModel>) => {
      if (res.code === ResultCodeEnum.success) {
        if (res.data) {
          this.storageTotalNumModel.materialTotal = res.data.materialTotal;
          this.storageTotalNumModel.deviceTotal = res.data.deviceTotal;
          this.storageTotalNumModel.equipmentTotal = res.data.equipmentTotal;
          this.storageTotalNumModel.otherTotal = res.data.otherTotal;
        }
      } else {
        this.$message.error(res.msg);
      }
    });
  }

  /**
   * ???????????????????????????
   */
  private getMaterialTypeSelect(): SelectModel[] {
    // ??????
    let selectData = FacilityForCommonUtil.getRoleFacility(this.$nzI18n);
    // ??????
    const otherSelect = [{
      label: this.storageLanguage.otherTotal,
      code: MaterialTypeEnum.other
    }];
    selectData = selectData.concat(FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n), otherSelect) || [];
    return selectData;
  }

  /**
   * ??????
   */
  private handleExport(event: ListExportModel<StorageListModel[]>): void {
    // ????????????
    const exportBody = new ExportRequestModel(event.columnInfoList, event.excelType);
    // ???????????????????????????????????????????????????
    const param = ['materialCode', 'materialType', 'warehousingDate'];
    exportBody.columnInfoList.forEach(item => {
      if (param.includes(item.propertyName)) {
        item.isTranslation = IS_TRANSLATION_CONST;
      }
    });
    // ?????????????????????
    if (event && !_.isEmpty(event.selectItem)) {
      const ids = event.selectItem.map(item => item.storageId);
      const filter = new FilterCondition('storageId', OperatorEnum.in, ids);
      exportBody.queryCondition.filterConditions.push(filter);
    } else {
      // ??????????????????
      exportBody.queryCondition.filterConditions = event.queryTerm;
    }
    this.$storageApiService.exportInventoryList(exportBody).subscribe((res: ResultModel<string>) => {
      if (res.code === ResultCodeEnum.success) {
        this.$message.success(this.storageLanguage.exportStorageSuccess);
      } else {
        this.$message.error(res.msg);
      }
    });
  }
}
