import {Component, EventEmitter, OnInit, OnChanges, SimpleChanges, Input, Output, TemplateRef, ViewChild} from '@angular/core';
import {FacilityLanguageInterface} from '../../../../../assets/i18n/facility/facility.language.interface';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {NzI18nService} from 'ng-zorro-antd';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {DeviceSortEnum, DeviceTypeEnum} from '../../../../core-module/enum/facility/facility.enum';
import {AssetAnalysisStatisticalDimensionEnum} from '../../share/enum/asset-analysis-statistical-dimension.enum';
import {AssetAnalysisGrowthRateEnum} from '../../share/enum/asset-analysis-growth-rate.enum';
import {TimerSelectorService} from '../../../../shared-module/service/time-selector/timer-selector.service';
import {TreeSelectorConfigModel} from '../../../../shared-module/model/tree-selector-config.model';
import {AreaModel} from '../../../../core-module/model/facility/area.model';
import {FormOperate} from '../../../../shared-module/component/form/form-operate.service';
import {
  FilterCondition,
  QueryConditionModel,
  SortCondition
} from '../../../../shared-module/model/query-condition.model';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {FacilityForCommonService} from '../../../../core-module/api-service/facility';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {ProductTypeEnum, ProductUnitEnum} from '../../../../core-module/enum/product/product.enum';
import {EquipmentListModel} from '../../../../core-module/model/equipment/equipment-list.model';
import {ProductForCommonService} from '../../../../core-module/api-service/product/product-for-common.service';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {ProductLanguageInterface} from '../../../../../assets/i18n/product/product.language.interface';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {PageModel} from '../../../../shared-module/model/page.model';
import * as _ from 'lodash';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {EquipmentTypeEnum} from '../../../../core-module/enum/equipment/equipment.enum';
import {PlanProjectLanguageInterface} from '../../../../../assets/i18n/plan-project/plan-project.language.interface';
import {ProjectStatusEnum} from '../../../plan-project/share/enum/project-status.enum';
import {ProjectStatusIconEnum} from '../../../plan-project/share/enum/project-status-icon.enum';
import {AssetAnalysisApiService} from '../../share/service/asset-analysis/asset-analysis-api.service';
import {ProjectInfoModel} from '../../../plan-project/share/model/project-info.model';
import {AssetAnalysisAssetDimensionEnum} from '../../share/enum/asset-analysis-asset-dimension.enum';
import {SelectModel} from '../../../../shared-module/model/select.model';
import {
  PRODUCT_DEVICE_TYPE_CONST,
  PRODUCT_EQUIPMENT_TYPE_CONST
} from '../../../../core-module/const/product/product-common.const';
import {differenceInCalendarDays} from 'date-fns';

/**
 * ????????????-????????????????????????
 */
