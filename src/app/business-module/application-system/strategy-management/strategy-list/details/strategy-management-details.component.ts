import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild} from '@angular/core';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../../shared-module/model/query-condition.model';
import {PageModel} from '../../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../../shared-module/model/table-config.model';
import {OnlineLanguageInterface} from '../../../../../../assets/i18n/online/online-language.interface';
import {ApplicationService} from '../../../share/service/application.service';
import {NzI18nService} from 'ng-zorro-antd';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {ApplicationInterface} from '../../../../../../assets/i18n/appliction/application.interface';
import {StrategyListModel, StrategyRefListModel} from '../../../share/model/policy.control.model';
import {ExecStatusEnum, SwitchStatus, TargetTypeEnum} from '../../../share/enum/policy.enum';
import {SliderValueConst} from '../../../share/const/slider.const';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {InstructInfoBaseModel, InstructLightBaseModel, LinkageStrategyModel} from '../../../share/model/linkage.strategy.model';
import {AlarmModel} from '../../../share/model/alarm.model';
import {DimmingLightModel, EquipmentModel} from '../../../share/model/equipment.model';
import {EquipmentListModel} from '../../../../../core-module/model/equipment/equipment-list.model';
import {FacilityLanguageInterface} from '../../../../../../assets/i18n/facility/facility.language.interface';
import {CommonLanguageInterface} from '../../../../../../assets/i18n/common/common.language.interface';
import {AlarmLanguageInterface} from '../../../../../../assets/i18n/alarm/alarm-language.interface';
import {ConditionTypeEnum} from '../../../share/enum/condition-type.enum';
import {SelectModel} from '../../../../../shared-module/model/select.model';
import {AlarmColorUtil} from '../../../share/util/alarm-color-util';
import {AlarmListModel} from '../../../../../core-module/model/alarm/alarm-list.model';
import {AlarmForCommonService} from '../../../../../core-module/api-service/alarm';
import {EquipmentStatusEnum, EquipmentTypeEnum} from 'src/app/core-module/enum/equipment/equipment.enum';
import {AlarmForCommonUtil} from '../../../../../core-module/business-util/alarm/alarm-for-common.util';

/**
 * ???????????????????????????
 */
