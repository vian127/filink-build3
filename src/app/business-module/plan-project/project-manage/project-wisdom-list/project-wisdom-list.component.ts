import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {SliderCommon} from '../../../../core-module/model/slider-common';
import {HIDDEN_SLIDER_HIGH_CONST, SHOW_SLIDER_HIGH_CONST} from '../../../facility/share/const/facility-common.const';
import {PageModel} from '../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../shared-module/model/query-condition.model';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {PlanProjectLanguageInterface} from '../../../../../assets/i18n/plan-project/plan-project.language.interface';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {WisdomPointInfoModel} from '../../share/model/wisdom-point-info.model';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {NzI18nService} from 'ng-zorro-antd';
import {PlanningListTableUtil} from '../../share/util/planning-list-table.util';
import {PointStatusEnum} from '../../share/enum/point-status.enum';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {PlanProjectApiService} from '../../share/service/plan-project.service';
import {PointStatusIconEnum} from '../../share/enum/point-status-icon.enum';
import {Router} from '@angular/router';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import * as _ from 'lodash';
import {SliderConfigModel} from '../../../facility/share/model/slider-config.model';
import {ListExportModel} from '../../../../core-module/model/list-export.model';
import {ExportRequestModel} from '../../../../shared-module/model/export-request.model';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {ResultModel} from '../../../../shared-module/model/result.model';

@Component({
  selector: 'app-project-wisdom-list',
  templateUrl: './project-wisdom-list.component.html',
  styleUrls: ['./project-wisdom-list.component.scss']
})
export class ProjectWisdomListComponent implements OnInit {

  // ????????????
  @ViewChild('tableComponent') tableComponent: TableComponent;
  // ???????????????
  @ViewChild('pointStatusTemp') pointStatusTemp: TemplateRef<HTMLDocument>;
  // ????????????
  public sliderConfig: Array<SliderCommon> = [];
  // ??????????????????????????????
  // public dataSet: WisdomPointInfoModel[] = [];
  public dataSet = [];
  // ?????????????????????????????????
  public pageBean: PageModel = new PageModel();
  // ???????????????????????????
  public tableConfig: TableConfigModel;
  // ?????????????????????????????????
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // ????????????????????????
  public commonLanguage: CommonLanguageInterface;
  // ?????????????????????
  public language: PlanProjectLanguageInterface;
  // ?????????????????????
  public pointStatusEnum = PointStatusEnum;
  // ???????????????
  public languageEnum = LanguageEnum;
  // ????????????????????????
  public selectWisdomData: WisdomPointInfoModel[] = [];

  constructor(
    public $nzI18n: NzI18nService,
    private $router: Router,
    private $message: FiLinkModalService,
    // ????????????
    private $planProjectApiService: PlanProjectApiService
  ) {
  }