@Component({
  selector: 'app-asset-failure-distribution-filter',
  templateUrl: './asset-failure-distribution-filter.component.html',
  styleUrls: ['./asset-failure-distribution-filter.component.scss']
})
export class AssetFailureDistributionFilterComponent implements OnInit, OnChanges {
  // ????????????tab???
  @Input() public selectedIndex = 0;
  // ??????????????????????????????
  @Output() public assetFailureDistributionFilterConditionEmit = new EventEmitter<any>();
  // ????????????????????????
  @ViewChild('selectAssetType') public selectAssetType: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('AreaSelectRef') public AreaSelectRef: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('ProjectSelectRef') public ProjectSelectRef: TemplateRef<HTMLDocument>;
  // ????????????
  @ViewChild('projectListTable') public projectListTable: TableComponent;
  // ??????????????????????????????
  @ViewChild('projectStatusTemp') projectStatusTemp: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('chooseTypeRef') public chooseTypeRef: TemplateRef<HTMLDocument>;
  // ??????????????????????????????
  @ViewChild('SelectTime') public SelectTime: TemplateRef<HTMLDocument>;
  // ??????????????????????????????
  @ViewChild('dailySelectTime') public dailySelectTime: TemplateRef<HTMLDocument>;
  // ??????????????????????????????
  @ViewChild('yearSelectTime') public yearSelectTime: TemplateRef<HTMLDocument>;
  // ????????????
  @ViewChild('buttonTemplate') public buttonTemplate: TemplateRef<HTMLDocument>;
  //  ??????????????????
  @ViewChild('productTypeTemplate') public productTypeTemplate: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('productListTable') public productListTable: TableComponent;
  // ????????????????????????
  @ViewChild('unitTemplate') public unitTemplate: TemplateRef<HTMLDocument>;
  // ???????????????
  public language: FacilityLanguageInterface;
  // ????????????????????????
  public commonLanguage: CommonLanguageInterface;
  // ?????????????????????
  public projectLanguage: PlanProjectLanguageInterface;
  // ??????????????????
  public projectStatusEnum = ProjectStatusEnum;
  // ???????????????
  public languageEnum = LanguageEnum;
  public productLanguage: ProductLanguageInterface;
  // ?????????????????????????????????
  public assetTypeData: any[] = [];
  // ????????????????????????????????????
  public assetTypeSelectData: any[] = [];
  // ?????????????????????????????????code?????????
  public assetTypeCodeList: any[] = [];
  // ??????????????????
  public deviceTypeEnum = DeviceTypeEnum;
  // ??????????????????
  public productTypeEnum = ProductTypeEnum;
  // ????????????????????????
  public productUnitEnum = ProductUnitEnum;
  // ??????????????????
  public equipmentTypeEnum = EquipmentTypeEnum;
  // form????????????
  public formColumn: FormItem[] = [];
  // ???????????????
  public treeSelectorConfig: TreeSelectorConfigModel;
  // ????????????????????????
  public tableConfig: TableConfigModel = new TableConfigModel();
  // ???????????????
  public treeNodes: AreaModel[];
  // ????????????
  public areaName: string = '';
  // ??????id??????
  public selectProductIds: string[] = [];
  // ????????????
  public productName: string = '';
  // ???????????????????????????
  public isVisible: boolean = false;
  // ??????id??????
  public selectAreaIds: string[] = [];
  // ????????????????????????
  public isShowProjectList: boolean = false;
  // ????????????id??????
  public selectProjectIds: string[] = [];
  // ??????????????????
  public projectName: string = '';
  // ??????????????????
  public projectTableConfig: TableConfigModel = new TableConfigModel();
  // ??????????????????
  public projectPageBean: PageModel = new PageModel();
  // ????????????????????????
  public projectQueryCondition = new QueryConditionModel();
  // ??????????????????
  public dataSet: any[] = [];
  // ????????????????????????
  public formStatus: FormOperate;
  // ??????????????????????????????
  public isClick: boolean = false;
  // ????????????????????????
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // ??????
  public pageBean: PageModel = new PageModel();
  // ?????????????????????
  public filterCondition: any;
  // ???????????????????????????
  public date: Date[] = [];
  // ????????????????????????
  public isShow: boolean = false;
  public _dataSet: any[] = [];
  // ???????????????????????????tab???
  private isFirstClick: boolean = true;
  // ????????????????????????
  private formDefaultValue = {
    // ???????????????????????????
    assetDimension: AssetAnalysisAssetDimensionEnum.facility,
    // ??????????????????????????????
    assetType: [],
    // ???????????????????????????
    statisticalDimension: AssetAnalysisStatisticalDimensionEnum.area,
    selectAreaOrProject: [],
    // ???????????????????????????
    growthRate: AssetAnalysisGrowthRateEnum.monthlyGrowth,
  };
  // ????????????????????????
  private allAreaIdList = [];
  // ??????????????????????????????
  private allAreaName: string;
  private productParameterName: string;
  private statisticalDimensionParamName: string;
  private assetDimensionParamName: string;
  private selectProductInformation = [];

