import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NzI18nService} from 'ng-zorro-antd';
import * as _ from 'lodash';
import {IndexApiService} from '../../service/index/index-api.service';
import {MapCoverageService} from '../../../../shared-module/service/index/map-coverage.service';
import {EquipmentListModel, FacilityListModel} from '../../shared/model/facility-equipment-config.model';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {
  FilterCondition,
  QueryConditionModel,
  SortCondition
} from '../../../../shared-module/model/query-condition.model';
import {ResultCodeEnum} from 'src/app/shared-module/enum/result-code.enum';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {PositionService} from '../../service/position.service';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {PageSizeEnum} from '../../../../shared-module/enum/page-size.enum';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {PageModel} from '../../../../shared-module/model/page.model';
import {IndexLanguageInterface} from '../../../../../assets/i18n/index/index.language.interface';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {EquipmentListResultModel} from '../../shared/model/facilities-card.model';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {MapStoreService} from '../../../../core-module/store/map.store.service';
import {SessionUtil} from '../../../../shared-module/util/session-util';
import {
  DeviceStatusEnum,
  DeviceTypeEnum,
  FacilityListTypeEnum
} from '../../../../core-module/enum/facility/facility.enum';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {EquipmentStatusEnum, EquipmentTypeEnum} from '../../../../core-module/enum/equipment/equipment.enum';
import {EquipmentModel} from '../../../../core-module/model/equipment/equipment.model';


@Component({
  selector: 'app-planning-liat-left-card',
  templateUrl: './planning-liat-left-card.component.html',
  styleUrls: ['./planning-liat-left-card.component.scss']
})
export class PlanningLiatLeftCardComponent implements OnInit, OnChanges {
  // ???????????????????????????
  @Input() facilityData: string[] = [];
  // ???????????????????????????
  @Input() equipmentData: string[] = [];
  // ???????????????????????????
  @Input() areaData: string[] = [];
  // ???????????????????????????
  @Input() planningData: string[] = [];
  // ????????????????????????????????????
  @Input() smartPoleModelData: string[] = [];
  // ?????????????????????????????????
  @Input() constructionStatusData: string[] = [];
  // ???????????????????????????
  @Input() groupData: string[] = [];
  // ????????????????????????????????????
  @Input() isShowPlanningOrProject: boolean;
  // ???????????????????????????
  @Output() FacilityEquipmentListEvent = new EventEmitter<any>();
  // ????????????
  @ViewChild('facilityListTable') facilityListTable: TableComponent;
  // ????????????
  @ViewChild('equipmentListTable') equipmentListTable: TableComponent;
  // ?????????
  public indexLanguage: IndexLanguageInterface;
  // ????????????????????????
  public facilityEquipmentList = FacilityListTypeEnum;
  // ?????????????????????
  public planningListDataSet: FacilityListModel[] = [];
  // ????????????????????????
  public planningListPageBean: PageModel = new PageModel(5, 1, 0);
  // ????????????????????????
  public planningListTableConfig: TableConfigModel;
  // ?????????????????????
  public projectListDataSet: EquipmentListModel[] = [];
  // ??????????????????
  public projectListPageBean: PageModel = new PageModel(5, 1, 0);
  // ????????????????????????
  public projectListTableConfig: TableConfigModel;
  // ??????????????????????????????
  public buttonDisabled: boolean = true;
  // ??????????????????
  public roleDeviceOperating: boolean = false;
  // ?????????????????????????????????
  public deviceIsEquipmentTypes: string[];
  // ????????????????????????
  public equipmentTypes: string[];
  // ?????????????????????
  public facilityOrEquipment: string = FacilityListTypeEnum.facilitiesList;
  // ??????
  private more: string;
  // ??????????????????
  private planningQueryCondition: QueryConditionModel = new QueryConditionModel();
  // ??????????????????
  private projectQueryCondition: QueryConditionModel = new QueryConditionModel();
  // ????????????????????????
  private facilitySelectData: string[] = [];
  // ????????????????????????
  private equipmentSelectData: string[] = [];

  constructor(
    public $nzI18n: NzI18nService,
    private $router: Router,
    private $indexApiService: IndexApiService,
    private $positionService: PositionService,
    private $message: FiLinkModalService,
    private $mapCoverageService: MapCoverageService,
    private $mapStoreService: MapStoreService) {
    this.indexLanguage = $nzI18n.getLocaleData(LanguageEnum.index);
  }