@Component({
  selector: 'app-strategy-management-details',
  templateUrl: './strategy-management-details.component.html',
  styleUrls: ['./strategy-management-details.component.scss']
})
export class StrategyManagementDetailsComponent implements OnInit, OnDestroy, OnChanges {
  // ???????????????
  @Input() public strategyRefList: StrategyRefListModel[] = [];
  // ????????????
  @Input() public stepsFirstParams: StrategyListModel = new StrategyListModel();
  // ?????????????????????
  @Input() linkageStrategyInfo: LinkageStrategyModel = new LinkageStrategyModel({});
  // ?????????????????????
  @Output() strategyDetailValidChange = new EventEmitter<boolean>();
  // ??????????????????????????????
  @ViewChild('alarmDefaultLevelTemp') alarmDefaultLevelTemp: TemplateRef<any>;
  // ??????????????????
  @ViewChild('radioReportTemp') radioReportTemp: TemplateRef<any>;
  //  ????????????
  @ViewChild('alarmLevelTemp') alarmLevelTemp: TemplateRef<HTMLDocument>;
  //  ????????????
  @ViewChild('alarmConfirmTemp') alarmConfirmTemp: TemplateRef<HTMLDocument>;
  // ????????????
  @ViewChild('alarmTypeTemp') alarmTypeTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('equipment') equipment: TemplateRef<any>;
  // ??????????????????????????????
  public isStrategy: boolean = false;
  // ??????????????????
  public isSource: boolean = false;
  // ??????????????????
  public isSourceEvent: boolean = false;
  // ??????????????????
  public ExecStatusEnum = ExecStatusEnum;
  // ??????????????????
  public typeStatus: SelectModel = new SelectModel();
  // ??????????????????
  public sliderValue = SliderValueConst;
  // ???????????????
  public targetTypeEnum = TargetTypeEnum;
  // ???????????????id
  public selectedEquipmentId: string = '';
  // ?????????id
  public selectedReportId: string = '';
  // ??????????????????
  public isShowProgram: boolean = false;
  // ??????id
  public selectedProgramId: string = '';
  // ????????????
  public programName: string = '';
  // ???????????????
  public selectEquipment: DimmingLightModel = new DimmingLightModel();
  // ???????????????
  public selectReport: AlarmModel = new AlarmModel();
  // ???????????????
  public selectedProgram = {id: '', name: ''};
  // ??????????????????
  public isMultiEquipment: boolean = false;
  // ??????????????????????????????
  public isDisplay: boolean;
  // ????????????????????????
  public dataSet: EquipmentListModel[] = [];
  // ????????????????????????
  public reportData: AlarmListModel[] = [];
  // ?????????????????????
  public multiEquipmentData: EquipmentModel[] = [];
  // ????????????
  public tableConfigReport: TableConfigModel;
  // ????????????
  public pageBean: PageModel = new PageModel();
  // ????????????
  public reportPageBean: PageModel = new PageModel();
  // ????????????????????????
  public tableConfig: TableConfigModel;
  // ???????????????
  public language: OnlineLanguageInterface;
  // ?????????????????????
  public languageTable: ApplicationInterface;
  // ??????????????????
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // ??????????????????
  public reportQueryCondition: QueryConditionModel = new QueryConditionModel();
  // ????????????????????????
  public instructLightBase: InstructLightBaseModel = new InstructLightBaseModel({});
  // ???????????????
  public instructInfoBase: InstructInfoBaseModel = new InstructInfoBaseModel({});
  // ????????????
  public switchLight: boolean = false;
  public equipmentLanguage: FacilityLanguageInterface;
  // ??????????????????
  public equipmentStatusEnum = EquipmentStatusEnum;
  public languageEnum = LanguageEnum;
  public commonLanguage: CommonLanguageInterface;
  // ?????????????????????
  public conditionTypeEnum = ConditionTypeEnum;
  // ????????????
  public eventList: any[] = [];
  // ????????????????????????
  public eventTableConfig: TableConfigModel;
  public alarmLanguage: AlarmLanguageInterface;