  constructor(
    public $nzI18n: NzI18nService,
    // ??????????????????
    public $facilityCommonService: FacilityForCommonService,
    public $assetAnalysisApiService: AssetAnalysisApiService,
    private $message: FiLinkModalService,
    private $timerSelectorService: TimerSelectorService,
    private $productCommonService: ProductForCommonService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // ??????????????????????????????tab?????????????????????????????????????????????????????????
    if (changes.selectedIndex.currentValue === 2 && this.isFirstClick) {
      this.isFirstClick = false;
      this.assetTypeData = FacilityForCommonUtil.getRoleFacility(this.$nzI18n).slice(1, 3);
      this.assetTypeCodeList = this.assetTypeData.map(item => {
        return item.code;
      });
      if (this.assetTypeCodeList.includes(DeviceSortEnum.pole)) {
        this.assetTypeSelectData = [DeviceSortEnum.pole];
      }
      this.queryCondition.filterConditions = [{
        filterValue: this.assetTypeSelectData,
        filterField: 'typeCode',
        operator: 'in'}];
      this.getAreaTreeData().then(() => {
        this.initColumn();
        this.initTableConfig();
      }, () => {
        this.initColumn();
        this.initTableConfig();
      }).catch(() => {
        this.initColumn();
        this.initTableConfig();
      });
    }
  }

  ngOnInit() {
    // ?????????
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.productLanguage = this.$nzI18n.getLocaleData(LanguageEnum.product);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.projectLanguage = this.$nzI18n.getLocaleData(LanguageEnum.planProject);
    this.initTreeSelectorConfig();
    this.initTableConfig();
    this.initProjectTableConfig();
  }

