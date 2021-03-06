import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {DateHelperService, NzI18nService} from 'ng-zorro-antd';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../../shared-module/model/query-condition.model';
import {PageModel} from '../../../../../shared-module/model/page.model';
import {AlarmLanguageInterface} from '../../../../../../assets/i18n/alarm/alarm-language.interface';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {TableConfigModel} from '../../../../../shared-module/model/table-config.model';
import {FormOperate} from '../../../../../shared-module/component/form/form-operate.service';
import {FormItem} from '../../../../../shared-module/component/form/form-config';
import {RuleUtil} from '../../../../../shared-module/util/rule-util';
import {AlarmSelectorConfigModel} from '../../../../../shared-module/model/alarm-selector-config.model';
import {TableComponent} from '../../../../../shared-module/component/table/table.component';
import {DateFormatStringEnum} from '../../../../../shared-module/enum/date-format-string.enum';
import {differenceInCalendarDays} from 'date-fns';
import {DeviceTypeEnum} from '../../../../../core-module/enum/facility/facility.enum';
import {CommonUtil} from '../../../../../shared-module/util/common-util';
import {AlarmStatisticalService} from '../../../share/service/alarm-statistical.service';
import {AlarmSelectorConfigTypeEnum} from '../../../../../shared-module/enum/alarm-selector-config-type.enum';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {StatisticalTemplateModel} from '../../../share/model/alarm/statistical-template.model';
import {OperateTypeEnum} from '../../../../../shared-module/enum/page-operate-type.enum';
import {CurrentPageTypeEnum} from '../../../share/enum/current-page-type.enum';
import {StatisticalUtil} from '../../../share/util/statistical.util';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import * as _ from 'lodash';
import {AlarmNameListModel} from '../../../../../core-module/model/alarm/alarm-name-list.model';
import {FacilityForCommonUtil} from '../../../../../core-module/business-util/facility/facility-for-common.util';
import {ResultCodeEnum} from '../../../../../shared-module/enum/result-code.enum';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})

export class TemplateComponent implements OnInit {
  @Input() bool = false;

  // ??????????????????????????????
  @Input()
  set currentPage(currentPage) {
    this.currentPageType = currentPage;
    if (currentPage === CurrentPageTypeEnum.areaRatio) {
      this.selectNumber = 1;
    } else {
      this.selectNumber = 5;
    }
    this.queryTemplateData();
  }
  // ??????????????????
  @Input() equipmentIsRadio: boolean = false;

  // ???????????????????????????????????????emit??????
  @Output() resultAndClose = new EventEmitter();
  // ????????????
  @ViewChild('radioTemp') radioTemp: TemplateRef<any>;
  // ???????????????
  @ViewChild('areaSelector') private areaSelector;
  // ????????????????????????
  @ViewChild('recentlyTimeTemp') private recentlyTimeTemp: TableComponent;
  // ????????????????????????
  @ViewChild('deviceTypeTemp') deviceTypeTemp: TemplateRef<any>;
  // ??????????????????????????????????????????
  @ViewChild('addDeviceTypeTemp') addDeviceTypeTemp: TemplateRef<any>;
  @ViewChild('modalContentWork') modalContentWork;
  @ViewChild('alarmNameTemp') alarmNameTemp: TemplateRef<any>;
  // ????????????????????????
  public dataSetTemplate: StatisticalTemplateModel[] = [];
  // ??????????????????
  public pageBeanTemplate: PageModel = new PageModel(100, 1, 1);
  // ????????????
  public tableConfigTemplate: TableConfigModel;
  // ?????????
  public language: AlarmLanguageInterface;
  // ????????????????????????????????????
  public display = {
    templateTable: true,
    creationTemplate: false
  };
  public alarmName = '';
  public alarmNameSelectVisible: boolean = false;
  public selectAlarms: any[] = [];
  public selectAlarmData = {
    // ???????????????????????????
    selectAlarmCodes: [],
    // ???????????????id??????
    ids: [],
    // ???????????????????????????
    alarmNames: []
  };
  public selectedAlarm: StatisticalTemplateModel = new StatisticalTemplateModel();
  // ????????????
  public formColumn: FormItem[] = [];
  // ????????????
  public formStatus: FormOperate;
  // ????????????????????????
  public areaConfig: AlarmSelectorConfigModel;
  // ?????????????????????
  public timeModel = {
    recentlyTimeModel: [],
  };
  // ????????????????????????????????????????????????
  public deviceTypeList: { label: string, code: any }[] = [];
  // ?????????????????????
  public deviceTypeListValue: string[] = [];
  // ???????????????title
  public templateTitle: string;
  // ??????????????????
  public selectNumber: number;
  // ????????????
  private filterEvent: FilterCondition[];
  // ????????????
  private queryCondition: QueryConditionModel = new QueryConditionModel();
  // ????????????
  private areaList = {
    ids: [],
    name: ''
  };
  public alarmList = {
    ids: [],
    name: ''
  };
  // ????????????
  private currentPageType: CurrentPageTypeEnum = CurrentPageTypeEnum.alarmType;
  // ????????????????????????????????????
  private type: OperateTypeEnum = OperateTypeEnum.add;
  // ???????????????ID
  private updateParamsId: string;

