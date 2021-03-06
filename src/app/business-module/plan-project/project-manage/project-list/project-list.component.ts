import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ProjectInfoModel} from '../../share/model/project-info.model';
import {PageModel} from '../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../shared-module/model/query-condition.model';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {NzI18nService} from 'ng-zorro-antd';
import {Router} from '@angular/router';
import {PlanProjectApiService} from '../../share/service/plan-project.service';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {PlanProjectLanguageInterface} from '../../../../../assets/i18n/plan-project/plan-project.language.interface';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {ProjectStatusEnum} from '../../share/enum/project-status.enum';
import {SliderCommon} from '../../../../core-module/model/slider-common';
import {ProjectStatusIconEnum} from '../../share/enum/project-status-icon.enum';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {ListExportModel} from '../../../../core-module/model/list-export.model';
import {ExportRequestModel} from '../../../../shared-module/model/export-request.model';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import * as _ from 'lodash';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {HIDDEN_SLIDER_HIGH_CONST, SHOW_SLIDER_HIGH_CONST} from '../../../facility/share/const/facility-common.const';
import {PointStatusEnum} from '../../share/enum/point-status.enum';
import {OperateTypeEnum} from '../../../../shared-module/enum/page-operate-type.enum';

/**
 * ???????????? ??????????????????
 */
