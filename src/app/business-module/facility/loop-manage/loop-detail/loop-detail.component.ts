import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NzI18nService} from 'ng-zorro-antd';
import * as _ from 'lodash';
import {FormOperate} from '../../../../shared-module/component/form/form-operate.service';
import {FacilityApiService} from '../../share/service/facility/facility-api.service';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {LoopApiService} from '../../share/service/loop/loop-api.service';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {RuleUtil} from '../../../../shared-module/util/rule-util';
import {FilterCondition} from '../../../../shared-module/model/query-condition.model';
import {FacilityLanguageInterface} from '../../../../../assets/i18n/facility/facility.language.interface';
import {AssetManagementLanguageInterface} from '../../../../../assets/i18n/asset-manage/asset-management.language.interface';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {SelectModel} from '../../../../shared-module/model/select.model';
import {LoopViewDetailModel} from '../../../../core-module/model/loop/loop-view-detail.model';
import {OperateTypeEnum} from '../../../../shared-module/enum/page-operate-type.enum';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {HISTORY_GO_STEP_CONST} from '../../share/const/facility-common.const';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {LoopTypeEnum} from '../../../../core-module/enum/loop/loop.enum';
import {EquipmentTypeEnum} from '../../../../core-module/enum/equipment/equipment.enum';
import {FacilityForCommonService} from '../../../../core-module/api-service/facility';
import {DeviceTypeEnum} from '../../../../core-module/enum/facility/facility.enum';
import {FacilityListModel} from '../../../../core-module/model/facility/facility-list.model';
import {EquipmentListModel} from '../../../../core-module/model/equipment/equipment-list.model';

/**
 * ???????????????????????????
 */
@Component({
  selector: 'app-loop-detail',
  templateUrl: './loop-detail.component.html',
  styleUrls: ['./loop-detail.component.scss']
})

export class LoopDetailComponent implements OnInit, OnDestroy {
  // ??????????????????
  @ViewChild('controlObjectTemp') private controlObjectTemp: TemplateRef<HTMLDocument>;
  // ?????????????????????
  @ViewChild('distributionBoxTemp') private distributionBoxTemp: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('linkDeviceTemp') private linkDeviceTemp: TemplateRef<HTMLDocument>;
  // ???????????????
  public language: FacilityLanguageInterface;
  // ???????????????
  public assetLanguage: AssetManagementLanguageInterface;
  // ????????????
  public formColumn: FormItem[] = [];
  // ????????????
  public formStatus: FormOperate;
  // ?????????????????????
  public distributionBoxFilter: FilterCondition[] = [];
  // ??????????????????????????????????????????
  public linkDeviceFilter: FilterCondition[] = [];
  //  ?????????????????????
  public controlObjectValue: SelectModel[] = [];
  // ??????????????????
  public loopTypeValue: SelectModel[] = [];
  // ??????????????????
  public pageLoading: boolean = false;
  // ???????????? ????????????
  public pageType: OperateTypeEnum;
  // ????????????
  public pageTitle: string;
  // ????????????
  public isLoading: boolean = false;
  // ?????????????????????????????????
  public distributionBoxVisible: boolean = false;
  // ?????????????????????
  public distributionBoxName: string;
  // ?????????????????????id
  public distributionBoxId: string;
  // ??????????????????????????????
  public linkDeviceVisible: boolean = false;
  // ????????????????????????
  public linkDeviceName: string;
  // ??????????????????
  public controlObjectName: string = '';
  // ??????id
  public loopId: string;
  // ????????????????????????
  public selectLinkDeviceName: string;
  // ??????????????????id??????
  public selectLinkDeviceIds: FacilityListModel[] = [];
  // ?????????????????????
  public isDisabled: boolean = true;
  // ??????????????????
  public formData: LoopViewDetailModel = new LoopViewDetailModel();

  // ???????????????
  public lineData = [];

  constructor(
    private $nzI18n: NzI18nService,
    private $ruleUtil: RuleUtil,
    private $active: ActivatedRoute,
    private $facilityApiService: FacilityApiService,
    private $message: FiLinkModalService,
    private $loopService: LoopApiService,
    private $facilityCommonService: FacilityForCommonService
  ) {
  }

  /**
   * ?????????
   */
  public ngOnInit(): void {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.assetLanguage = this.$nzI18n.getLocaleData(LanguageEnum.assets);
    // ?????????????????????
    this.pageType = this.$active.snapshot.params.type;
    // ???????????????????????????
    this.pageTitle = this.getPageTitle(this.pageType);
    // ????????????????????????
    this.loopTypeValue = CommonUtil.codeTranslate(LoopTypeEnum, this.$nzI18n, null, LanguageEnum.facility) as SelectModel[];
    // ???????????????
    this.initColumn();
    // ?????????????????????????????????
    this.handleInit();
  }

  /**
   * ??????????????????
   */
  public ngOnDestroy(): void {
    this.controlObjectTemp = null;
    this.distributionBoxTemp = null;
    this.linkDeviceTemp = null;
  }