  constructor(
    public $router: Router,
    private $ruleUtil: RuleUtil,
    public $nzI18n: NzI18nService,
    public $alarmStatisticalService: AlarmStatisticalService,
    public $message: FiLinkModalService,
    private $dateHelper: DateHelperService,
  ) {
    // ????????????
    // this.deviceTypeList = CommonUtil.codeTranslate(DeviceTypeEnum, this.$nzI18n) as any[];
  }

  /**
   * ?????????
   */
  public ngOnInit(): void {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.alarm);
    this.templateListConfig();
    // ??????
    this.initAreaConfig();
    // ????????????????????????????????????????????????
    // this.deviceTypeList = StatisticalUtil.getUserCanLookDeviceType(this.deviceTypeList);
    this.deviceTypeList = FacilityForCommonUtil.getRoleFacility(this.$nzI18n);
  }

  /**
   * ????????????
   */
  public cancelText(): void {
    this.display.templateTable = false;
    this.resultAndClose.emit();
  }

  /**
   * ????????????
   */
  public pageTemplateChange(event: PageModel): void {
    this.queryCondition.filterConditions = this.filterEvent;
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.queryTemplateData();
  }

  /**
   * ????????????
   */
  public okText(): void {
    this.resultAndClose.emit(this.selectedAlarm);
  }

  /**
   * ??????????????????
   * param event
   * param data
   */
  public selectedAlarmChange(event: string, data: StatisticalTemplateModel): void {
    // ?????????????????? ??????????????????
    this.selectedAlarm = _.cloneDeep(data);
  }

  /**
   * ????????????
   */
  public initForm(): void {
    this.formColumn = [
      {
        // ????????????
        label: this.language.templateName,
        key: 'templateName',
        type: 'input',
        require: true,
        width: 300,
        col: 24,
        rule: [
          {required: true},
          RuleUtil.getNameMaxLengthRule(),
        ],
        asyncRules: [
          this.$ruleUtil.getNameAsyncRule(value => this.$alarmStatisticalService.checkAlarmStatisticalName(value, this.updateParamsId),
            res => res.code === ResultCodeEnum.success)
        ],
      },
      {
        // ??????
        label: this.language.area,
        key: 'areaNameList',
        type: 'custom',
        width: 300,
        require: true,
        rule: [{required: true}],
        asyncRules: [],
        template: this.areaSelector,
      }, {
        // ????????????
        label: this.language.alarmSourceType,
        key: 'alarmSourceTypeId',
        type: this.equipmentIsRadio ? 'select' : 'custom',
        require: true,
        rule: [{required: true}],
        asyncRules: [],
        selectInfo: this.equipmentIsRadio ? {
          data: FacilityForCommonUtil.getRoleFacility(this.$nzI18n),
          label: 'label', value: 'code',
        } : null,
        template: this.equipmentIsRadio ? '' : this.addDeviceTypeTemp
      }, {
        // ??????
        label: this.language.time,
        key: 'time',
        type: 'custom',
        width: 300,
        template: this.recentlyTimeTemp,
        require: true,
        rule: [{required: true}],
        asyncRules: []
      }
    ];
    if (this.bool) {
      this.formColumn.push(
        {
          // ????????????
          label: this.language.alarm,
          key: 'alarmName',
          type: 'custom',
          require: true,
          width: 300,
          rule: [{required: true}],
          asyncRules: [],
          template: this.alarmNameTemp,
        }
      );
    }
  }

  /**
   * ????????????
   */
  public closePopUp(): void {
    this.display.creationTemplate = false;
    this.areaList = {
      ids: [],
      name: ''
    };
    this.initAreaConfig();
    this.timeModel.recentlyTimeModel = [];
    this.deviceTypeListValue = [];
  }

  /**
   * ??????????????????this.timeModel.recentlyTimeModel
   */
  public formInstance(event: { instance: FormOperate }): void {
    this.formStatus = event.instance;
  }

  /**
   * ??????????????????
   */
  public recentlyTimeChange(event): void {
    this.timeModel.recentlyTimeModel = event;
    this.formStatus.resetControlData('time', this.timeModel.recentlyTimeModel);
  }

  /**
   * ?????????????????????
   */
  public deviceTypeChange(event): void {
    this.formStatus.resetControlData('alarmSourceTypeId', event);
  }

  /**
   * ???????????????????????????
   */
  public recentlyTimeOnOpenChange(event) {
    if (event) {
      return;
    }
    if (+this.timeModel.recentlyTimeModel[0] > +this.timeModel.recentlyTimeModel[1]) {
      this.timeModel.recentlyTimeModel = [];
      this.$message.warning(this.language.timeMsg);
    }
    // ????????? ?????????????????????????????????????????? ???????????????
    this.timeModel.recentlyTimeModel = this.timeModel.recentlyTimeModel.slice();
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
   * ??????????????????????????????
   */
  public showAlarmNameSelect(): void {
    this.alarmNameSelectVisible = true;
  }

  /**
   * ??????????????????
   * @param event ?????????????????????
   */
  public onSelectAlarmName(event: AlarmNameListModel[]): void {
    const obj = {
      selectAlarmCodes: [],
      ids: [],
      alarmNames: []
    };
    event.forEach((item: AlarmNameListModel) => {
      obj['selectAlarmCodes'].push(item.alarmCode);
      obj['ids'].push(item.id);
      obj['alarmNames'].push(item.alarmName);
    });
    this.selectAlarmData = Object.assign(this.selectAlarmData, obj);
    this.selectAlarms = event;
    this.alarmName = this.selectAlarmData.alarmNames.toString();
    this.formStatus.resetControlData('alarmName', this.alarmName);
  }

  /**
   * ?????????????????????
   */
  public submitWork(): void {
    const alarmObj = this.formStatus.getData();
    const data = {
      id: this.updateParamsId,
      pageType: this.currentPageType,
      templateName: alarmObj.templateName,
      condition: JSON.stringify({
        beginTime: +this.timeModel.recentlyTimeModel[0],
        endTime: +this.timeModel.recentlyTimeModel[1],
        deviceIds: this.equipmentIsRadio ? [this.formStatus.getData('alarmSourceTypeId')] : this.deviceTypeListValue,
        areaList: this.areaList,
        alarmList: this.selectAlarmData,
      })
    };
    if (this.type === OperateTypeEnum.add) {
      // ??????
      this.$alarmStatisticalService.addAlarmStatisticalTemplate(data).subscribe((res: ResultModel<any>) => {
        if (res.code === 0) {
          this.$message.success(res.msg);
          this.display.creationTemplate = false;
          this.queryTemplateData();
        }
      });
    } else {
      // ??????
      this.$alarmStatisticalService.updateAlarmStatisticalTemplate(data).subscribe((res: ResultModel<any>) => {
        if (res.code === 0) {
          this.$message.success(res.msg);
          this.display.creationTemplate = false;
          this.queryTemplateData();
        }
      });
    }

  }

  /**
   * ?????????????????????
   * param data
   */
  private initAreaConfig(): void {
    const clear = !this.areaList.ids.length;
    this.areaConfig = {
      type: AlarmSelectorConfigTypeEnum.form,
      initialValue: this.areaList,
      clear: clear,
      handledCheckedFun: (event) => {
        this.areaList = event;
        const names = this.areaList.name.split(',');
        const areaNameList = this.areaList.ids.map((id, index) => {
          return {'areaName': names[index], 'areaId': id};
        });
        this.formStatus.resetControlData('areaNameList', areaNameList);
      }
    };
  }

  /**
   * ????????????????????????
   */
  private queryTemplateData() {
    this.$alarmStatisticalService.alarmStatisticalList(this.currentPageType).subscribe((res: ResultModel<StatisticalTemplateModel[]>) => {
      if (res.code === 0) {
        if (res.data && res.data.length) {
          this.dataSetTemplate = res.data.map(item => {
            if (item.condition) {
              item.condition = JSON.parse(item.condition as any);
            }
            item.areaNames = item.condition.areaList.name;
            item.alarmName = item.condition.alarmList ? item.condition.alarmList.alarmNames.join(',') : '';
            item.alarmForwardRuleDeviceTypeList = item.condition.deviceIds.map(type => {
              return CommonUtil.codeTranslate(DeviceTypeEnum, this.$nzI18n, type);
            });
            item.time = this.$dateHelper.format(new Date(Number(item.condition.beginTime)),
              DateFormatStringEnum.DATE_FORMAT_STRING_SIMPLE) + '~' + this.$dateHelper.format(new Date(Number(item.condition.endTime)),
              DateFormatStringEnum.DATE_FORMAT_STRING_SIMPLE);
            console.log(item);
            return item;
          });
        } else {
          this.dataSetTemplate = [];
        }
      }
    });
  }

  /**
   * ????????????
   */
  private templateListConfig(): void {
    const columnConfig = [
      {
        title: '',
        type: 'render',
        renderTemplate: this.radioTemp,
        fixedStyle: {fixedLeft: true, style: {left: '0px'}}, width: 42
      },
      {
        type: 'serial-number', width: 52, title: this.language.serialNumber,
        fixedStyle: {fixedLeft: true, style: {left: '0px'}}
      },
      {
        // ????????????
        title: this.language.templateName, key: 'templateName',
        width: 100,
        fixedStyle: {fixedLeft: true, style: {left: '0px'}}
      },
      {
        // ??????
        title: this.language.area,
        key: 'areaNames', width: 150,
      },
      {
        // ????????????
        title: this.language.alarmSourceType,
        key: 'alarmForwardRuleDeviceTypeList', width: 100,
        renderTemplate: this.deviceTypeTemp,
      },
      {
        // ??????
        title: this.language.time,
        key: 'time', width: 400,
      },
      {
        title: this.language.operate, searchable: true,
        searchConfig: {type: 'operate'}, key: '', width: 80, fixedStyle: {fixedRight: true, style: {right: '0px'}}
      },
    ];
    if (this.bool) {
      columnConfig.splice(3, 0, {
        // ??????
        title: this.language.alarmName,
        key: 'alarmName', width: 150,
      });
    }
    this.tableConfigTemplate = {
      isDraggable: true,
      isLoading: false,
      showSizeChanger: true,
      noIndex: true,
      notShowPrint: true,
      scroll: {x: '800px', y: '300px'},
      columnConfig: columnConfig,
      bordered: false,
      showSearch: false,
      searchReturnType: 'Object',
      topButtons: [
        {
          // ??????
          text: this.language.add,
          iconClassName: 'fiLink-add-no-circle',
          handle: () => {
            // ???????????????
            this.areaList = {
              ids: [],
              name: ''
            };
            this.type = OperateTypeEnum.add;
            this.alarmName = '';
            this.areaConfig.initialValue = this.areaList;
            this.deviceTypeListValue = [];
            this.timeModel.recentlyTimeModel = [];
            // ???????????????
            this.initForm();
            this.display.creationTemplate = true;
            this.templateTitle = this.language.addStatisticalTemplate;
          }
        }
      ],
      operation: [
        {
          // ??????
          text: this.language.update,
          className: 'fiLink-edit',
          handle: (currentIndex) => {
            this.type = OperateTypeEnum.update;
            this.templateTitle = this.language.updateStatisticalTemplate;
            this.queryAlarmTempId(currentIndex.id);
          }
        },
        {
          text: this.language.deleteHandle,
          needConfirm: true,
          className: 'fiLink-delete red-icon',
          handle: (data) => {
            const ids = data.id;
            if (ids) {
              this.$alarmStatisticalService.deleteAlarmStatistical([ids]).subscribe((res: ResultModel<any>) => {
                if (res.code === 0) {
                  this.queryTemplateData();
                  this.$message.success(res.msg);
                } else {
                  this.$message.info(res.msg);
                }
              });
            }
          }
        },
      ],
      leftBottomButtons: [],
      sort: (event: SortCondition) => {
        this.queryCondition.filterConditions = this.filterEvent;
        this.queryCondition.bizCondition.sortField = event.sortField;
        this.queryCondition.bizCondition.sortRule = event.sortRule;
        this.queryTemplateData();
      },
    };
  }

  /**
   * ??????ID????????????????????????
   */
  private queryAlarmTempId(id: string[]): void {
    this.initForm();
    this.$alarmStatisticalService.queryAlarmStatByTempId(id).subscribe((res: ResultModel<StatisticalTemplateModel>) => {
      if (res.code === 0) {
        this.display.creationTemplate = true;
        const alarmData = res.data;
        this.updateParamsId = alarmData.id;
        const conditionData = JSON.parse(alarmData.condition as any);
        this.timeModel.recentlyTimeModel = [new Date(conditionData.beginTime), new Date(conditionData.endTime)];
        this.formStatus.resetControlData('time', this.timeModel.recentlyTimeModel);
        this.deviceTypeListValue = conditionData.deviceIds;
        this.formStatus.resetControlData('alarmSourceTypeId', this.deviceTypeListValue);
        this.areaList = conditionData.areaList;
        // ??????
        this.initAreaConfig();
        const areaNameList = conditionData.areaList.name.split(',');
        if ( this.bool ) {
          this.alarmName = conditionData.alarmList ? conditionData.alarmList.alarmNames.join(',') : '';
          const ids = conditionData.alarmList.ids.map((item, index) => {
            return {
              id: item,
              alarmName: conditionData.alarmList.alarmNames[index],
              alarmCode: conditionData.alarmList.selectAlarmCodes[index],
              checked: true
            };
          });
          this.selectAlarms = ids;
          this.selectAlarmData = {
            // ???????????????????????????
            selectAlarmCodes:  conditionData.alarmList.selectAlarmCodes,
            // ???????????????id??????
            ids: conditionData.alarmList.ids,
            // ???????????????????????????
            alarmNames: conditionData.alarmList.alarmNames
          };
          this.formStatus.resetControlData('alarmName', this.alarmName);
        }
        this.formStatus.resetControlData('templateName', alarmData.templateName);
        this.formStatus.resetControlData('areaNameList', areaNameList);
      }
    });
  }
}