  constructor(
    // ???????????????
    private $nzI18n: NzI18nService,
    private $alarmService: AlarmForCommonService,
    // ????????????
    private $message: FiLinkModalService,
    // ????????????
    private $applicationService: ApplicationService,
  ) {
    // ?????????
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.online);
    // ?????????????????????
    this.languageTable = this.$nzI18n.getLocaleData(LanguageEnum.application);
    this.equipmentLanguage = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.alarmLanguage = this.$nzI18n.getLocaleData(LanguageEnum.alarm);
  }

  /**
   * ?????????
   */
  public ngOnInit(): void {
    // ??????????????????
    this.initTableConfig();
    // ????????????
    this.getAlarmTypeList();
    // ????????????
    this.initEventTable();
    // ????????????
    this.getAlarmLevelList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.linkageStrategyInfo && changes.linkageStrategyInfo.currentValue) {
      this.selectReport.alarmName = this.linkageStrategyInfo.conditionName;
      this.selectEquipment.equipmentName = this.linkageStrategyInfo.equipmentName;
      this.multiEquipmentData = this.stepsFirstParams.multiEquipmentData;

      // ???????????????????????????????????????
      if (this.linkageStrategyInfo.instructInfoBase) {
      } else {
        this.linkageStrategyInfo.instructInfoBase = new InstructInfoBaseModel();
      }
      this.instructInfoBase = this.linkageStrategyInfo.instructInfoBase;
      // ????????????????????????????????????
      if (this.linkageStrategyInfo.instructLightBase) {
      } else {
        this.linkageStrategyInfo.instructLightBase = new InstructLightBaseModel();
      }
      this.instructLightBase = this.linkageStrategyInfo.instructLightBase;
      this.switchLight = this.linkageStrategyInfo.instructLightBase.switchLight === SwitchStatus.on;
      this.instructInfoBase = this.linkageStrategyInfo.instructInfoBase;
      Promise.resolve().then(() => {
        this.strategyDetailValid();
      });
    }
  }

  /**
   * ??????
   */
  public ngOnDestroy(): void {
    this.radioReportTemp = null;
    this.equipment = null;
  }


  /**
   *??????????????????
   */
  public handleProgramOk(selectedProgram): void {
    this.stepsFirstParams.linkageStrategyInfo.instructInfoBase.programId = selectedProgram.id;
    this.stepsFirstParams.linkageStrategyInfo.instructInfoBase.programName = selectedProgram.name;
    this.isShowProgram = false;
    this.strategyDetailValid();
  }

  switchLightChange(switchLight: boolean): void {
    this.switchLight = switchLight;
    this.linkageStrategyInfo.instructLightBase.switchLight = this.switchLight ? ExecStatusEnum.implement : ExecStatusEnum.free;
  }

  /**
   * ??????
   */
  public handleMultiEquipmentOk(data: EquipmentModel[]): void {
    this.multiEquipmentData = data;
    const arr = [];
    data.forEach(item => {
      arr.push({
        refName: item.equipmentName,
        refEquipmentType: item.equipmentType,
        refType: ExecStatusEnum.implement,
        refId: item.equipmentId
      });
    });
    this.stepsFirstParams.strategyRefList = arr;
    this.stepsFirstParams.multiEquipmentData = data;
    this.isMultiEquipment = false;
  }

  /**
   * ????????????
   * @ param event
   */
  public reportPageChange(event: PageModel): void {
    this.reportQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.reportQueryCondition.pageCondition.pageSize = event.pageSize;
    this.getAlarmLevelList();
  }

  /**
   * ????????????
   */
  public handleTableOk(event): void {
    this.handleMultiEquipmentOk(event.data);
    this.linkageStrategyInfo.targetType = event.targetType;
    if (this.linkageStrategyInfo.targetType === EquipmentTypeEnum.informationScreen) {
      if (!this.linkageStrategyInfo.instructInfoBase) {
        this.linkageStrategyInfo.instructInfoBase = new InstructInfoBaseModel();
      }
    } else {
      if (!this.linkageStrategyInfo.instructLightBase) {
        this.linkageStrategyInfo.instructLightBase = new InstructLightBaseModel();
      }
    }
    this.strategyDetailValid();
  }

  /**
   * ????????????
   */
  public handleCancel(): void {
    this.isStrategy = false;
    this.isSource = false;
    this.isSourceEvent = false;
  }

  /**
   * ?????????????????????
   */
  public handleEquipment(): void {
    // ???????????????????????????????????? ???????????????????????????????????????
    this.selectEquipment.equipmentId = this.stepsFirstParams.linkageStrategyInfo.equipmentId;
    this.isStrategy = true;
  }

  /**
   * ?????????????????????
   */
  public handleReport(): void {
    this.reportQueryCondition = new QueryConditionModel();
    this.getAlarmLevelList();
    this.selectReport.alarmCode = this.stepsFirstParams.linkageStrategyInfo.conditionId;
    this.tableConfigReport.showSearch = false;
    this.isSource = true;
  }

  /**
   * ?????????????????????
   */
  public handleReportEvent(): void {
    this.selectReport.alarmCode = this.stepsFirstParams.linkageStrategyInfo.conditionId;
    this.isSourceEvent = true;
  }

  public handleProgram(): void {
    this.selectedProgram.id = this.stepsFirstParams.linkageStrategyInfo.instructInfoBase.programId;
    this.selectedProgram.name = this.stepsFirstParams.linkageStrategyInfo.instructInfoBase.programName;
    this.isShowProgram = true;
  }

  /**
   * ???????????????????????????
   */
  public handleEquipmentOk(selectEquipment): void {
    // ???????????????????????????????????? ???????????????????????????????????????
    this.stepsFirstParams.linkageStrategyInfo.equipmentName = selectEquipment.equipmentName;
    this.stepsFirstParams.linkageStrategyInfo.equipmentId = selectEquipment.equipmentId;
    this.strategyDetailValid();
    this.isStrategy = false;
  }

  /**
   * ???????????????????????????
   */
  public handleReportOk(): void {
    this.stepsFirstParams.linkageStrategyInfo.conditionId = this.selectReport.alarmCode;
    this.stepsFirstParams.linkageStrategyInfo.conditionName = this.selectReport.alarmName;
    this.strategyDetailValid();
    this.isSource = false;
  }

  /**
   * ???????????????????????????
   */
  public handleReportEventOk(): void {
    this.stepsFirstParams.linkageStrategyInfo.conditionId = this.selectReport.alarmCode;
    this.stepsFirstParams.linkageStrategyInfo.conditionName = this.selectReport.alarmName;
    this.strategyDetailValid();
    this.isSourceEvent = false;
  }

  /**
   * ?????????????????????
   * param event
   */
  public conditionChange(event): void {
    // ???????????????????????????????????????
    this.stepsFirstParams.linkageStrategyInfo.conditionName = '';
    this.stepsFirstParams.linkageStrategyInfo.conditionId = null;
    this.strategyDetailValid();
  }

  /**
   * ????????????
   */
  public getAlarmTypeList(): void {
    this.$alarmService.getAlarmTypeList().subscribe((res: ResultModel<SelectModel[]>) => {
      if (res.code === 0) {
        const data = res.data;
        // ?????????
        const resultData = data.map(item => {
          return ({
            label: String(item.value),
            code: item.key,
            value: item.key,
          });
        });
        // ??????????????????
        if (data && data.length > 0) {
          data.forEach(item => {
            this.typeStatus[item.key] = item.value;
          });
        }
        this.tableConfigReport.columnConfig.forEach(item => {
          if (item.searchKey === 'alarmClassification') {
            item['searchConfig']['selectInfo'] = resultData;
          }
        });
      }
    });
  }

  /**
   * ????????????
   */
  public getAlarmLevelList(): void {
    this.tableConfigReport.isLoading = true;
    this.$applicationService.queryAlarmNamePage(this.reportQueryCondition).subscribe((res: ResultModel<AlarmListModel[]>) => {
      this.tableConfigReport.isLoading = false;
      if (res.code === 0) {
        const {data, totalCount, pageNum, size} = res;
        this.reportData = data || [];
        this.reportPageBean.Total = totalCount;
        this.reportPageBean.pageIndex = pageNum;
        this.reportPageBean.pageSize = size;
        if (this.reportData.length) {
          AlarmColorUtil.alarmFmt(this.reportData, this.alarmLanguage);
        }
      } else {
        this.$message.error(res.msg);
      }
    }, () => {
      this.tableConfigReport.isLoading = false;
    });
  }

  /**
   * ???????????????
   * @ param event
   * @ param data
   */
  public selectedReportChange(event: string, data: AlarmModel) {
    this.selectReport.alarmCode = data.alarmCode;
    this.selectReport.alarmName = data.alarmName;
  }

  public strategyDetailValid(): void {
    // ?????????????????? ?????????
    let valid = false;
    if (this.linkageStrategyInfo.equipmentId && this.linkageStrategyInfo.conditionId && this.linkageStrategyInfo.conditionType
      && this.linkageStrategyInfo.conditionId
      && this.stepsFirstParams.multiEquipmentData.length
    ) {
      valid = true;
    } else {
      valid = false;
    }
    // ????????????????????????????????????????????????instructInfoBase.programId
    if (this.linkageStrategyInfo.targetType && this.linkageStrategyInfo.targetType.includes(EquipmentTypeEnum.informationScreen)) {
      valid = valid && Boolean(this.linkageStrategyInfo.instructInfoBase.programId);
    }
    this.strategyDetailValidChange.emit(valid);
  }

  public deleteEquipmentChange(data) {
    this.handleMultiEquipmentOk(data);
    this.linkageStrategyInfo.targetType = [...new Set(data.map(item => item.equipmentType))].join(',');
  }

  /**
   * ?????????????????????
   */
  private initTableConfig(): void {
    this.tableConfigReport = {
      isDraggable: true,
      isLoading: false,
      showSearchSwitch: true,
      showSizeChanger: true,
      scroll: {x: '1600px', y: '420px'},
      noIndex: true,
      noAutoHeight: true,
      notShowPrint: true,
      columnConfig: [
        {
          title: '',
          type: 'render',
          key: 'selectedReportId',
          renderTemplate: this.radioReportTemp,
          width: 42
        },
        {
          type: 'serial-number', width: 62, title: this.language.serialNumber,
        },
        // ????????????
        {
          title: this.alarmLanguage.alarmName, key: 'alarmName', width: 200,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'},
        },
        // ????????????
        {
          title: this.alarmLanguage.AlarmCode, key: 'alarmCode', width: 200,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'},
        },
        // ????????????
        {
          title: this.alarmLanguage.alarmDefaultLevel, key: 'alarmDefaultLevel', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {
            type: 'select', selectType: 'multiple',
            selectInfo: AlarmForCommonUtil.translateAlarmLevel(this.$nzI18n), label: 'label', value: 'code'
          },
          type: 'render',
          renderTemplate: this.alarmDefaultLevelTemp,
        },
        // ????????????
        {
          title: this.alarmLanguage.alarmLevel, key: 'alarmLevel', width: 150,
          searchable: true,
          isShowSort: true,
          type: 'render',
          renderTemplate: this.alarmLevelTemp,
          searchConfig: {
            type: 'select', selectType: 'multiple',
            selectInfo: AlarmForCommonUtil.translateAlarmLevel(this.$nzI18n), label: 'label', value: 'code'
          },
        },
        {
          // ????????????
          title: this.alarmLanguage.AlarmType, key: 'alarmClassification', width: 150, isShowSort: true,
          searchable: true,
          searchKey: 'alarmClassification',
          type: 'render',
          searchConfig: {
            type: 'select', selectType: 'multiple',
          },
          renderTemplate: this.alarmTypeTemp
        },
        { // ????????????
          title: this.alarmLanguage.alarmAutomaticConfirmation, key: 'alarmAutomaticConfirmation', width: 150,
          searchable: true,
          isShowSort: true,
          type: 'render',
          renderTemplate: this.alarmConfirmTemp,
          searchConfig: {
            type: 'select', selectType: 'multiple', selectInfo: [
              {label: this.alarmLanguage.yes, value: '1'},
              {label: this.alarmLanguage.no, value: '0'},
            ]
          }
        },
        {
          title: this.language.operate, searchable: true,
          searchConfig: {type: 'operate'}, key: '', width: 100, fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      showPagination: true,
      bordered: false,
      showSearch: false,
      searchReturnType: 'Array',
      // ??????
      sort: (event: SortCondition) => {
        this.reportQueryCondition.sortCondition.sortField = event.sortField;
        this.reportQueryCondition.sortCondition.sortRule = event.sortRule;
        this.getAlarmLevelList();
      },
      // ??????
      handleSearch: (event: FilterCondition[]) => {
        this.reportQueryCondition.pageCondition.pageNum = 1;
        this.reportQueryCondition.filterConditions = event;
        this.getAlarmLevelList();
      }
    };
  }

  /**
   * ??????????????????????????????
   */
  private initEventTable(): void {
    this.eventTableConfig = {
      isDraggable: true,
      isLoading: false,
      showSearchSwitch: true,
      showSizeChanger: true,
      scroll: {x: '1600px', y: '600px'},
      noIndex: true,
      notShowPrint: true,
      columnConfig: [
        {
          title: '',
          type: 'render',
          key: 'selectedReportId',
          renderTemplate: this.radioReportTemp,
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
          width: 42
        },
        // ??????
        {
          type: 'serial-number',
          width: 62,
          title: this.language.serialNumber,
        },
        // ????????????
        {
          title: this.languageTable.strategyList.operationUser,
          key: 'alarmName',
          width: 150,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        // ????????????
        {
          title: this.languageTable.strategyList.operationTime,
          key: 'alarmObject',
          width: 150,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        // ????????????
        {
          title: this.languageTable.strategyList.operationResult,
          key: 'alarmDeviceName',
          width: 150,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        // ????????????
        {
          title: this.languageTable.strategyList.operationDetails,
          key: 'areaName',
          width: 150,
          searchable: true,
          searchConfig: {type: 'input'},
          fixedStyle: {fixedLeft: true, style: {right: '0px'}}
        }
      ],
      showPagination: false,
      bordered: false,
      showSearch: false,
      searchReturnType: 'Array',
    };
  }
}
