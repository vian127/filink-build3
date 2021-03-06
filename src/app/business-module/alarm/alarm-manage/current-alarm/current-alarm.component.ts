import {Component, Injectable, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {PageModel} from '../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {ActivatedRoute, Router} from '@angular/router';
import {DateHelperService, NzI18nService, NzModalService, NzTreeNode} from 'ng-zorro-antd';
import * as _ from 'lodash';
import {AlarmLanguageInterface} from '../../../../../assets/i18n/alarm/alarm-language.interface';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {AlarmStoreService} from '../../../../core-module/store/alarm.store.service';
import {CurrentAlarmMissionService} from '../../../../core-module/mission/current-alarm.mission.service';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {FormOperate} from '../../../../shared-module/component/form/form-operate.service';
import {AlarmSelectorConfigModel, AlarmSelectorInitialValueModel} from '../../../../shared-module/model/alarm-selector-config.model';
import {SessionUtil} from '../../../../shared-module/util/session-util';
import {TableService} from '../../../../shared-module/component/table/table.service';
import {ImageViewService} from '../../../../shared-module/service/picture-view/image-view.service';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {TreeSelectorConfigModel} from '../../../../shared-module/model/tree-selector-config.model';
import {FilterCondition, PageCondition, QueryConditionModel} from '../../../../shared-module/model/query-condition.model';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {ObjectTypeEnum} from '../../../../core-module/enum/facility/object-type.enum';
import {PicResourceEnum} from '../../../../core-module/enum/picture/pic-resource.enum';
import {DiagnosticModel} from '../../share/model/diagnostic.model';
import {DepartmentUnitModel} from '../../../../core-module/model/work-order/department-unit.model';
import {FilterValueModel} from '../../../../core-module/model/work-order/filter-value.model';
import {SelectModel} from '../../../../shared-module/model/select.model';
import {QueryRecentlyPicModel} from '../../../../core-module/model/picture/query-recently-pic.model';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {TroubleUtil} from '../../../../core-module/business-util/trouble/trouble-util';
import {SliderPanelModel} from '../../../../shared-module/model/slider-panel.model';
import {EquipmentListModel} from '../../../../core-module/model/equipment/equipment-list.model';
import {getLevelValueEnum} from '../../../../core-module/enum/trouble/trouble-common.enum';
import {QueryCardParamsModel} from '../../share/model/query-card-params.model';
import {ShowTypeEnum} from '../../share/enum/alarm.enum';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {OrderUserModel} from '../../../../core-module/model/work-order/order-user.model';
import {DisplayModel} from '../../share/model/display.model';
import {DeviceTypeCountModel} from '../../../../core-module/model/facility/device-type-count.model';
import {AlarmListModel} from '../../../../core-module/model/alarm/alarm-list.model';
import {CurrentAlarmUtil} from '../../share/util/current-alarm.util';
import {AlarmService} from '../../share/service/alarm.service';
import {AlarmForCommonService} from '../../../../core-module/api-service';
import {AlarmForCommonUtil} from '../../../../core-module/business-util/alarm/alarm-for-common.util';
import {FacilityForCommonUtil} from 'src/app/core-module/business-util/facility/facility-for-common.util';
import {PageTypeEnum} from '../../../../core-module/enum/alarm/alarm-page-type.enum';
import {AlarmCardLevelEnum} from '../../../../core-module/enum/alarm/alarm-card-level.enum';
import {AlarmShowCardNumberEnum} from '../../../../core-module/enum/alarm/alarm-show-card-number.enum';
import {AlarmRemarkModel} from '../../../../core-module/model/alarm/alarm-remark.model';
import {RuleUtil} from '../../../../shared-module/util/rule-util';
import {HIDDEN_SLIDER_HIGH_CONST, SHOW_SLIDER_HIGH_CONST} from '../../../../core-module/const/common.const';
import {QUERY_KEY_DEVICE_ID, QUERY_KEY_ID, QUERY_KEY_SOURCE_ID, QUERY_KEY_SOURCE_TYPE_ID} from '../../share/const/alarm-common.const';
import {AlarmLevelEnum} from '../../../../core-module/enum/alarm/alarm-level.enum';
import {AlarmCleanStatusEnum} from '../../../../core-module/enum/alarm/alarm-clean-status.enum';
import {AlarmConfirmStatusEnum} from '../../../../core-module/enum/alarm/alarm-confirm-status.enum';
import {DeviceTypeEnum} from '../../../../core-module/enum/facility/facility.enum';
import {ExportRequestModel} from '../../../../shared-module/model/export-request.model';
import {AlarmFiltrationModel} from '../../share/model/alarm-filtration.model';
import {AlarmTemplateDataModel} from '../../share/model/alarm-template-data.model';
import {AlarmQueryTypeEnum} from '../../../../core-module/enum/alarm/alarm-query-type.enum';
import {IsRootAlarmEnum} from '../../../../core-module/enum/alarm/is-root-alarm.enum';
import {AlarmAffirmClearModel} from '../../../../core-module/model/alarm/alarm-affirm-clear.model';
import {AlarmClearAffirmModel} from '../../../../core-module/model/alarm/alarm-clear-affirm.model';

/**
 * ??????????????????
 * ??????: ?????????TS??????????????????????????? ???current-alarm-util???????????????????????? ??????????????????
 */
@Component({
  selector: 'app-current-alarm',
  templateUrl: './current-alarm.component.html',
  styleUrls: ['./current-alarm.component.scss'],
  providers: [TableService]
})

@Injectable()

export class CurrentAlarmComponent implements OnInit {
  // ????????????????????????
  @ViewChild('alarmFixedLevelTemp') alarmFixedLevelTemp: TemplateRef<any>;
  // ??????????????????
  @ViewChild('table') table: TableComponent;
  // ????????????????????????
  @ViewChild('isCleanTemp') isCleanTemp: TemplateRef<any>;
  // ??????
  @ViewChild('frequencyTemp') frequencyTemp: TemplateRef<any>;
  // ????????????????????????
  @ViewChild('alarmSourceTypeTemp') alarmSourceTypeTemp: TemplateRef<any>;
  // ????????????????????????
  @ViewChild('isConfirmTemp') isConfirmTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('alarmName') alarmName: TemplateRef<any>;
  // ????????????
  @ViewChild('areaSelector') areaSelectorTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('deviceNameTemp') deviceNameTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('diagnosis') diagnosis: TemplateRef<any>;
  // ????????????(????????????)
  @ViewChild('alarmEquipmentTemp') alarmEquipmentTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('equipmentTypeTemp') equipmentTypeTemp: TemplateRef<any>;
  // ????????????
  public pageType: PageTypeEnum = PageTypeEnum.alarm;
  // ????????????
  public dataSet: AlarmListModel[] = [];
  // ??????????????????
  public pageBean: PageModel = new PageModel();
  // ????????????
  public tableConfig: TableConfigModel;
  // ????????????
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // ?????????????????????
  public language: AlarmLanguageInterface;
  // ??????????????????
  public treeSelectorConfig: TreeSelectorConfigModel;
  // ?????????
  public treeNodes: NzTreeNode[] = [];
  // ????????????
  public accountabilityUnitList: DepartmentUnitModel[] = [];
  // ??????????????????
  public isVisible: boolean = false;
  // ??????????????????
  public selectUnitName: string;
  // ????????????
  public ifSpin: boolean = false;
  // ??????????????????????????????????????????
  public display: DisplayModel = new DisplayModel();
  // ???????????????
  public isLoading: boolean = false;
  // ??????????????????
  public formColumnRemark: FormItem[] = [];
  // ???????????????????????????
  public tableColumnSet: FormItem[] = [];
  // ??????????????????
  public alarmNameConfig: AlarmSelectorConfigModel;
  // ?????????????????????
  public checkAlarmName: AlarmSelectorInitialValueModel = new AlarmSelectorInitialValueModel();
  // ????????????
  public areaConfig: AlarmSelectorConfigModel = new AlarmSelectorConfigModel();
  // ??????
  public areaList: AlarmSelectorInitialValueModel = new AlarmSelectorInitialValueModel();
  // ??????????????????
  public alarmObjectConfig: AlarmSelectorConfigModel;
  // ??????????????????
  public alarmEquipmentConfig: AlarmSelectorConfigModel;
  // ????????????(????????????)
  public checkAlarmEquipment: AlarmSelectorInitialValueModel = new AlarmSelectorInitialValueModel();
  // ????????????
  public checkAlarmObject: AlarmSelectorInitialValueModel = new AlarmSelectorInitialValueModel();
  // ????????????
  public sliderConfig: SliderPanelModel[] = [];
  // ??????????????????
  public alarmHintList: SelectModel[] = [];
  // ????????????????????????
  public alarmHintValue: ShowTypeEnum = ShowTypeEnum.showLevel;
  // ??????ID
  public diagnoseId: string = '';
  // ??????????????????
  public alarmTypeList: SelectModel[] = [];
  // ????????????title
  public deviceTitle: string;
  // ????????????
  public cardNum: AlarmShowCardNumberEnum = AlarmShowCardNumberEnum.fiveCount;
  // ???????????????
  public remarkDis: boolean;
  // ???????????????
  public diagnoseSetDis: boolean;
  // ?????????????????????
  public equipmentVisible: boolean = false;
  // ?????????????????????
  public equipmentFilterValue: FilterCondition;
  // ???????????????
  public checkEquipmentObject: AlarmSelectorInitialValueModel = new AlarmSelectorInitialValueModel();
  // ??????????????????
  public selectEquipments: EquipmentListModel[] = [];
  // ??????ID
  public areaId: string;
  // ???????????????
  public commonLanguage: CommonLanguageInterface;
  // ??????????????????
  public alarmLevelEnum = AlarmLevelEnum;
  // ??????????????????
  public alarmCleanStatusEnum = AlarmCleanStatusEnum;
  // ??????????????????
  public alarmConfirmStatusEnum = AlarmConfirmStatusEnum;
  // ??????????????????
  public deviceTypeEnum = DeviceTypeEnum;
  // ???????????????
  public languageEnum = LanguageEnum;
  // ??????
  public exportParams: ExportRequestModel = new ExportRequestModel();
  // ??????ID
  private templateId: string;
  // filterValue??????
  private filterValue: FilterValueModel;
  // ????????????????????????????????? ??????????????????????????????
  private hasPrompt: boolean = false;
  // ???????????????????????????
  private deviceRoleTypes: SelectModel[];
  // ?????????slide????????????
  private isClickSlider: boolean = false;
  // ??????????????????
  private viewLoading: boolean = false;
  // ??????????????????
  private formStatusSet: FormOperate;
  // ??????????????????
  private alarmIds: AlarmAffirmClearModel[] = [];
  // ????????????
  private correlationIds: AlarmAffirmClearModel[] = [];
  // ????????????
  private formStatusRemark: FormOperate;
  // ??????id
  private alarmId: string = null;
  // ??????id
  private deviceId: string = null;
  // ??????id
  private equipmentId: string = null;
  // ????????????
  private equipmentType: string = null;
  // token
  private token: string = '';
  // ????????????
  private userInfo: OrderUserModel;
  // ??????id
  private userId: string = '';
  // ??????????????????
  private confirmFlag: boolean = true;
  // ??????????????????
  private cleanFlag: boolean = true;
  // ????????????
  private checkRemark: AlarmRemarkModel[] = [];
  // ????????????
  private isCardRefresh: boolean = false;

  constructor(public $router: Router,
              public $nzI18n: NzI18nService,
              public $alarmService: AlarmService,
              public $alarmForCommonService: AlarmForCommonService,
              public $message: FiLinkModalService,
              public $active: ActivatedRoute,
              public $alarmStoreService: AlarmStoreService,
              public $currService: CurrentAlarmMissionService,
              private $ruleUtil: RuleUtil,
              private $dateHelper: DateHelperService,
              private modalService: NzModalService,
              private $imageViewService: ImageViewService) {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.alarm);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
  }

  /**
   * ?????????
   */
  public ngOnInit(): void {
    this.deviceTitle = this.language.deviceName;
    // ??????????????????
    this.alarmHintList = [
      {label: this.language.displayAlarmLevel, code: ShowTypeEnum.showLevel},
      {label: this.language.displayAlarmDeviceType, code: ShowTypeEnum.showType}
    ];
    // ????????????
    this.deviceRoleTypes = FacilityForCommonUtil.getRoleFacility(this.$nzI18n);
    // ?????????????????????
    CurrentAlarmUtil.initTableConfig(this);
    // ??????????????????
    if (SessionUtil.getToken()) {
      this.token = SessionUtil.getToken();
      this.userInfo = SessionUtil.getUserInfo();
      this.userId = this.userInfo['id'];
    }
    // ???????????????????????????
    CurrentAlarmUtil.queryFromPage(this);
    // ??????????????????
    AlarmForCommonUtil.getAlarmTypeList(this.$alarmForCommonService).then((data: SelectModel[]) => {
      this.alarmTypeList = data;
    });
    this.queryCondition.pageCondition = new PageCondition(this.pageBean.pageIndex, this.pageBean.pageSize);
    // ????????????
    this.refreshData();
    // ??????????????????
    CurrentAlarmUtil.initFormRemark(this);
    // ??????
    this.initAreaConfig();
    // ????????????
    this.initAlarmName();
    // ????????????
    this.initAlarmObjectConfig();
    // ????????????
    this.initAlarmEquipment();
    // ?????????????????? ??????????????????
    this.queryDeviceTypeCount(ShowTypeEnum.showLevel);
    // ????????????
    CurrentAlarmUtil.initSetForm(this);
    //  ??????????????????
    this.$active.queryParams.subscribe(param => {
      if (param.id) {
        const arr = this.queryCondition.filterConditions.find(item => {
          return item.filterField === 'id';
        });
        if (!arr) {
          this.queryCondition.filterConditions.push({
            filterField: 'id',
            filterValue: param.id,
            operator: OperatorEnum.eq
          });
        }
        this.queryCondition.pageCondition.pageNum = 1;
        this.refreshData();
      }
    });
  }

  /**
   * ????????????
   */
  public pageChange(event: PageModel): void {
    if (!this.templateId) {
      this.queryCondition.pageCondition.pageNum = event.pageIndex;
      this.queryCondition.pageCondition.pageSize = event.pageSize;
      this.refreshData();
    } else {
      const data = new AlarmTemplateDataModel(new PageCondition(event.pageIndex, this.pageBean.pageSize));
      this.templateList(data);
    }
  }

  /**
   * ????????????????????????
   */
  public formInstanceRemark(event: { instance: FormOperate }): void {
    this.formStatusRemark = event.instance;
    this.formStatusRemark.group.statusChanges.subscribe(() => {
      this.remarkDis = this.formStatusRemark.getValid();
    });
  }

  /**
   * ????????????????????????
   */
  public formInstanceSet(event: { instance: FormOperate }): void {
    this.formStatusSet = event.instance;
    this.formStatusSet.group.statusChanges.subscribe(() => {
      this.diagnoseSetDis = this.formStatusSet.getValid();
    });
  }

  /**
   * ??????????????????????????????
   */
  public refreshData(): void {
    this.tableConfig.isLoading = true;
    this.$alarmService.queryCurrentAlarmList(this.queryCondition).subscribe((res) => {
      this.tableConfig.isLoading = false;
      if (res.code === 0) {
        this.giveList(res);
      } else {
        this.$message.error(res.msg);
      }
    }, (err) => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * ????????????????????? ???????????????
   */
  public giveList(res: ResultModel<AlarmListModel[]>): void {
    // this.pageBean.Total = res.totalCount;
    this.tableConfig.isLoading = false;
    this.pageBean.Total = res.totalPage * res.size;
    this.pageBean.pageIndex = res.pageNum;
    this.pageBean.pageSize = res.size;
    this.dataSet = res.data || [];
    // ????????????????????????????????????????????????????????????s
    const hasId = this.$active.snapshot.queryParams.id || this.$active.snapshot.queryParams.deviceId ||
      this.$active.snapshot.queryParams.equipmentId || this.$active.snapshot.queryParams.alarmSourceTypeId;
    if ((!this.hasPrompt) && this.dataSet.length === 0 && hasId) {
      this.hasPrompt = true;
      this.$message.info(this.language.noCurrentAlarmData);
    }
    this.dataSet.forEach(item => {
      // ???????????????????????????????????????????????????
      item.alarmContinousTime = CommonUtil.setAlarmContinousTime(item.alarmBeginTime, item.alarmCleanTime,
        {year: this.language.year, month: this.language.month, day: this.language.day, hour: this.language.hour});
      // ???????????? / ?????? ?????????
      item.isShowBuildOrder = item.alarmCode === 'orderOutOfTime' ? 'disabled' : 'enable';
      // ?????????????????? ?????????
      item.isShowViewIcon = item.alarmDeviceId ? 'enable' : 'disabled';
      // ????????????
      item.isShowRemark = true;
    });
    this.dataSet = res.data.map(item => {
      this.translateField(item);
      // ???????????????
      if (item.alarmCorrelationList && item.alarmCorrelationList.length > 0) {
        item.alarmCorrelationList.forEach(el => {
          // ???????????? / ?????? ?????????
          el.isShowBuildOrder = false;
          // ?????????????????? ?????????
          el.isShowViewIcon = false;
          // ????????????
          el.isShowViewIcon = false;
          // ????????????
          el.isShowRemark = false;
        });
        item.alarmCorrelationList = item.alarmCorrelationList.map(el => {
          this.translateField(el);
          return el;
        });
      }
      return item;
    });
  }

  /**
   * ????????????
   */
  public translateField(item: AlarmListModel): void {
    item.style = this.$alarmStoreService.getAlarmColorByLevel(item.alarmFixedLevel);
    // ????????????
    if (item.alarmSourceTypeId) {
      item.alarmSourceType = FacilityForCommonUtil.translateEquipmentType(this.$nzI18n, item.alarmSourceTypeId) as string;
      // ??????????????????????????????
      item.equipmentIcon = CommonUtil.getEquipmentIconClassName(item.alarmSourceTypeId);
    } else {
      item.alarmSourceType = item.alarmSourceType ? item.alarmSourceType : '??? ???';
    }
    // ????????????
    item.alarmDeviceName = item.alarmDeviceName ? item.alarmDeviceName : '??? ???';
    // ??????????????????
    item.deviceTypeIcon = CommonUtil.getFacilityIconClassName(item.alarmDeviceTypeId);
    // ????????????
    item.alarmClassification = AlarmForCommonUtil.showAlarmTypeInfo(this.alarmTypeList, item.alarmClassification);
    if (item.alarmCode === 'orderOutOfTime' && item.extraMsg) {
      item.alarmObject = `${item.alarmObject}${item.extraMsg.slice(4)}`;
    }
  }
  /**
   *  ??????????????????
   */
  public exportAlarm(body: ExportRequestModel): void {
    this.$alarmService.exportAlarmList(body).subscribe((res) => {
      if (res.code === 0) {
        this.$message.success(res.msg);
      } else {
        this.$message.error(res.msg);
      }
    });
  }

  /**
   * ????????????
   */
  public examinePicture(data: AlarmListModel): void {
    // ?????????????????????
    if (this.viewLoading) {
      return;
    }
    this.viewLoading = true;
    // ??????id??????????????????id ???????????????1????????? 2????????? 3????????????  ???????????????1????????? 2?????????
    const picData: QueryRecentlyPicModel[] = [
      new QueryRecentlyPicModel(data.alarmDeviceId, null, PicResourceEnum.alarm, data.id, ObjectTypeEnum.facility)
    ];
    this.$alarmService.examinePicture(picData).subscribe((res) => {
      this.viewLoading = false;
      if (res.code === ResultCodeEnum.success) {
        if (res.data.length === 0) {
          this.$message.warning(this.language.noPicturesYet);
        } else {
          this.$imageViewService.showPictureView(res.data);
        }
      } else {
        this.$message.error(res.msg);
      }
    }, () => {
      this.viewLoading = false;
    });
  }

  /**
   * ????????????
   */
  public templateTable(event: AlarmFiltrationModel): void {
    this.display.templateTable = false;
    if (!event) {
      return;
    }
    // ????????????????????????????????????
    this.table.searchDate = {};
    this.table.rangDateValue = {};
    this.table.tableService.resetFilterConditions(this.table.queryTerm);
    const data = new AlarmTemplateDataModel(new PageCondition(1, this.pageBean.pageSize));
    if (event) {
      this.tableConfig.isLoading = true;
      this.templateId = event.id;
      this.templateList(data);
    }
  }

  /**
   * ???????????? ??????
   */
  public templateList(data: AlarmTemplateDataModel): void {
    this.tableConfig.isLoading = true;
    this.$alarmService.alarmQueryTemplateById(this.templateId, data).subscribe((res) => {
      if (res.code === 0) {
        this.giveList(res);
      } else if (res.code === ResultCodeEnum.noSuchData) {
        this.dataSet = [];
        this.tableConfig.isLoading = false;
      }
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * ????????????
   */
  public alarmConfirm(data: AlarmListModel[]): void {
    if (data.length > 0) {
      const noConfirmIds = data.filter(item => item.alarmConfirmStatus === AlarmConfirmStatusEnum.noConfirm);
      if (!noConfirmIds.length) {
        this.$message.info(this.language.confirmAgain);
        return;
      }
      this.alarmIds = [];
      this.correlationIds = [];
      noConfirmIds.forEach(item => {
        if (item.isRootAlarm === IsRootAlarmEnum.isRoot || item.isRootAlarm === IsRootAlarmEnum.noRoot) {
          this.alarmIds.push({id: item.id});
        } else {
          this.correlationIds.push({id: item.id});
        }
      });
      this.popUpConfirm();
    } else {
      this.$message.info(this.language.pleaseCheckThe);
    }
  }

  /**
   *  ???????????? ??????
   */
  public popUpConfirm(): void {
    this.modalService.confirm({
      nzTitle: this.language.prompt,
      nzContent: this.language.alarmAffirm,
      nzOkText: this.language.cancelText,
      nzOkType: 'danger',
      nzMaskClosable: false,
      nzOnOk: () => {
      },
      nzCancelText: this.language.okText,
      nzOnCancel: () => {
        this.confirmationBoxConfirm();
      },
    });
  }

  /**
   * ??????????????????
   */
  public clearAlarmSure(): void {
    this.tableConfig.isLoading = true;
    const alarmClearParams = new AlarmClearAffirmModel(this.alarmIds, this.correlationIds);
    this.$alarmForCommonService.updateAlarmCleanStatus(alarmClearParams).subscribe((res) => {
      if (res.code === 0) {
        this.tableConfig.isLoading = false;
        this.$message.success(res.msg);
        this.refreshData();
        // ????????????????????????
        this.queryDeviceTypeCount(this.alarmHintValue);
        this.$currService.sendMessage(AlarmQueryTypeEnum.level);
      } else {
        this.tableConfig.isLoading = false;
        this.refreshData();
        this.$message.info(res.msg);
      }
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * ?????????????????? ??????
   */
  public confirmationBoxConfirm(): void {
    this.tableConfig.isLoading = true;
    const alarmClearParams = new AlarmClearAffirmModel(this.alarmIds, this.correlationIds);
    // ????????????
    this.$alarmService.updateAlarmConfirmStatus(alarmClearParams).subscribe((res) => {
      if (res.code === 0) {
        this.tableConfig.isLoading = false;
        this.$message.success(res.msg);
        this.refreshData();
      } else {
        this.tableConfig.isLoading = false;
        this.$message.error(res.msg);
      }
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }
  /**
   * ????????????
   */
  public alarmClean(data: AlarmListModel[]) {
    if (data.length > 0) {
      const noCleanIds = data.filter(item => item.alarmCleanStatus === AlarmCleanStatusEnum.noClean);
      if (!noCleanIds.length) {
        this.$message.info(this.language.cleanAgain);
        return;
      }
      this.alarmIds = [];
      this.correlationIds = [];
       noCleanIds.forEach(item => {
        if (item.isRootAlarm === IsRootAlarmEnum.isRoot || item.isRootAlarm === IsRootAlarmEnum.noRoot) {
          // ?????????
          this.alarmIds.push({id: item.id, alarmSource: item.alarmSource});
        } else {
          // ????????????
          this.correlationIds.push({id: item.id, alarmSource: item.alarmSource});
        }
      });
      CurrentAlarmUtil.popUpClean(this);
    } else {
      this.$message.info(this.language.pleaseCheckThe);
      return;
    }
  }

  /**
   * ????????????
   */
  public updateAlarmRemark(): void {
    const remarkData = this.formStatusRemark.getData().remark;
    const remark = remarkData ? remarkData : null;
    const data: AlarmRemarkModel[] = this.checkRemark.map(item => {
      return {id: item.id, remark: remark};
    });
    this.tableConfig.isLoading = true;
    this.$alarmForCommonService.updateAlarmRemark(data).subscribe((res) => {
      if (res.code === ResultCodeEnum.success) {
        this.refreshData();
        this.$message.success(res.msg);
      } else {
        this.$message.info(res.msg);
        this.tableConfig.isLoading = false;
      }
      this.display.remarkTable = false;
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * ???????????????????????????
   */
  public sliderChange(event: SliderPanelModel): void {
    // ??????????????????
    CurrentAlarmUtil.clearData(this);
    // ????????????????????????????????????,
    this.table.tableService.resetFilterConditions(this.table.queryTerm);
    // ?????????slide???????????????
    this.isClickSlider = true;
    if (this.deviceId) {
      const filter = new FilterCondition('alarmDeviceId', OperatorEnum.eq, this.deviceId);
      this.table.queryTerm.set('deviceId', filter);
    }
    if (this.alarmId) {
      const filter = new FilterCondition('id', OperatorEnum.eq, this.alarmId);
      this.table.queryTerm.set('alarmId', filter);
    }
    // ????????????
    if (this.equipmentId) {
      this.equipmentId = this.$active.snapshot.queryParams.equipmentId;
      const filter = new FilterCondition('alarmSource', OperatorEnum.eq, this.equipmentId);
      this.table.queryTerm.set('equipmentId', filter);
    }
    // ??????????????????
    if (this.equipmentType) {
      this.equipmentType = this.$active.snapshot.queryParams.alarmSourceTypeId;
      const filter = new FilterCondition('alarmSourceTypeId', OperatorEnum.eq, this.equipmentType);
      this.table.queryTerm.set('equipmentType', filter);
    }
    if (event.label === this.language.alarmSum) {
      this.table.handleSearch();
    } else {
      // ???????????????????????????????????????????????????,????????????????????????????????????
      this.table.searchDate = {};
      this.table.rangDateValue = {};
      if (event.statisticType === 'level') {
        this.table.handleSetControlData('alarmFixedLevel', [event.levelCode]);
      } else {
        this.table.handleSetControlData('alarmDeviceTypeId', [event.code]);
      }
      this.table.handleSearch();
    }
    // ????????????num
    this.isCardRefresh = true;
    this.queryDeviceTypeCount(this.alarmHintValue);
  }

  /**
   * ????????????
   * param event
   */
  public slideShowChange(event: boolean): void {
    if (event) {
      this.tableConfig.outHeight = SHOW_SLIDER_HIGH_CONST;
    } else {
      this.tableConfig.outHeight = HIDDEN_SLIDER_HIGH_CONST;
    }
    this.table.calcTableHeight();
  }

  /**
   * ???????????????????????????????????????
   */
  public alarmHintValueModelChange(): void {
    this.isCardRefresh = false;
    if (this.alarmHintValue === ShowTypeEnum.showLevel) {
      this.queryDeviceTypeCount(ShowTypeEnum.showLevel);
    } else {
      this.queryDeviceTypeCount(ShowTypeEnum.showType);
    }
  }

  /**
   * ?????????????????? ??????????????????  1. ??????????????? 2. ????????????
   */
  private queryDeviceTypeCount(selectType: ShowTypeEnum): void {
    // isCardRefresh ???true?????????????????????num???
    this.sliderConfig = this.isCardRefresh ? this.sliderConfig : [];
    if (selectType === ShowTypeEnum.showLevel) {
      this.cardNum = AlarmShowCardNumberEnum.fiveCount;
      // ????????????????????????
      if (this.alarmId) {
        // ??????ID
        this.queryCard(ShowTypeEnum.showLevel, this.alarmId, QUERY_KEY_ID);
      } else if (this.deviceId) {
        // ??????id
        this.queryCard(ShowTypeEnum.showLevel, this.deviceId, QUERY_KEY_DEVICE_ID);
      } else if (this.equipmentId) {
        // ??????id
        this.queryCard(ShowTypeEnum.showLevel, this.equipmentId, QUERY_KEY_SOURCE_ID);
      } else if (this.equipmentType) {
        // ????????????
        this.queryCard(ShowTypeEnum.showLevel, this.equipmentType, QUERY_KEY_SOURCE_TYPE_ID);
      } else {
        // ????????????
        this.queryCard(ShowTypeEnum.showLevel);
      }
    } else {
      this.cardNum = AlarmShowCardNumberEnum.sixCount;
      if (this.alarmId) {
        // ??????ID
        this.queryCard(ShowTypeEnum.showType, this.alarmId, QUERY_KEY_ID);
      } else if (this.deviceId) {
        // ??????id
        this.queryCard(ShowTypeEnum.showType, this.deviceId, QUERY_KEY_DEVICE_ID);
      } else if (this.equipmentId) {
        // ??????id
        this.queryCard(ShowTypeEnum.showType, this.equipmentId, QUERY_KEY_SOURCE_ID);
      } else if (this.equipmentType) {
        // ????????????
        this.queryCard(ShowTypeEnum.showType, this.equipmentType, QUERY_KEY_SOURCE_TYPE_ID);
      } else {
        // ??????????????????
        this.queryCard(ShowTypeEnum.showType);
      }
    }
  }

  /**
   * ??????????????????
   */
  public getCardLevel(data: DeviceTypeCountModel[]): void {
    const resultData = ['urgency', 'serious', 'secondary', 'prompt'];
    const panelData: SliderPanelModel[] = [];
    let count = 0;
    resultData.forEach(item => {
      const type = data.find(el => el.statisticObj === item);
      const color = this.$alarmStoreService.getAlarmColorByLevel(AlarmCardLevelEnum[item]);
      panelData.push({
        label: this.language.config[item], sum: type ? type.statisticNum : 0, code: item,
        iconClass: TroubleUtil.getLevelClass(item), levelCode: getLevelValueEnum[item],
        statisticType: 'level', color: color ? color.backgroundColor : null,
      });
      count += type ? type.statisticNum : 0;
    });
    panelData.unshift({
      sum: count, label: this.language.alarmSum, code: 'all',
      iconClass: 'iconfont fiLink-alarm-all statistics-all-color', textClass: 'statistics-all-color'
    });
    this.sliderConfig = panelData;
  }

  /**
   * ??????????????????
   */
  public refreshCard(curData: SliderPanelModel[], backData: DeviceTypeCountModel[]): SliderPanelModel[] {
    let count = 0;
    curData.forEach(item => {
      item.sum = 0;
      backData.forEach(el => {
        if (item.code === el.statisticObj) {
          item.sum = el.statisticNum;
          count += item.sum;
        }
      });
    });
    curData.forEach(item => {
      if (item.code === 'all') {
        item.sum = count;
      }
    });
    return curData;
  }

  /**
   * ??????????????????
   */
  public getCardDeviceType(data: DeviceTypeCountModel[]): void {
    const deviceTypes: SliderPanelModel[] = [];
    if (!_.isEmpty(this.deviceRoleTypes)) {
      this.deviceRoleTypes
        .map(item => item.code)
        .forEach(code => {
          const type = data.find(item => item.statisticObj === code);
          deviceTypes.push({
            code: code as string, label: FacilityForCommonUtil.translateDeviceType(this.$nzI18n, code as string),
            sum: type ? type.statisticNum : 0, textClass: CommonUtil.getFacilityTextColor(code as string),
            iconClass: CommonUtil.getFacilityIConClass(code as string),
          });
        });
    }
    // ???????????????
    const sum = _.sumBy(deviceTypes, 'sum') || 0;
    deviceTypes.unshift({
      label: this.language.alarmSum, iconClass: CommonUtil.getFacilityIconClassName(null),
      textClass: CommonUtil.getFacilityTextColor(null), code: 'all', sum: sum
    });
    this.sliderConfig = deviceTypes;
  }

  /**
   * ????????????????????????  @param type???????????? id???????????? key????????????
   */
  public queryCard(type: string, value?: string | string[], key?: string): void {
    const filterData = value ? [new FilterCondition(key, OperatorEnum.eq, value)] : [];
    const data: QueryCardParamsModel = {
      statisticsType: type,
      filterConditions: filterData
    };
    this.$alarmService.getAlarmCount(data).subscribe((res) => {
      if (res.code === 0) {
        const resultData = res.data || [];
        if (type === ShowTypeEnum.showLevel) {
          if (this.isCardRefresh) {
            // ??????????????????num
            this.sliderConfig = this.refreshCard(this.sliderConfig, resultData);
          } else {
            this.getCardLevel(resultData); // ??????
          }
        } else {
          if (this.isCardRefresh) {
            // ??????????????????num
            this.sliderConfig = this.refreshCard(this.sliderConfig, resultData);
          } else {
            this.getCardDeviceType(resultData); // ????????????
          }
        }
      }
    });
  }

  /**
   * ????????????
   */
  public setHandle(): void {
    const setData: DiagnosticModel = this.formStatusSet.getData();
    setData.id = this.diagnoseId;
    this.$alarmService.diagnosticUpdate(setData).subscribe((result) => {
      if (result.code === 0) {
        this.display.diagnoseSet = false;
        this.$message.success(result.msg);
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ????????????
   */
  public setHandleCancel(): void {
    this.display.diagnoseSet = false;
    this.tableColumnSet = [];
    CurrentAlarmUtil.initSetForm(this);
  }

  /**
   * ?????????????????? ???current-alarm-util??????????????????
   */
  public getDiagnosticData(): void {
    this.ifSpin = true;
    this.$alarmService.getDiagnosticData().subscribe((result: ResultModel<DiagnosticModel>) => {
      if (result.code === 0) {
        // ????????????????????????,??????????????????
        const data = result.data;
        if (data) {
          this.diagnoseId = data.id;
          this.formStatusSet.resetData(data);
        }
        this.ifSpin = false;
      } else {
        this.$message.error(result.msg);
      }
    }, () => {
      this.ifSpin = false;
    });
  }
  /**
   * ??????????????????
   */
  public onSelectEquipment(event: EquipmentListModel[]): void {
    this.selectEquipments = event;
    this.checkAlarmEquipment = new AlarmSelectorInitialValueModel(
      event.map(v => v.equipmentName).join(',') || '', event.map(v => v.equipmentId) || []
    );
    this.equipmentFilterValue.filterValue = this.checkAlarmEquipment.ids;
    this.equipmentFilterValue.filterName = this.checkAlarmEquipment.name;
  }

  /**
   * ??????????????????
   */
  public openEquipmentSelector(filterValue: FilterCondition): void {
    this.equipmentVisible = true;
    this.equipmentFilterValue = filterValue;
  }

  /**
   * ???????????????????????????
   */
  private initAlarmObjectConfig(): void {
    this.alarmObjectConfig = {
      clear: !this.checkAlarmObject.ids.length,
      handledCheckedFun: (event: AlarmSelectorInitialValueModel) => {
        this.checkAlarmObject = event;
      }
    };
  }

  /**
   * ???????????????????????????????????????
   */
  private initAlarmEquipment(): void {
    this.alarmEquipmentConfig = {
      clear: !this.checkAlarmEquipment.ids.length,
      handledCheckedFun: (event: AlarmSelectorInitialValueModel) => {
        this.checkAlarmEquipment = event;
      }
    };
  }

  /**
   * ?????????????????????
   */
  private initAreaConfig(): void {
    this.areaConfig = {
      clear: !this.areaList.ids.length,
      handledCheckedFun: (event: AlarmSelectorInitialValueModel) => {
        this.areaList = event;
      }
    };
  }

  /**
   *  ???????????????????????????
   */
  private initAlarmName(): void {
    this.alarmNameConfig = {
      clear: !this.checkAlarmName.ids.length,
      handledCheckedFun: (event: AlarmSelectorInitialValueModel) => {
        this.checkAlarmName = event;
      }
    };
  }

  /**
   * ????????????
   */
  private navigateToDetail(url: string, extras = {}): void {
    this.$router.navigate([url], extras).then();
  }

}
