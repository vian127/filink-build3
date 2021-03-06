import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {FormItem} from '../../../../../../shared-module/component/form/form-config';
import {FormOperate} from '../../../../../../shared-module/component/form/form-operate.service';
import {NzI18nService} from 'ng-zorro-antd';
import {AlarmLanguageInterface} from '../../../../../../../assets/i18n/alarm/alarm-language.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {FiLinkModalService} from '../../../../../../shared-module/service/filink-modal/filink-modal.service';
import {RuleUtil} from '../../../../../../shared-module/util/rule-util';
import {
  AlarmSelectorConfigModel,
  AlarmSelectorInitialValueModel,
} from '../../../../../../shared-module/model/alarm-selector-config.model';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {differenceInCalendarDays} from 'date-fns';
import {CommonUtil} from '../../../../../../shared-module/util/common-util';
import {OperateTypeEnum} from '../../../../../../shared-module/enum/page-operate-type.enum';
import {LanguageEnum} from '../../../../../../shared-module/enum/language.enum';
import {AlarmService} from '../../../../share/service/alarm.service';
import {AlarmInventoryEnum, AlarmEnableStatusEnum} from '../../../../share/enum/alarm.enum';
import {EquipmentListModel} from '../../../../../../core-module/model/equipment/equipment-list.model';
import {AlarmFiltrationModel} from '../../../../share/model/alarm-filtration.model';
import {ResultModel} from '../../../../../../shared-module/model/result.model';
import {AlarmUtil} from '../../../../share/util/alarm.util';
import {AlarmSelectorConfigTypeEnum} from '../../../../../../shared-module/enum/alarm-selector-config-type.enum';
import {ResultCodeEnum} from '../../../../../../shared-module/enum/result-code.enum';
import {EquipmentAddInfoModel} from '../../../../../../core-module/model/equipment/equipment-add-info.model';
import {AlarmEquipmentNameModel} from '../../../../share/model/alarm-equipment-name.model';

/**
 * ???????????? ?????????????????????
 */
@Component({
  selector: 'app-alarm-filtration-add',
  templateUrl: './alarm-filtration-add.component.html',
  styleUrls: ['./alarm-filtration-add.component.scss'],
})

export class AlarmFiltrationAddComponent implements OnInit {
  // ????????????
  @ViewChild('startTime') private startTime;
  // ????????????
  @ViewChild('endTime') private endTime;
  // ????????????
  @ViewChild('isNoStartUsing') private isNoStartUsing;
  // ????????????
  @ViewChild('alarmName') private alarmName;
  // ????????????
  @ViewChild('titleDataTemplate') private titleDataTemplate;
  // ??????????????????
  @ViewChild('filtrationDataTemplate') private filtrationDataTemplate;
  // ????????????(????????????)
  @ViewChild('alarmEquipmentTemp') private alarmEquipmentTemp: TemplateRef<any>;
  // ???????????????
  public language: AlarmLanguageInterface;
  // ????????????
  public pageType: OperateTypeEnum = OperateTypeEnum.add;
  // ???????????? ?????? ???
  public defaultStatus: AlarmInventoryEnum = AlarmInventoryEnum.yes;
  // ???????????? ?????? ??????
  public isNoStartData: boolean = true;
  // ?????????????????????
  public equipmentVisible: boolean = false;
  // ????????????(????????????)
  public checkAlarmEquipment: AlarmSelectorInitialValueModel = new AlarmSelectorInitialValueModel();
  // ??????????????????
  public selectEquipments: EquipmentListModel[] = [];
  // ?????????????????????
  public isLoading: boolean = false;
  // ??????????????????Value???
  public dateStart: number;
  // ??????????????????Value???
  public dateEnd: number;
  public ruleName: string;
  // ???????????????????????????
  public formColumn: FormItem[] = [];
  // ???????????????????????????
  public formStatus: FormOperate;
  // ?????????????????????
  public checkAlarmName: AlarmSelectorInitialValueModel = new AlarmSelectorInitialValueModel();
  // ????????????
  public display = {
    alarmNameDisabled: true,
    rulePopUp: false,
  };
  // ??????????????????
  public alarmNameConfig: AlarmSelectorConfigModel;
  // ??????
  public title: string = '';
  // ??????id
  public updateParamsId: string;
  // ?????????????????????
  public isDisabled: boolean;
  // ?????????????????????
  private today: Date = new Date();

