import {Component, EventEmitter, OnInit, OnChanges, SimpleChanges, Input, Output, TemplateRef, ViewChild} from '@angular/core';
import {FacilityLanguageInterface} from '../../../../../assets/i18n/facility/facility.language.interface';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {NzI18nService} from 'ng-zorro-antd';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {AssetAnalysisStatisticalDimensionEnum} from '../../share/enum/asset-analysis-statistical-dimension.enum';
import {DeviceSortEnum} from '../../../../core-module/enum/facility/facility.enum';
import {AssetAnalysisGrowthRateEnum} from '../../share/enum/asset-analysis-growth-rate.enum';
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
import {TimerSelectorService} from '../../../../shared-module/service/time-selector/timer-selector.service';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {PageModel} from '../../../../shared-module/model/page.model';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {PlanProjectLanguageInterface} from '../../../../../assets/i18n/plan-project/plan-project.language.interface';
import {ProjectStatusEnum} from '../../../plan-project/share/enum/project-status.enum';
import {ProjectStatusIconEnum} from '../../../plan-project/share/enum/project-status-icon.enum';
import {AssetAnalysisApiService} from '../../share/service/asset-analysis/asset-analysis-api.service';
import * as _ from 'lodash';
import {ProjectInfoModel} from '../../../plan-project/share/model/project-info.model';
import {AssetAnalysisAssetDimensionEnum} from '../../share/enum/asset-analysis-asset-dimension.enum';
import {differenceInCalendarDays} from 'date-fns';

/**
 * ????????????-?????????????????????
 */
@Component({
  selector: 'app-asset-growth-rate-filter',
  templateUrl: './asset-growth-rate-filter.component.html',
  styleUrls: ['./asset-growth-rate-filter.component.scss']
})
export class AssetGrowthRateFilterComponent implements OnInit, OnChanges {
  // ????????????tab???
  @Input() public selectedIndex = 0;
  // ???????????????????????????
  @Output() public assetGrowthRateFilterConditionEmit = new EventEmitter<any>();
  // ????????????????????????
  @ViewChild('selectAssetType') public selectAssetType: TemplateRef<HTMLDocument>;
  // ?????????????????????
  @ViewChild('AreaSelectRef') public AreaSelectRef: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('ProjectSelectRef') public ProjectSelectRef: TemplateRef<HTMLDocument>;
  // ????????????
  @ViewChild('projectListTable') public projectListTable: TableComponent;
  // ??????????????????????????????
  @ViewChild('projectStatusTemp') projectStatusTemp: TemplateRef<HTMLDocument>;
  // ?????????????????????????????????
  @ViewChild('SelectTime') public SelectTime: TemplateRef<HTMLDocument>;
  // ?????????????????????????????????
  @ViewChild('yearSelectTime') public yearSelectTime: TemplateRef<HTMLDocument>;
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
  // ?????????????????????????????????
  public assetTypeData: any[] = [];
  // ????????????????????????????????????
  public assetTypeSelectData: any[] = [];
  // ?????????????????????????????????code?????????
  public assetTypeCodeList: any[] = [];
  // form????????????
  public formColumn: FormItem[] = [];
  // ???????????????
  public treeSelectorConfig: TreeSelectorConfigModel;
  // ???????????????
  public treeNodes: AreaModel[];
  // ????????????
  public areaName: string = '';
  // ???????????????????????????
  public isVisible: boolean = false;
  // ??????id??????
  public selectAreaIds: string[] = [];
  // ????????????????????????
  public isShow: boolean = false;
  // ????????????id??????
  public selectProjectIds: string[] = [];
  // ??????????????????
  public projectName: string = '';
  // ??????????????????
  public tableConfig: TableConfigModel;
  // ??????????????????
  public pageBean: PageModel = new PageModel();
  // ????????????????????????
  public projectQueryCondition = new QueryConditionModel();
  // ??????????????????
  public dataSet: any[] = [];
  // ????????????????????????
  public formStatus: FormOperate;
  // ??????????????????????????????
  public isClick: boolean = false;
  // ??????????????????
  public queryConditions = new QueryConditionModel();
  // ?????????????????????
  public filterCondition: any;
  // ???????????????????????????
  public date: Date[] = [];
  // ???????????????????????????tab???
  public isFirstClick: boolean = true;
  // ????????????????????????
  private formDefaultValue = {
    // ???????????????????????????
    assetDimension: AssetAnalysisAssetDimensionEnum.facility,
    // ??????????????????????????????
    assetType: [],
    // ???????????????????????????
    statisticalDimension: AssetAnalysisStatisticalDimensionEnum.area,
    // ??????????????????????????????????????????
    selectAreaOrProject: [],
    // ???????????????????????????
    growthRate: AssetAnalysisGrowthRateEnum.monthlyGrowth,
  };
  // ????????????????????????
  private allAreaIdList = [];
  // ??????????????????????????????
  private allAreaName: string;

  constructor(
    public $nzI18n: NzI18nService,
    // ??????????????????
    public $facilityCommonService: FacilityForCommonService,
    public $assetAnalysisApiService: AssetAnalysisApiService,
    private $message: FiLinkModalService,
    private $timerSelectorService: TimerSelectorService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // ??????????????????????????????tab?????????????????????????????????????????????????????????
    if (changes.selectedIndex.currentValue === 1 && this.isFirstClick) {
      this.isFirstClick = false;
      this.assetTypeData = FacilityForCommonUtil.getRoleFacility(this.$nzI18n);
      this.assetTypeCodeList = this.assetTypeData.map(item => {
        return item.code;
      });
      if (this.assetTypeCodeList.includes(DeviceSortEnum.pole)) {
        this.assetTypeSelectData = [DeviceSortEnum.pole];
      }
      this.getAreaTreeData().then(() => {
        this.initColumn();
      }, () => {
        this.initColumn();
      }).catch(() => {
        this.initColumn();
      });
    }
  }