  /**
   * ????????????????????????
   */
  public getAreaTreeData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.$facilityCommonService.queryAreaList().subscribe((result: ResultModel<AreaModel[]>) => {
        if (result.code === ResultCodeEnum.success) {
          const arr = [];
          const list = [];
          result.data.forEach(item => {
            arr.push(item.areaName);
            list.push(item.areaId);
          });
          this.allAreaIdList = list;
          this.allAreaName = arr.toString();
          this.selectAreaIds = list;
          this.areaName = arr.toString();
          this.treeNodes = result.data || [];
          // ?????????????????????????????????
          this.setAreaSelectAll(this.treeNodes);
          this.addName(this.treeNodes);
          this.treeSelectorConfig.treeNodes = this.treeNodes;
          resolve();
        } else {
          this.$message.error(result.msg);
          reject();
        }
      }, () => {
        reject();
      });
    });

  }

  /**
   * ????????????modal
   */
  public showProductSelectorModal(): void {
    this.isShow = true;
  }

  /**
   * ??????????????????
   * param event
   */
  public formInstance(event: { instance: FormOperate }): void {
    if (!this.formColumn.length) {
      return;
    }
    this.queryProductList();
    this.formStatus = event.instance;
    this.formStatus.group.statusChanges.subscribe(() => {
      this.isClick = !this.formStatus.getValid();
    });
    this.formStatus.resetData(this.formDefaultValue);
    this.formStatus.resetControlData('assetType', this.assetTypeSelectData);
    this.formStatus.resetControlData('chooseType', this.selectProductIds);
    this.formStatus.resetControlData('selectAreaOrProject', this.allAreaIdList);
    this.formStatus.resetControlData('selectTime', this.date);
    this.formStatus.resetControlData('operation', 'button');
    this.formStatus.resetControlData('operation', 'button');
    if (!this.isClick) {
      this.assetFailureDistributionAnalysis();
    }
  }

  /**
   * ????????????????????????
   */
  public showAreaSelect(): void {
    this.isVisible = true;
  }

  /**
   * ??????????????????????????????
   */
  public showProjectSelect(): void {
    this.isShowProjectList = true;
  }

  /**
   * ??????????????????????????????????????????
   */
  public handleCancelProjectList(): void {
    this.isShowProjectList = false;
  }

  /**
   * ???????????????????????????
   */
  public selectDataChange(event) {
    this.selectAreaIds = [];
    const arr = [];
    if (event.length > 0) {
      event.forEach(item => {
        this.selectAreaIds.push(item.areaId);
        arr.push(item.areaName);
      });
      this.formStatus.resetControlData('selectAreaOrProject', this.selectAreaIds);
    } else {
      this.selectAreaIds = arr;
      this.formStatus.resetControlData('selectAreaOrProject', null);
    }
    FacilityForCommonUtil.setAreaNodesMultiStatus(this.treeNodes, this.selectAreaIds);
    this.areaName = arr.toString();
  }

  public assetFailureDistributionAnalysis(): void {
    const data = this.formStatus.getData();
    if (data.assetDimension === AssetAnalysisAssetDimensionEnum.facility) {
      this.assetDimensionParamName = data.assetDimension;
      this.productParameterName = 'deviceProductId';
      if (data.statisticalDimension === AssetAnalysisStatisticalDimensionEnum.area) {
        this.statisticalDimensionParamName = 'deviceAreaId';
      } else {
        this.statisticalDimensionParamName = 'deviceProjectId';
      }
    } else {
      this.assetDimensionParamName = 'equipment.equipmentType';
      this.productParameterName = 'equipment.equipmentProductId';
      this.statisticalDimensionParamName = 'equipment.equipmentAreaId';
    }
    const queryConditions = new QueryConditionModel();
    queryConditions.filterConditions = [{
      filterField: this.assetDimensionParamName,
      operator: 'in',
      filterValue: data.assetType
    },
      {
        filterField: 'createTime',
        operator: 'gte',
        filterValue: data.selectTime[0].getTime()
      },
      {
        filterField: 'createTime',
        operator: 'lte',
        // ?????????????????????????????????????????????0???0???0????????????????????????????????????24???59???59???
        filterValue: (data.selectTime[1].getTime() + 24 * 60 * 60 * 1000 - 1)
      },
      {
        filterField: this.statisticalDimensionParamName,
        operator: 'in',
        filterValue: data.selectAreaOrProject
      },
      {
        filterField: this.productParameterName,
        operator: 'in',
        filterValue: data.chooseType
      }];
    queryConditions.bizCondition = {
      growthRateDimension: data.growthRate
    };
    this.filterCondition = {
      assetType: data.assetDimension,
      GrowthEmitCondition: queryConditions,
      selectProductInformation: this.selectProductInformation,
    };
    this.assetFailureDistributionFilterConditionEmit.emit(this.filterCondition);
  }

  /**
   * ?????????????????????????????????
   */
  public reset(): void {
    this.formStatus.resetData(this.formDefaultValue);
    if (this.assetTypeCodeList.includes(DeviceSortEnum.pole)) {
      this.assetTypeSelectData = [DeviceSortEnum.pole];
      this.formStatus.resetControlData('assetType', this.assetTypeSelectData);
    }
    this.selectProductIds = [];
    this.productName = '';
    this.productListTable.checkAll(false);
    this.selectAreaIds = this.allAreaIdList;
    const date = this.$timerSelectorService.getYearRange();
    this.date = [new Date(_.first(date)), new Date()];
    this.formStatus.resetControlData('chooseType', this.selectProductIds);
    this.formStatus.resetControlData('selectAreaOrProject', this.allAreaIdList);
    this.formStatus.resetControlData('selectTime', this.date);
    this.formStatus.resetControlData('operation', 'button');
    this.areaName = this.allAreaName;
  }

  /**
   * ????????????????????????????????????????????????
   * param nodes
   */
  public setAreaSelectAll(nodes): void {
    nodes.forEach(item => {
      item.checked = true;
      if (item.children && item.children.length) {
        this.setAreaSelectAll(item.children);
      }
    });
  }

  /**
   * ???????????????????????????????????????
   */
  public onChangeAssetType(event): void {
    this.assetTypeSelectData = event;
    this.selectProductIds = [];
    this.productName = '';
    this.formStatus.resetControlData('chooseType', this.selectProductIds);
    this.productListTable.checkAll(false);
    // ???????????????????????????????????????????????????
    this.queryCondition.filterConditions = [{
      filterValue: this.assetTypeSelectData,
      filterField: 'typeCode',
      operator: 'in'}];
    if (event.length) {
      this.formStatus.resetControlData('assetType', event);
    } else {
      this.formStatus.resetControlData('assetType', null);
    }
    this.initTableConfig();
    this.queryProductList();
}

  /**
   * ???????????????????????????
   */
  public onChange(event): void {
    // ????????????????????????????????????????????????????????????????????????????????????????????????
    if (event && this.date[0] && this.date[1] && this.date[0].getTime() < this.date[1].getTime()) {
      this.formStatus.resetControlData('selectTime', this.date);
    } else {
      this.formStatus.resetControlData('selectTime', []);
    }
  }

  /**
   * ????????????????????????????????????
   */
  public handleCancel(): void {
    this.isShow = false;
  }

  /**
   * ????????????????????????
   * @param event PageModel
   */
  public projectPageChange(event: PageModel): void {
    this.projectQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.projectQueryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshData();
  }

  /**
   * ????????????????????????
   * @param event PageModel
   */
  public productPageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.queryProductList();
  }

  /**
   * ????????????
   * param {Date} current
   * returns {boolean}
   */
  public disabledEndDate = (current: Date): boolean => {
    const nowTime = new Date();
    return differenceInCalendarDays(current, nowTime) > 0;
  }

  /**
   * ????????????
   */
  private initColumn(): void {
    this.formColumn = [
      // ????????????
      {
        label: this.language.assetAnalysis.assetDimension,
        key: 'assetDimension',
        type: 'select',
        col: 8,
        require: true,
        disabled: false,
        rule: [{required: true}],
        initialValue: AssetAnalysisAssetDimensionEnum.facility,
        selectInfo: {
          data: CommonUtil.codeTranslate(AssetAnalysisAssetDimensionEnum, this.$nzI18n, null, `${LanguageEnum.facility}.assetAnalysis`),
          label: 'label',
          value: 'code'
        },
        modelChange: (controls, $event) => {
          const assetTypeColumn = this.formColumn.find(item => item.key === 'assetType');
          const statisticalDimensionColumn = this.formColumn.find(item => item.key === 'statisticalDimension');
          if ($event === AssetAnalysisAssetDimensionEnum.facility) {
            if (assetTypeColumn && statisticalDimensionColumn) {
              this.formStatus.resetControlData('assetType', null);
              this.assetTypeData = FacilityForCommonUtil.getRoleFacility(this.$nzI18n).slice(1, 3);
              this.assetTypeSelectData = [];
              statisticalDimensionColumn.selectInfo.data = CommonUtil.codeTranslate(AssetAnalysisStatisticalDimensionEnum, this.$nzI18n, null, `${LanguageEnum.facility}.assetAnalysis`);
            }
          } else {
            if (assetTypeColumn && statisticalDimensionColumn) {
              this.formStatus.resetControlData('assetType', null);
              this.formStatus.resetControlData('statisticalDimension', AssetAnalysisStatisticalDimensionEnum.area);
              this.assetTypeData = FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n).filter(item => item.label !== this.language.intelligentEntranceGuardLock);
              this.assetTypeSelectData = [];
              statisticalDimensionColumn.selectInfo.data.splice(1, 1);
            }
          }
        }
      },
      // ????????????
      {
        label: this.language.assetAnalysis.assetType,
        key: 'assetType',
        type: 'custom',
        col: 8,
        require: true,
        disabled: false,
        rule: [{required: true}],
        template: this.selectAssetType,
      },
      // ????????????
      {
        label: this.language.assetAnalysis.chooseType,
        key: 'chooseType',
        type: 'custom',
        col: 8,
        require: true,
        disabled: false,
        rule: [{required: true}],
        template: this.chooseTypeRef,
      },
      // ????????????
      {
        label: this.language.assetAnalysis.statisticalDimension,
        key: 'statisticalDimension',
        type: 'select',
        col: 8,
        require: true,
        disabled: false,
        rule: [{required: true}],
        initialValue: AssetAnalysisStatisticalDimensionEnum.area,
        selectInfo: {
          data: CommonUtil.codeTranslate(AssetAnalysisStatisticalDimensionEnum, this.$nzI18n, null, `${LanguageEnum.facility}.assetAnalysis`),
          label: 'label',
          value: 'code'
        },
        modelChange: (controls, $event) => {
          const selectAreaOrProjectColumn = this.formColumn.find(item => item.key === 'selectAreaOrProject');
          if (selectAreaOrProjectColumn) {
            if ($event === AssetAnalysisStatisticalDimensionEnum.area) {
              selectAreaOrProjectColumn.label = this.language.assetAnalysis.selectArea;
              selectAreaOrProjectColumn.template = this.AreaSelectRef;
              this.formStatus.resetControlData('selectAreaOrProject', this.selectAreaIds);
            } else {
              this.refreshData();
              selectAreaOrProjectColumn.label = this.language.assetAnalysis.selectProject;
              selectAreaOrProjectColumn.template = this.ProjectSelectRef;
              this.formStatus.resetControlData('selectAreaOrProject', this.selectProjectIds);
            }
          }
        }
      },
      // ????????????
      {
        label: this.language.assetAnalysis.selectArea,
        key: 'selectAreaOrProject',
        type: 'custom',
        col: 8,
        require: true,
        disabled: false,
        rule: [{required: true}],
        template: this.AreaSelectRef,
      },
      // ???????????????
      {
        label: this.language.assetAnalysis.growthRate,
        key: 'growthRate',
        type: 'select',
        col: 8,
        require: true,
        disabled: false,
        rule: [{required: true}],
        initialValue: AssetAnalysisGrowthRateEnum.monthlyGrowth,
        selectInfo: {
          data: CommonUtil.codeTranslate(AssetAnalysisGrowthRateEnum, this.$nzI18n, null, `${LanguageEnum.facility}.assetAnalysis`),
          label: 'label',
          value: 'code'
        },
        modelChange: (controls, $event) => {
          const selectTimeColumn = this.formColumn.find(item => item.key === 'selectTime');
          if (selectTimeColumn) {
            if ($event === AssetAnalysisGrowthRateEnum.dailyGrowth) {
              selectTimeColumn.template = this.dailySelectTime;
              const dates = this.$timerSelectorService.getMonthRange();
              this.date = [new Date(_.first(dates)), new Date()];
              this.formStatus.resetControlData('selectTime', this.date);
            } else if ($event === AssetAnalysisGrowthRateEnum.monthlyGrowth) {
              selectTimeColumn.template = this.SelectTime;
              const dates = this.$timerSelectorService.getYearRange();
              this.date = [new Date(_.first(dates)), new Date()];
              this.formStatus.resetControlData('selectTime', this.date);
            } else {
              selectTimeColumn.template = this.yearSelectTime;
              this.date = [];
            }
          }
        }

      },
      // ????????????
      {
        label: this.language.assetAnalysis.selectTime,
        key: 'selectTime',
        type: 'custom',
        col: 8,
        require: true,
        disabled: false,
        rule: [{required: true}],
        template: this.SelectTime,
      },
      // ?????????????????????
      {
        label: '',
        key: 'operation',
        type: 'custom',
        col: 8,
        require: false,
        disabled: false,
        rule: [{required: true}],
        template: this.buttonTemplate,
      }
    ];
    // ???????????????
    const date = this.$timerSelectorService.getYearRange();
    this.date = [new Date(_.first(date)), new Date()];
  }

  /**
   * ??????????????????????????????
   */
  private initTreeSelectorConfig(): void {
    const treeSetting = {
      check: {
        enable: true,
        chkStyle: 'checkbox',
        chkboxType: {'Y': '', 'N': ''},
      },
      data: {
        simpleData: {
          enable: false,
          idKey: 'areaId',
        },
        key: {
          name: 'areaName',
          children: 'children'
        },
      },
      view: {
        showIcon: false,
        showLine: false
      }
    };
    this.treeSelectorConfig = {
      title: this.language.selectArea,
      width: '1000px',
      height: '300px',
      treeNodes: this.treeNodes,
      treeSetting: treeSetting,
      onlyLeaves: false,
      selectedColumn: [
        {
          title: this.language.assetAnalysis.areaName, key: 'areaName', width: 100,
        },
        {
          title: this.language.assetAnalysis.areaLevel, key: 'areaLevel', width: 100,
        }
      ]
    };
  }

  private initTableConfig(): void {
    if (!_.isEmpty(this.selectProductIds)) {
      this.productListTable.checkAll(false);
    }
    this.tableConfig = {
      isDraggable: true,
      isLoading: false,
      outHeight: 108,
      showRowSelection: false,
      keepSelected: true,
      selectedIdKey: 'productId',
      showSizeChanger: true,
      notShowPrint: true,
      showSearchSwitch: true,
      showPagination: true,
      scroll: {x: '800px', y: '340px'},
      noIndex: true,
      columnConfig: [
        {
          type: 'select',
          width: 50,
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
        },
        { // ??????
          type: 'serial-number',
          width: 62,
          title: this.productLanguage.serialNum,
          fixedStyle: {fixedLeft: true, style: {left: '50px'}},
        },
        { // ????????????
          title: this.productLanguage.productModel, key: 'productModel', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ??????
          title: this.productLanguage.model, key: 'typeCode', width: 150,
          type: 'render',
          renderTemplate: this.productTypeTemplate,
          isShowSort: true,
          searchable: true,
          searchConfig: {
            type: 'select',
            selectType: 'multiple',
            selectInfo: this.getProductTypeSelect(),
            label: 'label',
            value: 'code'
          }
        },
        { // ?????????
          title: this.productLanguage.supplier, key: 'supplierName', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.productLanguage.productFeatures, key: 'description', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.productLanguage.unit, key: 'unit', width: 100,
          type: 'render',
          renderTemplate: this.unitTemplate,
          isShowSort: true,
          searchable: true,
          searchConfig: {
            type: 'select',
            selectInfo: CommonUtil.codeTranslate(ProductUnitEnum, this.$nzI18n, null, LanguageEnum.product),
            label: 'label',
            value: 'code'
          }
        },
        { // ????????????
          title: this.productLanguage.scrapTime, key: 'scrapTime', width: 100,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ?????????
          title: this.productLanguage.operate,
          searchable: true,
          searchConfig: {type: 'operate'},
          key: '', width: 180,
          fixedStyle: {fixedLeft: true, style: {right: '0px'}},
        },
      ],
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition = event;
        this.queryProductList();
      },
      handleSearch: (event: FilterCondition[]) => {
        event.forEach(item => {
          if (item.filterField === 'scrapTime' || item.filterField === 'scrapTime') {
            item.operator = 'eq';
          }
        });
        this.queryCondition.filterConditions = event;
        this.queryProductList();
      },
      handleSelect: (event: any[], data) => {
        this.selectProductInformation = event;
        if (!event.length) {
          this.selectProductIds = [];
          this.productName = '';
          this.formStatus.resetControlData('chooseType', this.selectProductIds);
          return;
        }
        // ??????????????????5?????????
        if (event.length > 5) {
          this.$message.info(this.language.assetAnalysis.selectProductNumTip);
          setTimeout(() => {
            if (data) {
              data.checked = false;
              this.productListTable.collectSelectedId(data.checked, data);
              this.productListTable.updateSelectedData();
            } else {
              event.forEach((item, index) => {
                if (index > 4) {
                  item.checked = false;
                  this.productListTable.collectSelectedId(item.checked, item);
                  this.productListTable.updateSelectedData();
                }
              });
            }
            this.productListTable.checkStatus();
          });

        }
        const arr = [];
        this.selectProductIds = [];
        // ?????????????????????event??????????????????????????????????????????5?????????
        event.forEach((item, index) => {
          if (index < 5) {
            arr.push(item.productModel);
            this.selectProductIds.push(item.productId);
            this.productName = arr.toString();
          }
        });
        this.formStatus.resetControlData('chooseType', this.selectProductIds);
      }
    };
  }

  /**
   * ?????????????????????
   */
  private initProjectTableConfig() {
    if (!_.isEmpty(this.selectProjectIds)) {
      this.projectListTable.checkAll(false);
    }
    this.projectTableConfig = {
      isDraggable: true,
      isLoading: true,
      outHeight: 108,
      keepSelected: true,
      notShowPrint: true,
      selectedIdKey: 'projectId',
      showSearchSwitch: true,
      scroll: {x: '1804px', y: '340px'},
      noIndex: true,
      columnConfig: [
        { // ??????
          title: this.commonLanguage.select,
          type: 'select',
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
          width: 62
        },
        { // ??????
          type: 'serial-number',
          width: 62,
          title: this.commonLanguage.serialNumber,
          fixedStyle: {fixedLeft: true, style: {left: '62px'}}
        },
        { // ????????????
          title: this.projectLanguage.projectName,
          key: 'projectName',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.projectLanguage.projectCode,
          key: 'projectCode',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.projectLanguage.projectScale,
          key: 'projectScale',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.projectLanguage.builtCount,
          key: 'builtCount',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.projectLanguage.buildingCount,
          key: 'buildingCount',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.projectLanguage.projectStatus,
          key: 'status',
          type: 'render',
          renderTemplate: this.projectStatusTemp,
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        { // ?????????
          title: this.commonLanguage.operate,
          searchable: true,
          searchConfig: {type: 'operate'},
          key: '', width: 180,
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        }
      ],
      showPagination: true,
      bordered: false,
      showSearch: false,
      // ??????
      handleSelect: (event: ProjectInfoModel[]) => {
        if (!event.length) {
          this.selectProjectIds = [];
          this.projectName = '';
          this.formStatus.resetControlData('selectAreaOrProject', this.selectProjectIds);
          return;
        }
        const arr = [];
        this.selectProjectIds = [];
        event.forEach(item => {
          arr.push(item.projectName);
          this.selectProjectIds.push(item.projectId);
          this.projectName = arr.toString();
        });
        this.formStatus.resetControlData('selectAreaOrProject', this.selectProjectIds);
      },
      // ????????????
      handleSearch: (event: FilterCondition[]) => {
        this.projectQueryCondition.pageCondition.pageNum = 1;
        this.projectQueryCondition.filterConditions = event;
        this.refreshData();
      },
      sort: (event: SortCondition) => {
        this.projectQueryCondition.sortCondition = event;
        this.refreshData();
      },
    };
  }

  /**
   * ??????????????????
   */
  private queryProductList(): void {
    this.tableConfig.isLoading = true;
    this.$productCommonService.queryProductList(this.queryCondition).subscribe((res: ResultModel<any>) => {
      if (res.code === ResultCodeEnum.success) {
        this._dataSet = res.data || [];
        this.pageBean.pageIndex = res.pageNum;
        this.pageBean.Total = res.totalCount;
        this.pageBean.pageSize = res.size;
        this.tableConfig.isLoading = false;
        // ??????????????????????????????
        if (!_.isEmpty(this._dataSet)) {
          this._dataSet.forEach(item => {
            item.checked = true;
            this.productListTable.updateSelectedDataNoCheck();
            if (String(item.typeFlag) === String(ProductTypeEnum.facility)) {
              item.iconClass = CommonUtil.getFacilityIConClass(item.typeCode);
            } else {
              item.iconClass = CommonUtil.getEquipmentTypeIcon(item as EquipmentListModel);
            }
          });
        }
      } else {
        this.tableConfig.isLoading = false;
      }
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * ??????????????????
   */
  private refreshData(): void {
    this.projectTableConfig.isLoading = true;
    this.$assetAnalysisApiService.queryProjectInfoListByPage(this.projectQueryCondition).subscribe((res) => {
      this.projectTableConfig.isLoading = false;
      if (res.code === ResultCodeEnum.success) {
        this.dataSet = res.data || [];
        this.dataSet.forEach(item => {
          item.statusIconClass = ProjectStatusIconEnum[item.status];
        });
        this.projectPageBean.pageIndex = res.pageNum;
        this.projectPageBean.Total = res.totalCount;
        this.projectPageBean.pageSize = res.size;
      }
    });
  }

  /**
   * ?????????????????????
   */
  private addName(data: AreaModel[]): void {
    data.forEach(item => {
      item.id = item.areaId;
      item.value = item.areaId;
      item.areaLevel = item.level;
      if (item.children && item.children) {
        this.addName(item.children);
      }
    });
  }

  /**
   * ???????????????????????????
   */
  private getProductTypeSelect(): SelectModel[] {
    let selectData = [];
    this.assetTypeSelectData.forEach(item => {
      selectData = selectData.concat(this.assetTypeData.filter(data => item === data.code));
    });
    return selectData;
  }
}
