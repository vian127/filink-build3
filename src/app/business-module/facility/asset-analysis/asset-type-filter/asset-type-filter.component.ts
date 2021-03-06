import {Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {FacilityLanguageInterface} from '../../../../../assets/i18n/facility/facility.language.interface';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {NzI18nService} from 'ng-zorro-antd';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {AssetAnalysisAssetDimensionEnum} from '../../share/enum/asset-analysis-asset-dimension.enum';
import {AssetAnalysisStatisticalDimensionEnum} from '../../share/enum/asset-analysis-statistical-dimension.enum';
import {TreeSelectorConfigModel} from '../../../../shared-module/model/tree-selector-config.model';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {AreaModel} from '../../../../core-module/model/facility/area.model';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {FacilityForCommonService} from '../../../../core-module/api-service/facility';
import {FormOperate} from '../../../../shared-module/component/form/form-operate.service';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {
  FilterCondition,
  QueryConditionModel,
  SortCondition
} from '../../../../shared-module/model/query-condition.model';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {ProjectInfoModel} from '../../../plan-project/share/model/project-info.model';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {ProjectStatusIconEnum} from '../../../plan-project/share/enum/project-status-icon.enum';
import {PlanProjectLanguageInterface} from '../../../../../assets/i18n/plan-project/plan-project.language.interface';
import {ProjectStatusEnum} from '../../../plan-project/share/enum/project-status.enum';
import {AssetAnalysisApiService} from '../../share/service/asset-analysis/asset-analysis-api.service';
import {PageModel} from '../../../../shared-module/model/page.model';
import * as _ from 'lodash';

/**
 * ????????????-??????????????????
 */
@Component({
  selector: 'app-asset-type-filter',
  templateUrl: './asset-type-filter.component.html',
  styleUrls: ['./asset-type-filter.component.scss']
})
export class AssetTypeFilterComponent implements OnInit {
  @Output() public assetRatioFilterConditionEmit = new EventEmitter<any>();
  // ?????????????????????
  @ViewChild('AreaSelectRef') public AreaSelectRef: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('ProjectSelectRef') public ProjectSelectRef: TemplateRef<HTMLDocument>;
  // ????????????
  @ViewChild('projectListTable') public projectListTable: TableComponent;
  // ??????????????????????????????
  @ViewChild('projectStatusTemp') projectStatusTemp: TemplateRef<HTMLDocument>;
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
  /**
   * form????????????
   */
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
  public isClick: boolean = true;
  // ??????????????????
  public queryConditions = new QueryConditionModel();
  // ?????????????????????
  public filterCondition: any;
  // ????????????????????????
  private formDefaultValue = {
    assetDimension: AssetAnalysisAssetDimensionEnum.facility,
    statisticalDimension: AssetAnalysisStatisticalDimensionEnum.area,
    selectAreaOrProject: []
  };
  private allAreaIdList = [];
  private allAreaName: string;

  constructor(
    public $nzI18n: NzI18nService,
    public $assetAnalysisApiService: AssetAnalysisApiService,
    // ??????????????????
    public $facilityCommonService: FacilityForCommonService,
    private $message: FiLinkModalService,
  ) {
  }

  ngOnInit() {
    // ?????????
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.projectLanguage = this.$nzI18n.getLocaleData(LanguageEnum.planProject);
    this.initTreeSelectorConfig();
    this.initTableConfig();
    this.getAreaTreeData().then(() => {
      this.initColumn();
    }, () => {
      this.initColumn();
    }).catch(() => {
      this.initColumn();
    });

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
    if (this.allAreaIdList.length) {
      this.formStatus.resetControlData('selectAreaOrProject', this.allAreaIdList);
    }
    if (!this.isClick) {
      this.analysis();
    }
  }

  /**
   * ??????????????????
   */
  public analysis(): void {
    const data = this.formStatus.getData();
    if (data.assetDimension === AssetAnalysisAssetDimensionEnum.facility && data.statisticalDimension === AssetAnalysisStatisticalDimensionEnum.area) {
      this.queryConditions.filterConditions = [{
        filterValue: this.selectAreaIds,
        filterField: 'areaId',
        operator: 'in'
      }];
      this.filterCondition = {
        assetType: AssetAnalysisAssetDimensionEnum.facility,
        statisticalDimension: AssetAnalysisStatisticalDimensionEnum.area,
        emitCondition: this.queryConditions.filterConditions
      };
    } else if (data.assetDimension === AssetAnalysisAssetDimensionEnum.facility && data.statisticalDimension === AssetAnalysisStatisticalDimensionEnum.project) {
      this.queryConditions.filterConditions = [{
        filterValue: this.selectProjectIds,
        filterField: 'projectId',
        operator: 'in'
      }];
      this.filterCondition = {
        assetType: AssetAnalysisAssetDimensionEnum.facility,
        statisticalDimension: AssetAnalysisStatisticalDimensionEnum.project,
        emitCondition: this.queryConditions.filterConditions
      };
    } else {
      this.queryConditions.filterConditions = [{
        filterValue: this.selectAreaIds,
        filterField: 'areaId',
        operator: 'in'
      }];
      this.filterCondition = {
        assetType: AssetAnalysisAssetDimensionEnum.equipment,
        statisticalDimension: AssetAnalysisStatisticalDimensionEnum.area,
        emitCondition: this.queryConditions.filterConditions
      };
    }
    this.assetRatioFilterConditionEmit.emit(this.filterCondition);
  }

  /**
   * ?????????????????????????????????
   */
  public reset(): void {
    this.formStatus.resetData(this.formDefaultValue);
    if (this.allAreaIdList.length) {
      this.formStatus.resetControlData('selectAreaOrProject', this.allAreaIdList);
    }
    this.selectAreaIds = this.allAreaIdList;
    this.areaName = this.allAreaName;
    this.setAreaSelectAll(this.treeNodes);
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
   * ????????????
   * @param event PageModel
   */
  public pageChange(event: PageModel): void {
    this.projectQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.projectQueryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshData();
  }

  /**
   * ????????????
   */
  private initColumn(): void {
    const arr = CommonUtil.codeTranslate(AssetAnalysisStatisticalDimensionEnum, this.$nzI18n, null, `${LanguageEnum.facility}.assetAnalysis`) as any[];
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
          const statisticalDimensionColumn = this.formColumn.find(item => item.key === 'statisticalDimension');
          if ($event === AssetAnalysisAssetDimensionEnum.facility) {
            if (statisticalDimensionColumn) {
              statisticalDimensionColumn.selectInfo.data = CommonUtil.codeTranslate(AssetAnalysisStatisticalDimensionEnum, this.$nzI18n, null, `${LanguageEnum.facility}.assetAnalysis`);
            }
          } else {
            if (statisticalDimensionColumn) {
              this.formStatus.resetControlData('statisticalDimension', AssetAnalysisStatisticalDimensionEnum.area);
              statisticalDimensionColumn.selectInfo.data.splice(1, 1);
            }
          }
        }
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
          data: arr,
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
    ];
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
   * ????????????????????????????????????????????????
   * param nodes
   */
   private setAreaSelectAll(nodes): void {
    nodes.forEach(item => {
      item.checked = true;
      if (item.children && item.children.length) {
        this.setAreaSelectAll(item.children);
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