  ngOnInit() {
    // ?????????
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.projectLanguage = this.$nzI18n.getLocaleData(LanguageEnum.planProject);
    this.initTreeSelectorConfig();
    this.initTableConfig();
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
   * ??????????????????
   * param event
   */
  public formInstance(event: { instance: FormOperate }): void {
    if (!this.formColumn.length) {
      return;
    }
    this.formStatus = event.instance;
    this.formStatus.group.statusChanges.subscribe(() => {
      this.isClick = !this.formStatus.getValid();
    });
    this.formStatus.resetData(this.formDefaultValue);
    this.formStatus.resetControlData('assetType', this.assetTypeSelectData);
    this.formStatus.resetControlData('selectAreaOrProject', this.allAreaIdList);
    this.formStatus.resetControlData('selectTime', this.date);
    if (!this.isClick) {
      this.assetGrowthRateAnalysis();
    }
  }

  /**
   * ?????????????????????
   */
  public assetGrowthRateAnalysis(): void {
    let str: string = '';
    const data = this.formStatus.getData();
    if (data.growthRate === AssetAnalysisGrowthRateEnum.monthlyGrowth) {
      str = '%Y-%m';
    } else {
      str = '%Y';
    }
    this.queryConditions.filterConditions = [{
      filterField: data.assetDimension,
      operator: 'in',
      filterValue: data.assetType
    },
      {
        filterField: data.statisticalDimension,
        operator: 'in',
        filterValue: data.selectAreaOrProject
      },
      {
        filterField: 'createTime',
        operator: 'gte',
        filterValue: data.selectTime[0].getTime()
      },
      {
        filterField: 'createTime',
        operator: 'lte',
        filterValue: data.selectTime[1].getTime()
      },
      {
        filterField: 'growthRateDimension',
        operator: 'eq',
        filterValue: str
      }];
    this.filterCondition = {
      assetType: data.assetDimension,
      GrowthEmitCondition: this.queryConditions,
      selectAssetType: data.assetType,
      selectGrowthRateType: data.growthRate
    };
    this.assetGrowthRateFilterConditionEmit.emit(this.filterCondition);
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
    this.isShow = true;
  }

  /**
   * ??????????????????????????????????????????
   */
  public handleCancel(): void {
    this.isShow = false;
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

  /**
   * ???????????????????????????????????????
   */
  public onChangeAssetType(event): void {
    this.assetTypeSelectData = event;
    if (event.length) {
      this.formStatus.resetControlData('assetType', event);
    } else {
      this.formStatus.resetControlData('assetType', null);
    }
  }

  /**
   * ???????????????????????????
   */
  public onChange(event): void {
    if (event && this.date[0] && this.date[1] && this.date[0].getTime() < this.date[1].getTime()) {
      this.formStatus.resetControlData('selectTime', this.date);
    } else {
      this.formStatus.resetControlData('selectTime', []);
    }
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
    this.selectAreaIds = this.allAreaIdList;
    this.areaName = this.allAreaName;
    this.setAreaSelectAll(this.treeNodes);
    const date = this.$timerSelectorService.getYearRange();
    this.date = [new Date(_.first(date)), new Date()];
    this.formStatus.resetControlData('selectAreaOrProject', this.allAreaIdList);
    this.formStatus.resetControlData('selectTime', this.date);
  }

  /**
   * ????????????
   * @param event PageModel
   */
  public pageChange(event: PageModel): void {
    this.projectQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.projectQueryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshData();
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
    const arr = (CommonUtil.codeTranslate(AssetAnalysisGrowthRateEnum, this.$nzI18n, null, `${LanguageEnum.facility}.assetAnalysis`)) as any[];
    arr.splice(0, 1);
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
              this.assetTypeData = FacilityForCommonUtil.getRoleFacility(this.$nzI18n);
              this.assetTypeSelectData = [];
              statisticalDimensionColumn.selectInfo.data = CommonUtil.codeTranslate(AssetAnalysisStatisticalDimensionEnum, this.$nzI18n, null, `${LanguageEnum.facility}.assetAnalysis`);
            }
          } else {
            if (assetTypeColumn && statisticalDimensionColumn) {
              this.formStatus.resetControlData('assetType', null);
              this.formStatus.resetControlData('statisticalDimension', AssetAnalysisStatisticalDimensionEnum.area);
              this.assetTypeData = FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n);
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
      // ?????????
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
          data: arr,
          label: 'label',
          value: 'code'
        },
        modelChange: (controls, $event) => {
          const selectTimeColumn = this.formColumn.find(item => item.key === 'selectTime');
          if (selectTimeColumn) {
            if ($event === AssetAnalysisGrowthRateEnum.monthlyGrowth) {
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
      }
    ];
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
   * ??????????????????
   */
  private refreshData(): void {
    this.tableConfig.isLoading = true;
    this.$assetAnalysisApiService.queryProjectInfoListByPage(this.projectQueryCondition).subscribe((res) => {
      this.tableConfig.isLoading = false;
      if (res.code === ResultCodeEnum.success) {
        this.dataSet = res.data || [];
        this.dataSet.forEach(item => {
          item.statusIconClass = ProjectStatusIconEnum[item.status];
        });
        this.pageBean.pageIndex = res.pageNum;
        this.pageBean.Total = res.totalCount;
        this.pageBean.pageSize = res.size;
      }
    });
  }

  /**
   * ?????????????????????
   */
  private initTableConfig() {
    if (!_.isEmpty(this.selectProjectIds)) {
      this.projectListTable.checkAll(false);
    }
    this.tableConfig = {
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
}
