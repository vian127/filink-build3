import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {FormItem} from '../../../form/form-config';
import {FormOperate} from '../../../form/form-operate.service';
import {ClearBarrierWorkOrderModel} from '../../../../../core-module/model/work-order/clear-barrier-work-order.model';
import {CommonUtil} from '../../../../util/common-util';
import {ResultModel} from '../../../../model/result.model';
import {ResultCodeEnum} from '../../../../enum/result-code.enum';
import {AlarmLanguageInterface} from '../../../../../../assets/i18n/alarm/alarm-language.interface';
import {CommonLanguageInterface} from '../../../../../../assets/i18n/common/common.language.interface';
import {NzI18nService, NzModalService} from 'ng-zorro-antd';
import {FiLinkModalService} from '../../../../service/filink-modal/filink-modal.service';
import {RuleUtil} from '../../../../util/rule-util';
import {WorkOrderForCommonService} from '../../../../../core-module/api-service/work-order';
import {LanguageEnum} from '../../../../enum/language.enum';
import {AbstractControl} from '@angular/forms';
import {differenceInCalendarDays} from 'date-fns';
import {TreeSelectorConfigModel} from '../../../../model/tree-selector-config.model';
import {DepartmentUnitModel} from '../../../../../core-module/model/work-order/department-unit.model';
import {AccountabilityUnitModel} from '../../../../../core-module/model/trouble/accountability-unit.model';
import {AreaDeviceParamModel} from '../../../../../core-module/model/work-order/area-device-param.model';
import {SessionUtil} from '../../../../util/session-util';
import {AlarmTurnTroubleService} from '../../../../../core-module/mission/alarm-turn-trouble.service';
import {TroubleForCommonService} from '../../../../../core-module/api-service/trouble/trouble-for-common.service';
import { AlarmListModel } from '../../../../../core-module/model/alarm/alarm-list.model';
import {AlarmWorkResourceEnum} from '../../../../../core-module/enum/alarm/alarm-work-resource.enum';
import { UserForCommonUtil } from '../../../../../core-module/business-util/user/user-for-common.util';
import {InspectionLanguageInterface} from '../../../../../../assets/i18n/inspection-task/inspection.language.interface';
import {WhetherEnum} from '../../../../../core-module/enum/work-order/work-order.enum';

/**
 * ???????????????
 */