  public ngOnInit(): void {
    this.more = this.indexLanguage.more;
    // ????????????????????????
    this.initPlanningListTable();
    this.planningListTableConfig.isLoading = false;
    // ????????????????????????
    this.initProjectListTable();
    this.projectListTableConfig.isLoading = false;
    // ?????????????????? ?????????????????????????????????????????????
    if (SessionUtil.checkHasRole('05-1') &&
      (SessionUtil.checkHasTenantRole('1-1-6') || SessionUtil.checkHasTenantRole('1-1-7'))) {
      this.roleDeviceOperating = true;
    }
    this.getPlanningListTable();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.facilityData && changes.facilityData.currentValue.length > 0 && this.planningListTableConfig || (changes.groupData && changes.groupData.currentValue)) {
      // ???????????????????????????????????????
      this.planningQueryCondition = new QueryConditionModel();
      this.planningQueryCondition.pageCondition.pageNum = 1;
      if (this.planningListTableConfig) {
        this.getPlanningListTable();
      }
      this.initPlanningListTable();
    }
    if (changes.equipmentData && changes.equipmentData.currentValue && this.projectListTableConfig || (changes.groupData && changes.groupData.currentValue)) {
      // ???????????????????????????????????????
      this.projectQueryCondition = new QueryConditionModel();
      this.projectQueryCondition.pageCondition.pageNum = 1;
      if (this.projectListTableConfig) {
        this.getProjectListTable();

      }
      this.initProjectListTable();
    }
    // ????????????????????????
    if (changes.areaData && !changes.areaData.firstChange) {
      this.getPlanningListTable();
      this.getProjectListTable();
    }
  }

  /**
   * ??????????????????
   */
  public pagePlanningList(event: PageModel): void {
    this.planningQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.planningQueryCondition.pageCondition.pageSize = event.pageSize;
    this.getPlanningListTable();
  }

  /**
   * ??????????????????
   */
  public pageProjectList(event: PageModel): void {
    this.projectQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.projectQueryCondition.pageCondition.pageSize = event.pageSize;
    this.getProjectListTable();
  }

  /**
   * ???????????????
   */
  public goToFacilityList(): void {
    if (this.isShowPlanningOrProject === true) {
      // ????????????
      this.$router.navigate([`/business/facility/facility-list`], {}).then();
    } else {
      // ????????????
      this.$router.navigate([`/business/facility/equipment-list`], {}).then();
    }
  }

  /**
   * ??????????????????
   */
  public showSearch(): void {
    if (this.facilityOrEquipment === FacilityListTypeEnum.facilitiesList) {
      this.planningListTableConfig.showSearch = !this.planningListTableConfig.showSearch;
    } else {
      this.projectListTableConfig.showSearch = !this.projectListTableConfig.showSearch;
    }
  }

  /**
   * ??????????????????
   */
  private initPlanningListTable(): void {
    if (!_.isEmpty(this.facilitySelectData)) {
      this.facilityListTable.checkAll(false);
    }
    this.planningListTableConfig = {
      isDraggable: true,
      isLoading: true,
      simplePageTotalShow: true,
      notShowPrint: true,
      showSearchSwitch: false,
      showRowSelection: false,
      showSizeChanger: true,
      showSearchExport: false,
      keepSelected: true,
      selectedIdKey: 'deviceId',
      searchReturnType: 'object',
      scroll: {x: '600px', y: '600px'},
      showPagination: true,
      simplePage: true,
      bordered: false,
      showSearch: false,
      noIndex: true,
      columnConfig: [
        {
          type: 'select',
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
          width: 50,
        },
        {// ????????????
          title: '????????????', key: 'planName', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// ????????????
          title: '????????????', key: 'planCode', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// ??????
          title: '??????', key: 'longitude', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// ??????
          title: '??????', key: 'latitude', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// ??????
          title: this.indexLanguage.operation, key: '', width: 80,
          searchable: true,
          searchConfig: {type: 'operate'},
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      operation: [],
      sort: (event: SortCondition) => {
        // ??????
        this.planningQueryCondition.sortCondition.sortField = event.sortField;
        this.planningQueryCondition.sortCondition.sortRule = event.sortRule;
        this.getPlanningListTable();
      },
      handleSearch: (event: FilterCondition) => {
        // ??????
        this.planningQueryCondition.filterConditions = [];
        for (const item in event) {
          if (event[item]) {
            if (['deviceType', 'deviceStatus'].includes(item) && event[item].length > 0) {
              // ?????????????????????????????????in??????
              this.planningQueryCondition.filterConditions.push(new FilterCondition(item, OperatorEnum.in, event[item]));
            } else if (['deviceName', 'address'].includes(item)) {
              // ???????????????????????????like??????
              this.planningQueryCondition.filterConditions.push(new FilterCondition(item, OperatorEnum.like, event[item]));
            }
          }
        }
        this.planningQueryCondition.pageCondition.pageNum = 1;
        this.getPlanningListTable();
      },
      handleSelect: (event: FacilityListModel[]) => {
      }
    };
  }

  /**
   * ????????????????????????
   */
  private getPlanningListTable(): void {
    if (this.planningData) {
      this.planningQueryCondition.filterConditions = [];
      this.planningQueryCondition.pageCondition.pageSize = PageSizeEnum.sizeFive;
      this.planningListTableConfig.isLoading = true;
      this.$indexApiService.getPlanPoleList(this.planningQueryCondition).subscribe((result: ResultModel<any>) => {
        if (result.code === ResultCodeEnum.success) {
          this.planningListPageBean.Total = result.data.totalCount;
          this.planningListPageBean.pageIndex = result.data.pageNum;
          this.planningListPageBean.pageSize = result.data.size;
          this.planningListDataSet = result.data.data;
        } else {
          this.$message.error(result.msg);
        }
        this.planningListTableConfig.isLoading = false;
      }, error => {
        this.planningListTableConfig.isLoading = false;
      });
    }
  }

  /**
   * ??????????????????
   */
  private initProjectListTable(): void {
    if (!_.isEmpty(this.equipmentSelectData)) {
      this.equipmentListTable.checkAll(false);
    }
    this.projectListTableConfig = {
      isDraggable: true,
      isLoading: false,
      simplePageTotalShow: true,
      notShowPrint: true,
      showSearchSwitch: false,
      showRowSelection: false,
      showSizeChanger: true,
      showSearchExport: false,
      keepSelected: true,
      selectedIdKey: 'equipmentId',
      searchReturnType: 'object',
      scroll: {x: '600px', y: '600px'},
      showPagination: true,
      simplePage: true,
      bordered: false,
      showSearch: false,
      noIndex: true,
      columnConfig: [
        {
          type: 'select',
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
          width: 50,
        },
        {// ????????????
          title: '????????????', key: 'projectName', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// ????????????
          title: '????????????', key: 'projectCode', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// ??????
          title: '??????', key: 'longitude', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// ??????
          title: '??????', key: 'latitude', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// ??????
          title: this.indexLanguage.operation, key: '', width: 80,
          configurable: false,
          searchable: true,
          searchConfig: {type: 'operate'},
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      operation: [],
      sort: (event: SortCondition) => {
        // ??????
        this.projectQueryCondition.sortCondition.sortField = event.sortField;
        this.projectQueryCondition.sortCondition.sortRule = event.sortRule;
        this.getProjectListTable();
      },
      handleSearch: (event) => {
        // ??????
        this.projectQueryCondition.filterConditions = [];
        for (const item in event) {
          if (event[item]) {
            if (['equipmentType', 'equipmentStatus'].includes(item) && event[item].length > 0) {
              // ?????????????????????????????????in??????
              this.projectQueryCondition.filterConditions.push(new FilterCondition(item, OperatorEnum.in, event[item]));
            } else if (['equipmentName', 'deviceName', 'address'].includes(item)) {
              // ????????????????????????????????????????????????like??????
              this.projectQueryCondition.filterConditions.push(new FilterCondition(item, OperatorEnum.like, event[item]));
            }
          }
        }
        this.projectQueryCondition.pageCondition.pageNum = 1;
        this.getProjectListTable();
      },
      handleSelect: (event: EquipmentListModel[]) => {
      }
    };
  }

  /**
   * ????????????????????????
   */
  private getProjectListTable(): void {
    if (this.areaData) {
      this.projectQueryCondition.bizCondition = {
        'area': this.areaData,
        'equipment': this.equipmentData,
        'group': this.$mapStoreService.logicGroupList ? this.$mapStoreService.logicGroupList : this.groupData
      };
      this.projectQueryCondition.pageCondition.pageSize = 5;
      this.projectListTableConfig.isLoading = true;
      this.$indexApiService.queryEquipmentList(this.projectQueryCondition).subscribe((result: ResultModel<EquipmentListModel[]>) => {
        if (result.code === ResultCodeEnum.success) {
          this.projectListPageBean.Total = result.totalCount;
          this.projectListPageBean.pageIndex = result.pageNum;
          this.projectListPageBean.pageSize = result.size;
          // ???????????????????????????????????????
          result.data.forEach(item => {
            this.equipmentSelectData.forEach(_item => {
              if (item.equipmentId === _item) {
                item.checked = true;
              }
            });
            item.cloneEquipmentType = item.equipmentType;
            item.facilityType = 'equipment';
            item.show = true;
            item.cloneEquipmentStatus = item.equipmentStatus;
            item.equipmentType = CommonUtil.codeTranslate(EquipmentTypeEnum, this.$nzI18n, item.equipmentType, LanguageEnum.facility);
            item.equipmentStatus = CommonUtil.codeTranslate(EquipmentStatusEnum, this.$nzI18n, item.equipmentStatus, LanguageEnum.facility);
          });
          this.projectListDataSet = result.data;
        } else {
          this.$message.error(result.msg);
        }
        this.projectListTableConfig.isLoading = false;
      }, error => {
        this.projectListTableConfig.isLoading = false;
      });
    }
  }

  /**
   * ????????????id??????????????????Id
   */
  private queryEquipmentAllId(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const body = new EquipmentListResultModel(this.facilitySelectData);
      this.$indexApiService.queryEquipmentListByDeviceId(body).subscribe((result: ResultModel<EquipmentModel[]>) => {
        const list = result.data.map(item => {
          return item.equipmentId;
        });
        this.deviceIsEquipmentTypes = result.data.map(item => {
          return item.equipmentType;
        });
        resolve(list);
      });
    });
  }
}