  constructor(
    public $nzI18n: NzI18nService,
    public $message: FiLinkModalService,
    public $active: ActivatedRoute,
    public $router: Router,
    public $alarmService: AlarmService,
    public $modalService: FiLinkModalService,
    private $ruleUtil: RuleUtil,
  ) {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.alarm);
  }

  /**
   * ?????????
   */
  ngOnInit() {
    this.initForm();
    this.pageType = this.$active.snapshot.params.type;
    if (this.pageType === OperateTypeEnum.add) {
      // ??????
      this.title = this.language.addAlarmFiltration;
      this.initAlarmNameConfig();
    } else {
      // ??????
      this.title = this.language.updateAlarmFiltration;
      this.$active.queryParams.subscribe(params => {
        this.updateParamsId = params.id;
        this.getAlarmData(params.id);
      });
    }
  }

  /**
   * ??????
   */
  public initForm() {
    this.formColumn = [
      {
        // ????????????
        label: '',
        key: 'title',
        type: 'custom',
        rule: [],
        asyncRules: [],
        template: this.titleDataTemplate,
      },
      {
        label: this.language.name,
        key: 'ruleName',
        type: 'input',
        require: true,
        rule: [
          {required: true},
          {maxLength: 32},
          this.$ruleUtil.getNameRule(),
        ],
        customRules: [this.$ruleUtil.getNameCustomRule()],
        modelChange: (controls, event, key, formOperate) => {
          this.ruleName = event;
        },
      },
      {
        label: this.language.remark,
        key: 'remark',
        type: 'input',
        rule: [
          this.$ruleUtil.getRemarkMaxLengthRule()],
        customRules: [this.$ruleUtil.getNameCustomRule()],
      },
      {
        // ??????????????????
        label: '',
        key: 'title',
        type: 'custom',
        initialValue: '',
        rule: [],
        asyncRules: [],
        template: this.filtrationDataTemplate,
      },
      {
        // ????????????
        label: this.language.alarmobject,
        key: 'alarmFilterRuleSourceList',
        type: 'custom',
        require: true,
        rule: [{required: true}],
        asyncRules: [],
        template: this.alarmEquipmentTemp,
      },
      {
        // ????????????
        label: this.language.alarmName,
        key: 'alarmFilterRuleNameList',
        type: 'custom',
        require: true,
        rule: [{required: true}],
        asyncRules: [],
        template: this.alarmName,
      },
      {
        // ????????????
        label: this.language.startTime,
        key: 'beginTime',
        type: 'custom',
        template: this.startTime,
        require: true,
        rule: [],
        asyncRules: [
          {
            asyncRule: (control: FormControl) => {
              // ????????????????????????????????????
              return Observable.create(observer => {
                this.dateStart = control.value;
                if (this.dateStart) {
                  observer.next(null);
                  observer.complete();
                } else {
                  observer.next({error: true, duplicated: true});
                  observer.complete();
                }
              });
            },
          },
        ],
      },
      {
        // ????????????
        label: this.language.endTime,
        key: 'endTime',
        type: 'custom',
        template: this.endTime,
        require: true,
        rule: [],
        asyncRules: [
          {
            asyncRule: (control: FormControl) => {
              this.dateEnd = control.value;
              if (!control.value) {
                return Observable.create(observer => {
                  observer.next(null);
                  observer.complete();
                });
              }
              const start = (new Date(this.dateStart)).getTime();
              const end = new Date(control.value).getTime();
              // ????????????????????????????????????
              if (start > end) {
                this.$modalService.error(this.language.endTimeTip);
                this.dateEnd = null;
                this.formStatus.resetControlData('endTime', '');
                return Observable.create(observer => {
                  observer.next(null);
                  observer.complete();
                });
              }
              return Observable.create(observer => {
                // ????????????????????????????????????
                if (this.dateEnd < this.dateStart && this.dateEnd) {
                  this.$modalService.info(this.language.endTimeTip);
                }
                if (control.value && control.value > this.dateStart) {
                  // ?????????????????????????????????????????????
                  if (!this.dateStart || this.dateStart > this.dateEnd) {
                    this.$modalService.info(this.language.firstSelectEndDateTip);
                    this.formStatus.resetControlData('endTime', '');
                  }
                  observer.next(null);
                  observer.complete();
                } else {
                  observer.next({error: true, duplicated: true});
                  observer.complete();
                }
              });
            },
          },
        ],
      },
      {
        // ????????????
        label: this.language.isNoStored,
        key: 'storeDatabase',
        type: 'radio',
        require: true,
        rule: [{required: true}],
        initialValue: this.defaultStatus,
        radioInfo: {
          data: [
            {label: this.language.yes, value: AlarmInventoryEnum.yes},
            {label: this.language.no, value: AlarmInventoryEnum.no},
          ],
          label: 'label',
          value: 'value',
        },
      },
      {
        // ????????????
        label: this.language.openStatus,
        key: 'status',
        type: 'custom',
        template: this.isNoStartUsing,
        initialValue: this.isNoStartData,
        require: true,
        rule: [],
        asyncRules: [],
        radioInfo: {
          type: 'select',
          selectInfo: [
            AlarmUtil.translateDisableAndEnable(this.$nzI18n, null),
          ],
          label: 'label',
          value: 'value',
        },
      },
    ];
  }

  /**
   * ??????????????????
   */
  public onSelectEquipment(event: EquipmentListModel[]): void {
    // ?????????????????????????????????
    if (event && event.length > 0) {
      this.display.alarmNameDisabled = false;
    } else {
      this.display.alarmNameDisabled = true;
    }
    this.selectEquipments = event;
    this.checkAlarmEquipment = {
      ids: event.map(v => v.equipmentId) || [],
      name: event.map(v => v.equipmentName).join(',') || '',
    };
    this.formStatus.resetControlData('alarmFilterRuleSourceList', this.checkAlarmEquipment.ids);
    // ?????????????????????????????????????????????
    this.checkAlarmName = new AlarmSelectorInitialValueModel();
    this.formStatus.resetControlData('alarmFilterRuleNameList', null);
    this.initAlarmNameConfig();
  }

  /**
   * ??????????????????
   */
  public openEquipmentSelector(): void {
    this.equipmentVisible = true;
  }

  /**
   * ??????????????????
   */
  public confirmButtonIsGray(value: AlarmFiltrationModel): boolean {
    value.ruleName = value.ruleName ? value.ruleName.trim() : null;
    if (this.dateEnd && this.dateStart && this.checkAlarmEquipment.name && value.ruleName && value.ruleName.length <= 32 &&
      this.checkAlarmName.name && new Date(this.dateStart) < new Date(this.dateEnd)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * ??????????????????????????????
   */
  public getAlarmData(id: string): void {
    this.$alarmService.queryAlarmById(id).subscribe((res: ResultModel<AlarmFiltrationModel>) => {
      if (res.code === 0) {
        const alarmData = res.data[0];
        // ??????????????????
        if (alarmData.alarmFilterRuleSourceList && alarmData.alarmFilterRuleSourceList.length) {
          this.getAlarmFilterObjectName(alarmData.alarmFilterRuleSourceList).then((result: EquipmentAddInfoModel[]) => {
            alarmData.alarmFilterRuleSourceName = this.handleEquipmentDataToGetName(alarmData.alarmFilterRuleSourceList, result);
            if (alarmData.alarmFilterRuleSourceName) {
              this.checkAlarmEquipment = {
                name: alarmData.alarmFilterRuleSourceName.join(','),
                ids: alarmData.alarmFilterRuleSourceList,
              };
            }
            alarmData.alarmFilterRuleSourceList.map((v, index) => {
              const equipmentListModel = new EquipmentListModel();
              equipmentListModel.equipmentId = v;
              equipmentListModel.equipmentName = alarmData.alarmFilterRuleSourceName[index] || '';
              // ?????????????????????????????????
              this.selectEquipments.push(equipmentListModel);
            });
            this.formStatus.resetControlData('alarmFilterRuleSourceList', this.checkAlarmEquipment.ids);
          });
        }
        // ??????????????????
        if (alarmData.alarmFilterRuleNameList && alarmData.alarmFilterRuleNameList.length
          && alarmData.alarmFilterRuleNames && alarmData.alarmFilterRuleNames.length) {
          const alarmName = alarmData.alarmFilterRuleNames.join(',');
          this.checkAlarmName = new AlarmSelectorInitialValueModel(alarmName, alarmData.alarmFilterRuleNameList);
          this.formStatus.resetControlData('alarmFilterRuleNameList', this.checkAlarmName.ids);
          this.display.alarmNameDisabled = false;
        }
        this.initAlarmNameConfig();
        // ?????????????????????????????????
        alarmData.beginTime = new Date(CommonUtil.convertTime(new Date(alarmData.beginTime).getTime()));
        alarmData.endTime = new Date(CommonUtil.convertTime(new Date(alarmData.endTime).getTime()));
        if (alarmData.beginTime) {
          this.formStatus.resetControlData('beginTime',
            new Date(CommonUtil.convertTime(alarmData.beginTime)));
        }
        if (alarmData.endTime) {
          this.formStatus.resetControlData('endTime',
            new Date(CommonUtil.convertTime(alarmData.endTime)));
        }
        // ?????? ????????????
        if (alarmData.status) {
          this.isNoStartData = alarmData.status === AlarmEnableStatusEnum.enable;
        }
        // ????????????
        if (alarmData.storeDatabase) {
          alarmData.storeDatabase = String(alarmData.storeDatabase);
        }
        this.formStatus.resetData(alarmData);
      }
    });
  }

  /**
   * ????????????id????????????????????????
   * @param equipmentIds ??????id??????
   */
  public getAlarmFilterObjectName(equipmentIds: string[]): Promise<EquipmentAddInfoModel[]> {
    const obj: AlarmEquipmentNameModel = new AlarmEquipmentNameModel(equipmentIds);
    return new Promise((resolve, reject) => {
        this.$alarmService.getAlarmFilterEquipmentList(obj).subscribe((res) => {
          if (res.code === ResultCodeEnum.success) {
            resolve(res.data);
          }
        }, (error) => {
          reject(error);
        });
      },
    );
  }

  /**
   * ????????????id??????????????????????????????????????????
   * @param equipmentIds ??????id??????
   * @param equipmentData ??????????????????
   */
  public handleEquipmentDataToGetName(equipmentIds: string[], equipmentData: EquipmentAddInfoModel[]): string[] {
    const name: string[] = [];
    equipmentIds.forEach((item) => {
      equipmentData.forEach(e => {
        if (item === e.equipmentId) {
          name.push(e.equipmentName);
        }
      });
    });
    return name;
  }

  /**
   * ?????????????????????
   */
  public formInstance(event: { instance: FormOperate }): void {
    this.formStatus = event.instance;
    this.formStatus.group.valueChanges.subscribe((params) => {
      this.isDisabled = this.confirmButtonIsGray(params);
    });
  }

  /**
   * ??????????????????????????????????????????
   */
  public disabledStartDate = (current: Date): boolean => {
    this.today = new Date();
    return differenceInCalendarDays(current, this.today) < 0 || CommonUtil.checkTimeOver(current);
  }
  /**
   * ??????????????????????????????
   */
  public disabledEndDate = (current: Date): boolean => {
    if (this.dateStart !== null) {
      return differenceInCalendarDays(current, this.dateStart) < 0 || CommonUtil.checkTimeOver(current);
    }
  }

  /**
   *????????????
   */
  public submit(): void {
    this.isLoading = true;
    const alarmObj: AlarmFiltrationModel = this.formStatus.getData();
    alarmObj.ruleName = alarmObj.ruleName.trim();
    alarmObj.remark = alarmObj.remark && alarmObj.remark.trim();
    alarmObj.alarmFilterRuleSourceName = this.checkAlarmEquipment.name.split(',');
    // ??????????????? ??????????????????
    alarmObj.status = this.isNoStartData ? AlarmEnableStatusEnum.enable : AlarmEnableStatusEnum.disable;
    alarmObj.beginTime = CommonUtil.sendBackEndTime(new Date(alarmObj.beginTime).getTime());
    alarmObj.endTime = CommonUtil.sendBackEndTime(new Date(alarmObj.endTime).getTime());
    let requestPath: string = '';
    if (this.pageType === OperateTypeEnum.add) {
      // ??????
      requestPath = 'addAlarmFiltration';
    } else {
      // ??????
      alarmObj.id = this.updateParamsId;
      requestPath = 'updateAlarmFiltration';
    }
    this.$alarmService[requestPath](alarmObj).subscribe((res: ResultModel<string>) => {
      this.isLoading = false;
      if (res && res.code === 0) {
        this.$message.success(res.msg);
        this.$router.navigate(['business/alarm/alarm-filtration']).then();
      } else {
        this.$message.error(res.msg);
      }
    });
  }

  /**
   * ??????
   */
  public cancel(): void {
    this.$router.navigate(['business/alarm/alarm-filtration']).then();
  }

  /**
   * ??????????????????
   */
  public ruleTable(event: AlarmFiltrationModel) {
    this.display.rulePopUp = false;
    if (event && event.id) {
      this.getAlarmData(event.id);
    }
  }

  /**
   * ????????????
   */
  private initAlarmNameConfig() {
    this.alarmNameConfig = {
      type: AlarmSelectorConfigTypeEnum.form,
      initialValue: this.checkAlarmName,
      disabled: this.display.alarmNameDisabled,
      clear: !this.checkAlarmName.ids.length,
      handledCheckedFun: (event: AlarmSelectorInitialValueModel) => {
        this.checkAlarmName = new AlarmSelectorInitialValueModel(event.name, event.ids);
        this.formStatus.resetControlData('alarmFilterRuleNameList', this.checkAlarmName.ids);
      },
    };
  }
}