  /**
   *  ???????????????????????????????????????
   */
  public selectDataChange(event: FacilityListModel[]): void {
    if (!_.isEmpty(event)) {
      this.distributionBoxName = event[0].deviceName;
      this.distributionBoxId = event[0].deviceId;
      const deviceId = event[0].deviceId;
      this.formStatus.resetControlData('distributionBoxId', this.distributionBoxId);
      // ??????????????????????????? ??????????????????
      this.formStatus.resetControlData('centralizedControlId', null);
      // ????????????????????????????????????
      this.controlObjectByDevice(deviceId);
      // ??????????????????????????????
      this.onChangeControlObject();
    }
  }

  /**
   * ???????????????
   */
  public formInstance(event: { instance: FormOperate }): void {
    this.formStatus = event.instance;
    // ????????????
    event.instance.group.statusChanges.subscribe(() => {
      this.isDisabled = !event.instance.getValid();
    });
  }


  /**
   * ????????????????????????
   */
  public selectLinkDeviceData(event): void {
    // ??????????????????????????????
    this.linkDeviceName = '';
    const deviceIds = [];
    const selectLinkDeviceName = [];
    if (!event.lineData && event.length === 1) {
      deviceIds.push(event[0].deviceId);
      this.linkDeviceName = event[0].deviceName;
    } else {
      this.lineData = event.lineData || [];
      this.selectLinkDeviceIds = event.selectFacilityId;
      if (!_.isEmpty(event.selectFacilityId)) {
        event.selectFacilityId.forEach(item => {
          selectLinkDeviceName.push(item.deviceName);
          deviceIds.push(item.deviceId);
        });
        this.selectLinkDeviceName = selectLinkDeviceName.join(',');
        this.linkDeviceName = this.selectLinkDeviceName;

      }
    }
    this.formStatus.resetControlData('deviceIds', deviceIds);
  }


  /**
   * ???????????????
   */
  public addOrEditLoop(): void {
    this.pageLoading = true;
    const formValue = _.cloneDeep(this.formStatus.group.getRawValue());
    this.isLoading = true;
    let request;
    let msgTip;
    if (this.pageType === OperateTypeEnum.add) {
      // ???????????????????????????
      formValue.loopLineInfos = this.lineData;
      request = this.$loopService.addLoop(formValue);
      msgTip = this.assetLanguage.addLoopSucceededTip;
      // ????????????
    } else {
      formValue.loopId = this.loopId;
      // ???????????????????????????
      formValue.loopLineInfos = this.lineData;
      request = this.$loopService.updateLoopById(formValue);
      msgTip = this.assetLanguage.editLoopSucceededTip;
    }
    // ??????????????????
    request.subscribe((result: ResultModel<string>) => {
      if (result.code === ResultCodeEnum.success) {
        this.pageLoading = false;
        this.$message.success(msgTip);
        this.goBack();
      } else {
        this.pageLoading = false;
        this.$message.error(result.msg);
      }
    }, () => this.isLoading = false);
  }

  /**
   * ??????
   */
  public goBack(): void {
    window.history.go(HISTORY_GO_STEP_CONST);
  }

  /**
   * ??????????????????
   */
  public onChangeControlObject(): void {
    this.formStatus.group.controls['loopCode'].markAsDirty();
    this.formStatus.group.controls['loopCode'].updateValueAndValidity();
  }

  /**
   * ???????????????????????????????????????????????????
   */
  private controlObjectByDevice(deviceId: string): void {
    const paramId = {deviceId: deviceId};
    this.$loopService.queryEquipmentInfoList(paramId).subscribe((result: ResultModel<EquipmentListModel[]>) => {
      if (!_.isEmpty(result.data)) {
        // ??????????????????????????????????????????
        this.controlObjectValue = [];
        result.data.forEach(item => {
          if (item.equipmentType === EquipmentTypeEnum.centralController) {
            this.controlObjectValue.push({label: item.equipmentName, code: item.equipmentId});
          }
        });
      }
    });
  }