@Component({
  selector: 'app-add-work-order',
  templateUrl: './add-work-order.component.html',
  styleUrls: ['./add-work-order.component.scss']
})
export class AddWorkOrderComponent implements OnInit {
  @Input() modalTitle: string;
  @Input()
  set alarmInfo(alarmInfo: AlarmListModel) {
    if (alarmInfo) {
      this.creationWorkOrderData = alarmInfo;
      this.isShowModal = true;
      this.procTypeName = this.language.clearBarrier;
      this.initSetForm();
    }
  }
  // ???????????????????????????
  @Input() public isShowModal: boolean = false;
  @Output() close = new EventEmitter();
  // ????????????
  @ViewChild('department') department: TemplateRef<any>;
  // ????????????????????????
  @ViewChild('ecTimeTemp') ecTimeTemp: TemplateRef<any>;
  // ?????????????????????
  public creationWorkOrderData: AlarmListModel = new AlarmListModel();
  // ?????????????????????
  public language: AlarmLanguageInterface;
  // ????????????
  public commonLanguage: CommonLanguageInterface;
  // ????????????
  public inspectionLanguage: InspectionLanguageInterface;
  // ??????loading
  public isLoading: boolean = false;
  // ???????????????????????????
  public tableColumnSet: FormItem[] = [];
  // ????????????
  public procTypeName: string;
  // ??????
  public remark: string;
  // ??????id
  public userId: string;
  // ???????????????????????????
  public isOrderDis: boolean;
  // ????????????
  public deptName: string = '';
  // ??????????????????
  private areaNodes:  DepartmentUnitModel[] = [];
  // ???????????????????????????
  public unitSelectorConfig: TreeSelectorConfigModel = new TreeSelectorConfigModel();
  // ??????????????????
  public unitSelectVisible: boolean = false;
  // ??????code
  private deptCode: string = '';
  // ?????????????????????
  private selectorData: AccountabilityUnitModel = new AccountabilityUnitModel();
  private formStatusSet: FormOperate;
  constructor(
    private $nzI18n: NzI18nService,
    private $troubleService: TroubleForCommonService,
    private $message: FiLinkModalService,
    private $ruleUtil: RuleUtil,
    private $modal: NzModalService,
    private $clearBarrierService: WorkOrderForCommonService,
    private $alarmTurnTroubleService: AlarmTurnTroubleService,
  ) {
    // ??????????????????
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.alarm);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.inspectionLanguage = this.$nzI18n.getLocaleData(LanguageEnum.inspection);
  }

  ngOnInit() {
    // ??????????????????
    if (SessionUtil.getToken()) {
      this.userId = SessionUtil.getUserInfo().id;
    }
    this.queryDeptList(this.creationWorkOrderData.areaCode);
    this.initUnitSelectorConfig();
  }

  /**
   * ?????????????????????????????????
   * param event
   */
  public formInstanceSet(event: { instance: FormOperate }): void {
    this.formStatusSet = event.instance;
    // ????????????????????????????????????
    this.formStatusSet.group.statusChanges.subscribe(() => {
      this.isOrderDis = this.formStatusSet.getValid();
    });
  }

  /**
   * ?????????????????????????????????
   */
  public setHandleCancel(): void {
    this.isShowModal = false;
    this.close.emit();
  }

  /**
   * ???????????????????????????
   */
  public setHandle(): void {
    this.isLoading = true;
    const data = this.formStatusSet.group.getRawValue();
    const paramsData = new ClearBarrierWorkOrderModel();
    // ????????????????????????????????????????????????????????????
    paramsData.title = data.title;
    paramsData.refAlarm = this.creationWorkOrderData.id;
    paramsData.refAlarmName = data.refAlarmName;
    paramsData.deviceId = this.creationWorkOrderData.alarmDeviceId;
    paramsData.deviceName = this.creationWorkOrderData.alarmDeviceName;
    paramsData.deviceType = this.creationWorkOrderData.alarmDeviceTypeId;
    paramsData.deviceAreaId = this.creationWorkOrderData.areaId;
    paramsData.deviceAreaName = this.creationWorkOrderData.areaName;
    paramsData.remark = data.remark;
    paramsData.refAlarmCode = this.creationWorkOrderData.alarmCode;
    paramsData.accountabilityDept = this.deptCode;
    paramsData.accountabilityDeptName = this.deptName;
    paramsData.procResourceType = AlarmWorkResourceEnum.alarm;
    paramsData.deviceAreaCode = this.creationWorkOrderData.areaCode;
    paramsData.autoDispatch = data.autoDispatch;
    paramsData.equipment = [
      {
        'deviceId': this.creationWorkOrderData.alarmDeviceId,
        'equipmentId': this.creationWorkOrderData.alarmSource,
        'equipmentName': this.creationWorkOrderData.alarmObject,
        'equipmentType': this.creationWorkOrderData.alarmSourceTypeId
      }
    ];
    if (data.expectedCompletedTime) {
      paramsData.expectedCompletedTime = CommonUtil.sendBackEndTime(new Date(data.expectedCompletedTime).getTime());
    }
    this.$clearBarrierService.addWorkOrder(paramsData).subscribe((result: ResultModel<string>) => {
      this.isLoading = false;
      if (result.code === ResultCodeEnum.success) {
        // ??????????????? ?????????????????????????????????????????????
        this.$alarmTurnTroubleService.reloadClearBarrierEmit.emit(true);
        this.setHandleCancel();
        this.$message.success(this.commonLanguage.createSuccess);
      } else {
        this.$message.error(result.msg);
      }
    }, () => this.isLoading = false);
  }

  /**
   * ????????????
   */
  public disabledEndDate(current: Date): boolean {
    const nowTime = new Date();
    return differenceInCalendarDays(current, nowTime) < 0 || CommonUtil.checkTimeOver(current);
  }

  /**
   * ?????????????????????
   */
  public showUnitSelectorModal(): void {
    this.unitSelectorConfig.treeNodes = this.areaNodes;
    this.unitSelectVisible = true;
  }
  /**
   * ??????????????????
   * param event
   */
  public unitSelectChange(event: DepartmentUnitModel[]): void {
    if (event[0]) {
      UserForCommonUtil.setAreaNodesStatus(this.areaNodes, event[0].id);
      this.deptName = event[0].deptName;
      this.deptCode = event[0].deptCode;
      this.selectorData.parentId = event[0].id;
      this.formStatusSet.resetControlData('accountabilityDept', event[0].id);
    } else {
      UserForCommonUtil.setAreaNodesStatus(this.areaNodes, null);
      this.deptName = '';
      this.deptCode = '';
      this.selectorData.parentId = null;
      this.formStatusSet.resetControlData('accountabilityDept', null);
    }
  }

  /**
   * ?????????????????????????????????
   */
  private initSetForm(): void {
    this.tableColumnSet = [
      {  // ????????????
        label: this.language.workOrderName,
        key: 'title',
        type: 'input',
        col: 24,
        require: true,
        rule: [
          {required: true},
          RuleUtil.getNameMinLengthRule(),
          RuleUtil.getNameMaxLengthRule(),
          this.$ruleUtil.getNameRule()
        ],
        customRules: [this.$ruleUtil.getNameCustomRule()],
        asyncRules: [
          this.$ruleUtil.getNameAsyncRule(value => this.$clearBarrierService.checkClearName(CommonUtil.trim(value), null),
            res => res.code === ResultCodeEnum.success)
        ],
      },
      { // ????????????
        label: this.language.workOrderType, key: 'procType', type: 'input',
        require: true,
        disabled: true,
        col: 24,
        initialValue: this.procTypeName, rule: [],
      },
      {  // ????????????
        label: this.language.relevancyAlarm, key: 'refAlarmName', type: 'input',
        require: true,
        disabled: true,
        col: 24,
        initialValue: this.creationWorkOrderData.alarmName,
        rule: [{required: true}], asyncRules: [],
      },
      { // ??????????????????
        label: this.inspectionLanguage.autoDispatch,
        key: 'autoDispatch', type: 'radio',
        require: true, rule: [{required: true}],
        initialValue: WhetherEnum.deny,
        radioInfo: {
          data: [
            {label: this.inspectionLanguage.right, value: WhetherEnum.right}, // ???
            {label: this.inspectionLanguage.deny, value: WhetherEnum.deny}, // ???
          ],
          label: 'label', value: 'value'
        }
      },
      { // ????????????
        label: this.language.responsibleDepartment, key: 'accountabilityDept', type: 'custom',
        col: 24,
        template: this.department,
        rule: [], asyncRules: [],
      },
      { // ??????????????????
        label: this.language.lastDays,
        key: 'expectedCompletedTime',
        type: 'custom',
        template: this.ecTimeTemp,
        require: true,
        rule: [{required: true}],
        customRules: [{
          code: 'isTime',
          msg: null,
          validator: (control: AbstractControl): { [key: string]: boolean } => {
            if (control.value && CommonUtil.sendBackEndTime(new Date(control.value).getTime()) < new Date().getTime()) {
              if (this.formStatusSet.group.controls['expectedCompletedTime'].dirty) {
                this.$message.info(this.commonLanguage.expectCompleteTimeMoreThanNowTime);
                return {isTime: true};
              }
            } else {
              return null;
            }
          }
        }],
      },
      {  // ??????
        label: this.language.remark,
        key: 'remark', type: 'textarea',
        col: 24,
        rule: [this.$ruleUtil.getRemarkMaxLengthRule(), this.$ruleUtil.getNameRule()],
        customRules: [this.$ruleUtil.getNameCustomRule()],
      },
    ];
  }

  /**
   * ??????????????????
   */
  private queryDeptList(code: string): void {
    const param = new AreaDeviceParamModel();
    param.areaCodes = [code];
    param.userId = this.userId;
    this.$troubleService.queryUnitListByArea(param).subscribe((result: ResultModel<DepartmentUnitModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        this.areaNodes = result.data || [];
      }
    });
  }

  /**
   * ??????????????????????????????
   * param nodes
   */
  private initUnitSelectorConfig() {
    this.unitSelectorConfig = {
      width: '500px',
      height: '300px',
      title: this.language.responsibleDepartment,
      treeSetting: {
        check: {
          enable: true,
          chkStyle: 'radio',
          radioType: 'all',
        },
        data: {
          simpleData: {
            enable: true,
            idKey: 'id',
            pIdKey: 'deptFatherId',
            rootPid: null
          },
          key: {
            name: 'deptName',
            children: 'childDepartmentList'
          },
        },
        view: {
          showIcon: false,
          showLine: false
        }
      },
      treeNodes: this.areaNodes
    };
  }
}