  ngOnInit() {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.planProject);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    // ??????????????????
    this.initTableConfig();
    this.refreshData();
    this.sliderConfig = [
      {
        // ???????????????
        label: this.language.wisdomSum,
        iconClass: 'fiLink-work-order-all wisdom-sum',
        textClass: 'wisdom-sum',
        code: null, sum: 0
      },
      // ??????
      {
        label: this.language.toBeBuilt,
        iconClass: PointStatusIconEnum.runnable,
        textClass: 'to-be-built',
        code: PointStatusEnum.toBeBuilt, sum: 0
      },
      // ??????
      {
        label: this.language.underConstruction,
        iconClass: PointStatusIconEnum.running,
        textClass: 'under-construction',
        code: PointStatusEnum.underConstruction, sum: 0
      },
      //   ??????
      {
        label: this.language.hasBeenBuilt,
        iconClass: PointStatusIconEnum.end,
        textClass: 'has-been-built',
        code: PointStatusEnum.hasBeenBuilt, sum: 0
      },
    ];
    // ????????????????????????
    this.queryProjectPoleStatistics();
  }

  /**
   * ?????????????????????????????????
   * param event
   */
  public sliderChange(event: SliderConfigModel): void {
    if (event.code) {
      // ????????????????????????????????????
      this.tableComponent.searchDate = {};
      this.tableComponent.rangDateValue = {};
      this.tableComponent.tableService.resetFilterConditions(this.tableComponent.queryTerm);
      this.tableComponent.handleSetControlData('pointStatus', [event.code]);
      this.tableComponent.handleSearch();
    } else {
      this.tableComponent.handleRest();
    }
  }

  /**
   * ????????????
   * param event
   */
  public slideShowChange(event: SliderConfigModel) {
    if (event) {
      this.tableConfig.outHeight = SHOW_SLIDER_HIGH_CONST;
    } else {
      this.tableConfig.outHeight = HIDDEN_SLIDER_HIGH_CONST;
    }
    this.tableComponent.calcTableHeight();
  }

  /**
   * ????????????
   * param event
   */
  public pageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.refreshData();
  }

  /**
   * ??????????????????????????????
   */
  private initTableConfig() {
    const columnConfig = PlanningListTableUtil.getWisdomColumnConfig(this, this.$nzI18n);
    columnConfig.splice(-1, 0, {
      // ????????????
      title: this.language.belongProject, key: 'projectName', width: 150,
      isShowSort: true,
      searchable: true,
      configurable: true,
      searchConfig: {type: 'input'}
    });
    this.tableConfig = {
      isDraggable: true,
      isLoading: true,
      outHeight: 108,
      primaryKey: 'planProjectWisdomList',
      keepSelected: true,
      selectedIdKey: 'projectId',
      showSearchSwitch: true,
      scroll: {x: '1804px', y: '340px'},
      noIndex: true,
      showSearchExport: true,
      columnConfig: columnConfig,
      topButtons: [
        { // ????????????
          text: '????????????',
          iconClassName: 'fiLink-refresh-index',
          confirmContent: this.language.confirmPointStatusInfo,
          confirmTitle: this.language.ifUpdateStatus,
          needConfirm: true,
          handle: () => {
            this.updateProjectStatus(this.selectWisdomData.map(item => item.pointId));
          }
        },
      ],
      operation: [
        { // ??????
          text: '??????',
          className: 'fiLink-location',
          handle: () => {
          }
        },
        { // ???????????????
          text: this.commonLanguage.edit,
          className: 'fiLink-edit',
          handle: (event: WisdomPointInfoModel) => {
            this.checkPointCanUpdate(event.pointId);
          }
        },
        { // ????????????
          text: '????????????',
          className: 'fiLink-refresh-index',
          canDisabled: true,
          confirmContent: this.language.confirmPointStatusInfo,
          confirmTitle: this.language.ifUpdateStatus,
          needConfirm: true,
          handle: (event) => {
            this.updateProjectStatus([event.pointId]);
          }
        },
      ],
      // ??????
      handleSelect: (event: WisdomPointInfoModel[]) => {
        this.selectWisdomData = event;
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
      handleExport: (event: ListExportModel<any>) => {
        // ????????????????????????????????????
        const exportData = new ExportRequestModel(event.columnInfoList, event.excelType);
        //  ?????????????????????
        if (event && !_.isEmpty(event.selectItem)) {
          const pointIds = event.selectItem.map(item => item.pointId);
          exportData.queryCondition.filterConditions = exportData.queryCondition.filterConditions.concat([new FilterCondition('pointId', OperatorEnum.in, pointIds)]);
        } else {
          exportData.queryCondition.filterConditions = event.queryTerm;
        }
        // ????????????
        this.$planProjectApiService.exportProjectPoleList(exportData).subscribe((res: ResultModel<string>) => {
          if (res.code === ResultCodeEnum.success) {
            this.$message.success(res.msg);
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    };
  }

  /**
   * ??????????????????
   * @param data ????????????
   */
  private updateProjectStatus(data: string[]): void {
    this.$planProjectApiService.updateProjectStatus(data).subscribe((result) => {
      if (result.code === ResultCodeEnum.success) {
        this.$message.success(result.msg);
        this.refreshData();
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   *  ???????????????????????????????????????
   * @param id ???????????????id
   */
  private checkPointCanUpdate(id): void {
    this.$planProjectApiService.checkPointCanUpdate(id).subscribe((result) => {
      if (result.code === ResultCodeEnum.success && result.data) {
        this.$router.navigate(['business/plan-project/project-wisdom-detail/update'],
          {queryParams: {id: id}}).then();
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ???????????????????????????
   */
  private refreshData(): void {
    this.tableConfig.isLoading = true;
    this.$planProjectApiService.queryProjectPoleByPage(this.queryCondition).subscribe((res) => {
      this.tableConfig.isLoading = false;
      if (res.code === ResultCodeEnum.success) {
        this.dataSet = res.data || [];
        this.dataSet.forEach(item => {
          item.statusIconClass = PointStatusIconEnum[item.pointStatus];
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
  private queryProjectPoleStatistics(): void {
    this.$planProjectApiService.queryProjectPoleStatistics().subscribe((result) => {
      if (result.code === ResultCodeEnum.success) {
        this.sliderConfig.forEach(item => {
          const temp = result.data.find(_item => _item.pointStatus === item.code);
          if (temp) {
            item.sum = temp.pointCount;
          }
        });
        this.sliderConfig[0].sum = _.sumBy(result.data, 'pointCount') || 0;
      }
    });
  }
}