  /**
   * ?????????????????????
   */
  private initColumn(): void {
    this.formColumn = [
      { // ????????????
        label: this.language.loopName,
        key: 'loopName',
        type: 'input',
        require: true,
        rule: [
          {required: true},
          RuleUtil.getNameMaxLengthRule(),
          this.$ruleUtil.getNameRule()
        ],
        customRules: [this.$ruleUtil.getNameCustomRule()],
        asyncRules: [this.$ruleUtil.getNameAsyncRule(value =>
            this.$loopService.queryLoopNameIsExist({loopId: this.loopId, loopName: value}),
          res => !res.data)
        ]
      },
      { // ????????????
        label: this.assetLanguage.loopCode,
        key: 'loopCode',
        type: 'input',
        require: true,
        placeholder: this.language.pleaseEnter,
        rule: [
          {required: true},
          RuleUtil.getNameMaxLengthRule(),
          this.$ruleUtil.getLoopCode()
        ],
        asyncRules: [
          // ??????????????????????????????
          this.$ruleUtil.getNameAsyncRule(value =>
            this.$loopService.queryLoopCodeIsExist(
              {
                loopId: this.loopId,
                loopCode: value,
                distributionBoxId: this.formStatus.getData('distributionBoxId'),
                centralizedControlId: this.formStatus.getData('centralizedControlId')
              }), res => !res.data, this.assetLanguage.loopCodeTip)
        ]
      },
      { // ????????????
        label: this.language.loopType,
        key: 'loopType',
        type: 'select',
        require: true,
        rule: [{required: true}],
        selectInfo: {
          data: CommonUtil.codeTranslate(LoopTypeEnum, this.$nzI18n, null, LanguageEnum.facility),
          label: 'label',
          value: 'code'
        },
        modelChange: (controls, $event, key, formOperate) => {
          this.handleDefined($event, formOperate);
        }
      },
      { // ?????????????????????
        label: '',
        key: 'customizeLoopType',
        type: 'input',
        require: false,
        hidden: true,
        rule: [
          {required: true},
          RuleUtil.getNameMaxLengthRule(),
          this.$ruleUtil.getNameRule()
        ],
        customRules: [this.$ruleUtil.getNameCustomRule()],
      },
      { // ???????????????
        label: this.language.distributionBox,
        key: 'distributionBoxId',
        type: 'custom',
        template: this.distributionBoxTemp,
        require: true,
        rule: [{required: true}],
        asyncRules: [],
      },
      { // ????????????
        label: this.language.setDevice,
        key: 'deviceIds',
        type: 'custom',
        template: this.linkDeviceTemp,
        rule: [],
        asyncRules: []
      },
      { // ?????????????????????
        label: this.language.controlledObject,
        key: 'centralizedControlId',
        type: 'custom',
        rule: [],
        template: this.controlObjectTemp,
      },
      { // ??????
        label: this.language.remarks,
        key: 'remark',
        type: 'textarea',
        placeholder: this.language.pleaseEnter,
        rule: [this.$ruleUtil.getRemarkMaxLengthRule()]
      },
    ];
  }

  /**
   * ??????????????????????????????????????????
   */
  private handleDefined(typeCode: string, formOperate?: FormOperate): void {
    this.formColumn.forEach(v => {
      if (v.key === 'customizeLoopType') {
        v.hidden = typeCode !== LoopTypeEnum.customize;
        if (!v.hidden) {
          this.formStatus.addRule(v.rule, v.customRules);
        } else {
          this.formStatus.deleteValidRule(v);
          this.formStatus.resetControlData('customizeLoopType', null, {emitEvent: true});
        }
        this.formStatus.group.controls['customizeLoopType'].markAsDirty();
        this.formStatus.group.controls['customizeLoopType'].updateValueAndValidity();
      }
    });
  }

  /**
   * ????????????????????????
   */
  private handleInit(): void {
    // ?????????????????????????????????
    this.distributionBoxFilter = [
      new FilterCondition('deviceType', OperatorEnum.in, [DeviceTypeEnum.distributionPanel])
    ];
    // ????????????????????????????????????????????????????????????
    this.linkDeviceFilter = [
      new FilterCondition('deviceType', OperatorEnum.in, [DeviceTypeEnum.wisdom])];
    if (this.pageType !== OperateTypeEnum.add) {
      this.$active.queryParams.subscribe(params => {
        this.loopId = params.id;
        this.loopDetailView();
      });
    }
  }

  /***
   * ??????????????????
   */
  private loopDetailView(): void {
    // ??????????????????
    this.$facilityCommonService.queryLoopDetail({loopId: this.loopId}).subscribe((result: ResultModel<LoopViewDetailModel>) => {
      this.selectLinkDeviceIds = [];
      const linkDeviceName = [];
      if (result.code === ResultCodeEnum.success) {
        this.formData = result.data;
        // ???????????????????????????
        this.lineData = result.data.loopLineInfos;
        this.distributionBoxId = this.formData.distributionBoxId;
        // ??????????????????????????????????????????????????????
        this.controlObjectByDevice(this.distributionBoxId);
        this.selectLinkDeviceIds = this.formData.loopDeviceRespList;
        this.formData.deviceIds = [];
        this.formData.loopDeviceRespList.forEach(item => {
          // ????????????id??????
          linkDeviceName.push(item.deviceName);
          this.formData.deviceIds.push(item.deviceId);
        });
        // ????????????????????????
        this.linkDeviceName = linkDeviceName.join(',');
        // ?????????????????????
        this.distributionBoxName = this.formData.distributionBoxName;
        // ??????????????????
        this.controlObjectName = this.formData.centralizedControlName;
        this.formStatus.resetData(this.formData);
      }
    });
  }

  /**
   * ????????????????????????
   * param type
   * returns {string}
   */
  private getPageTitle(type: OperateTypeEnum): string {
    let title;
    switch (type) {
      case OperateTypeEnum.add:
        title = this.language.addLoop;
        break;
      case OperateTypeEnum.update:
        title = this.language.editLoop;
        break;
      default:
        title = '';
        break;
    }
    return title;
  }
}