@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  // ??????????????????
  @ViewChild('projectStatusTemp') projectStatusTemp: TemplateRef<HTMLDocument>;
  // ????????????
  @ViewChild('tableComponent') tableComponent: TableComponent;
  // ????????????
  public sliderConfig: Array<SliderCommon> = [];
  // ?????????????????????
  // public dataSet: ProjectInfoModel[] = [];
  public dataSet = [];
  // ????????????????????????
  public pageBean: PageModel = new PageModel();
  // ??????????????????
  public tableConfig: TableConfigModel;
  // ????????????????????????
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // ????????????????????????
  public commonLanguage: CommonLanguageInterface;
  // ?????????????????????
  public language: PlanProjectLanguageInterface;
  // ?????????????????????id??????
  public selectProjectIds: string[] = [];

  // ??????????????????
  public projectStatusEnum = ProjectStatusEnum;
  // ???????????????
  public languageEnum = LanguageEnum;

  // ??????????????????????????????????????????????????????????????????
  public isShowPointStatusWindow: boolean = false;
  public wisdomListDataSet = [];
  // ?????????????????????
  public wisdomListPageBean: PageModel = new PageModel();
  // ???????????????????????????
  public tableWisdomListConfig: TableConfigModel;
  public selectFinishedProjectData = [];

  constructor(
    public $nzI18n: NzI18nService,
    private $router: Router,
    private $message: FiLinkModalService,
    // ????????????
    private $planProjectApiService: PlanProjectApiService
  ) {
  }

  public ngOnInit() {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.planProject);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    // ??????????????????
    this.initTableConfig();
    this.refreshData();
    // ?????????????????? ????????????
    this.sliderConfig = [
      {
        // ????????????
        label: this.language.projectSum,
        iconClass: 'fiLink-work-order-all wisdom-sum',
        textClass: 'wisdom-sum',
        code: null, sum: 0
      },
      {
        // ?????????
        label: this.language.notStarted,
        iconClass: ProjectStatusIconEnum.notStarted,
        textClass: 'no-start',
        code: ProjectStatusEnum.notStarted, sum: 0
      },
      {
        // ?????????
        label: this.language.working,
        iconClass: ProjectStatusIconEnum.working,
        textClass: 'project-working',
        code: ProjectStatusEnum.working, sum: 0
      },
      {
        // ??????
        label: this.language.delayed,
        iconClass: ProjectStatusIconEnum.delayed,
        textClass: 'project-delayed',
        code: ProjectStatusEnum.delayed, sum: 0
      },
      {
        // ?????????
        label: this.language.finished,
        iconClass: ProjectStatusIconEnum.finished,
        textClass: 'project-finished',
        code: ProjectStatusEnum.finished, sum: 0
      }
    ];
    // ????????????????????????
    this.queryProjectInfoStatistics();
  }

  /**
   * ????????????
   * @param event PageModel
   */
  public pageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshData();
  }

  /**
   * ??????????????????
   */
  public sliderChange(event) {
    if (event.code) {
      // ????????????????????????????????????
      this.tableComponent.searchDate = {};
      this.tableComponent.rangDateValue = {};
      this.tableComponent.tableService.resetFilterConditions(this.tableComponent.queryTerm);
      this.tableComponent.handleSetControlData('status', [event.code]);
      this.tableComponent.handleSearch();
    } else {
      this.tableComponent.handleRest();
    }
  }

  /**
   * ????????????
   * param event
   */
  public slideShowChange(event) {
    if (event) {
      this.tableConfig.outHeight = SHOW_SLIDER_HIGH_CONST;
    } else {
      this.tableConfig.outHeight = HIDDEN_SLIDER_HIGH_CONST;
    }
    this.tableComponent.calcTableHeight();
  }

  /**
   * ?????????????????????
   * @param event ????????????
   */
  public wisdomListPageChange(event) {

  }

  /**
   * ???????????????????????????
   */
  public handleOk() {
    this.finishProject();
  }

  /**
   * ??????
   */
  public handleCancel() {
    this.isShowPointStatusWindow = false;
  }

  /**
   * ????????????????????????
   */
  private queryProjectInfoStatistics(): void {
    this.$planProjectApiService.queryProjectInfoStatistics().subscribe((result) => {
      if (result.code === ResultCodeEnum.success) {
        this.sliderConfig.forEach(item => {
          const temp = result.data.find(_item => _item.status === item.code);
          if (temp) {
            item.sum = temp.number;
          }
        });
        this.sliderConfig[0].sum = _.sumBy(result.data, 'number') || 0;
      }
    });
  }

  /**
   * ?????????????????????
   */
  private initTableConfig() {
    this.tableConfig = {
      isDraggable: true,
      isLoading: true,
      outHeight: 108,
      primaryKey: 'projectManageList',
      keepSelected: true,
      selectedIdKey: 'projectId',
      showSearchSwitch: true,
      scroll: {x: '1804px', y: '340px'},
      noIndex: true,
      showSearchExport: true,
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
          title: this.language.projectName,
          key: 'projectName',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.language.projectCode,
          key: 'projectCode',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.language.projectScale,
          key: 'projectScale',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.language.builtCount,
          key: 'builtCount',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.language.buildingCount,
          key: 'buildingCount',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.language.projectStatus,
          key: 'status',
          type: 'render',
          renderTemplate: this.projectStatusTemp,
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {
            type: 'select',
            selectType: 'multiple',
            selectInfo: CommonUtil.codeTranslate(ProjectStatusEnum, this.$nzI18n, null, LanguageEnum.planProject),
            label: 'label',
            value: 'code'
          }
        },
        { // ????????????
          title: this.language.builtDept,
          key: 'builtDept',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.language.manager,
          key: 'manager',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.language.designUnit,
          key: 'designUnit',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.language.buildUnit,
          key: 'buildUnit',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.language.supervisionUnit,
          key: 'supervisionUnit',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ??????
          title: this.language.remark,
          key: 'remark',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
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
      topButtons: [
        { // ??????
          text: '??????',
          iconClassName: 'fiLink-add-no-circle',
          handle: () => {
            this.$router.navigate(['business/plan-project/project-detail/add']).then();
          }
        },
        { // ??????
          text: this.commonLanguage.deleteBtn,
          btnType: 'danger',
          className: 'table-top-delete-btn',
          iconClassName: 'fiLink-delete',
          canDisabled: true,
          handle: () => {
            this.deleteProjectInfo(this.selectProjectIds);
          }
        },
        { // ????????????
          text: this.language.startProject,
          btnType: 'danger',
          canDisabled: true,
          needConfirm: true,
          // confirmTitle: '???????????????????',
          confirmContent: '???????????????????',
          handle: (event) => {
            // ??????????????????????????????
            let canOperate = true;
            event.forEach(item => {
              if (item.status !== ProjectStatusEnum.notStarted) {
                canOperate = false;
                return;
              }
            });
            if (canOperate) {
              this.startProject(this.selectProjectIds);
            } else {
              this.$message.info(this.language.onlyStartNoStartSProject);
            }

          }
        },
        { // ????????????
          text: this.language.endProject,
          btnType: 'danger',
          canDisabled: true,
          handle: (event) => {
            let canOperate = true;
            // ???????????????????????????
            event.forEach(item => {
                if (item.status === ProjectStatusEnum.notStarted || item.status === ProjectStatusEnum.finished) {
                  canOperate = false;
                  return;
                }
              }
            );
            if (canOperate) {
              this.showWisdomList(this.selectProjectIds);
            } else {
              this.$message.info(this.language.onlyEndWorkingProject);
            }
          }
        }
      ],
      operation: [
        { // ??????
          text: '??????',
          className: 'fiLink-location',
          handle: () => {
          }
        },
        { // ????????????
          text: this.commonLanguage.edit,
          className: 'fiLink-edit',
          handle: (event: ProjectInfoModel) => {
            if (event.status === ProjectStatusEnum.finished) {
              this.$message.info(this.language.cannotModify);
              return;
            }
            this.$router.navigate(['business/plan-project/project-detail/update'],
              {queryParams: {id: event.projectId}}).then();
          }
        },
        { // ??????????????????
          text: this.commonLanguage.edit,
          className: 'fiLink-coordinate-edit-icon',
          handle: (event: ProjectInfoModel) => {
            this.$router.navigate(['business/plan-project/point-detail'],
              {queryParams: {
                type: OperateTypeEnum.update,
                id: event.projectId}}).then();
          }
        },
        { // ????????????
          text: this.language.startProject,
          className: 'fiLink-flink_qidong-icon',
          needConfirm: true,
          // confirmTitle: '???????????????????',
          confirmContent: '???????????????????',
          handle: (event: ProjectInfoModel) => {
            if (event.status !== ProjectStatusEnum.notStarted) {
              this.$message.info(this.language.onlyStartNoStartSProject);
              return;
            }
            this.startProject([event.projectId]);
          }
        },
        { // ????????????
          text: this.language.endProject,
          className: 'fiLink-flink_jiesu-icon',
          iconClassName: 'fiLink-flink_jiesu-icon',
          handle: (event: ProjectInfoModel) => {
            if (event.status === ProjectStatusEnum.notStarted || event.status === ProjectStatusEnum.finished) {
              this.$message.info(this.language.onlyEndWorkingProject);
              return;
            }
            this.showWisdomList([event.projectId]);
            this.selectFinishedProjectData.push({projectId: event.projectId});
          }
        },
        { // ??????
          text: this.commonLanguage.deleteBtn,
          className: 'fiLink-delete red-icon',
          iconClassName: 'fiLink-delete',
          btnType: 'danger',
          handle: (event: ProjectInfoModel) => {
            this.deleteProjectInfo([event.projectId]);
          }
        }
      ],
      // ??????
      handleSelect: (event: ProjectInfoModel[]) => {
        if (!event.length) {
          this.selectProjectIds = [];
          return;
        }
        event.forEach(item => {
          this.selectProjectIds.push(item.projectId);
        });
      },
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition = event;
        this.refreshData();
      },
      // ????????????
      handleSearch: (e: FilterCondition[]) => {
        this.queryCondition.pageCondition.pageNum = 1;
        this.queryCondition.filterConditions = e;
        this.refreshData();
      },
      // ??????
      handleExport: (event: ListExportModel<ProjectInfoModel[]>) => {
        // ????????????????????????????????????
        const exportData = new ExportRequestModel(event.columnInfoList, event.excelType);
        //  ?????????????????????
        if (event && !_.isEmpty(event.selectItem)) {
          const projectIds = event.selectItem.map(item => item.projectId);
          exportData.queryCondition.filterConditions = exportData.queryCondition.filterConditions.concat([new FilterCondition('projectId', OperatorEnum.in, projectIds)]);
        } else {
          exportData.queryCondition.filterConditions = event.queryTerm;
        }
        // ????????????
        this.$planProjectApiService.exportProjectList(exportData).subscribe((res: ResultModel<string>) => {
          if (res.code === ResultCodeEnum.success) {
            this.$message.success(res.msg);
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    };
  }

  private initWisdomTable() {
    this.tableWisdomListConfig = {
      isDraggable: true,
      isLoading: true,
      outHeight: 108,
      notShowPrint: true,
      showSizeChanger: false,
      showSearchSwitch: false,
      showPagination: true,
      scroll: {x: '1804px', y: '340px'},
      selectedIdKey: 'projectId',
      noIndex: true,
      columnConfig: [
        { // ??????
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
        { // ???????????????
          title: this.language.wisdomName, key: 'pointName', width: 150,
          isShowSort: true,
          // searchable: true,
          // searchConfig: {type: 'input'}
        },
        { // ????????????
          title: '????????????', key: 'projectName', width: 150,
          isShowSort: true,
          // searchable: true,
          // searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.language.planId, key: 'planId', width: 150,
          isShowSort: true,
          // searchable: true,
          // searchConfig: {type: 'input'}
        },
      ],
      handleSelect: (current) => {
        this.selectFinishedProjectData = current;
      }
    };
  }

  /**
   * ??????????????????
   */
  private refreshData(): void {
    this.tableConfig.isLoading = true;
    this.$planProjectApiService.queryProjectInfoListByPage(this.queryCondition).subscribe((res: ResultModel<any>) => {
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
   * ????????????
   * @param data ???????????????
   */
  private startProject(data: string[]): void {
    this.$planProjectApiService.startProject(data).subscribe((result) => {
      if (result.code === ResultCodeEnum.success) {
        console.log(result.data);
        this.$message.success(result.msg);
        this.refreshData();
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ???????????????????????????????????????
   * @param data ????????????
   */
  private showWisdomList(data: string[]) {
    this.isShowPointStatusWindow = true;
    this.initWisdomTable();
    this.queryBuildingPointByPage(data);
  }

  /**
   * ????????????
   */
  private finishProject(): void {
    const projectIds = [];
    const pointIds = [];
    this.selectFinishedProjectData.forEach(item => {
      if (item.projectId) {
        projectIds.push(item.projectId);
      }
      if (item.pointId) {
        pointIds.push(item.pointId);
      }
    });
    this.$planProjectApiService.finishProject(
      {
        projectIds: projectIds,
        pointIds: pointIds
      }).subscribe((result) => {
      if (result.code === ResultCodeEnum.success) {
        this.isShowPointStatusWindow = false;
        this.$message.success(result.msg);
        this.refreshData();
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ??????????????????????????????????????????(???????????????)
   */
  private queryBuildingPointByPage(data) {
    this.tableWisdomListConfig.isLoading = true;
    const queryCondition = new QueryConditionModel();
    queryCondition.filterConditions.push(new FilterCondition('projectId', OperatorEnum.in, data));
    queryCondition.filterConditions.push(new FilterCondition('pointStatus', OperatorEnum.eq, PointStatusEnum.underConstruction));
    this.$planProjectApiService.queryBuildingPointByPage(queryCondition).subscribe((result) => {
      this.tableWisdomListConfig.isLoading = false;
      if (result.code === ResultCodeEnum.success) {
        this.wisdomListDataSet = result.data || [];
        this.wisdomListPageBean.pageIndex = result.pageNum;
        this.wisdomListPageBean.Total = result.totalCount;
        this.wisdomListPageBean.pageSize = result.size;
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ????????????
   * @param data ???????????????
   */
  private deleteProjectInfo(data: string[]): void {
    this.$planProjectApiService.deleteProjectInfo(data).subscribe((result) => {
      if (result.code === ResultCodeEnum.success) {
        this.$message.success(result.msg);
        this.refreshData();
      } else {
        this.$message.error(result.msg);
      }
    });
  }
}
