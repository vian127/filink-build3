import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {FormOperate} from '../../../../shared-module/component/form/form-operate.service';
import {DateHelperService, NzI18nService, NzModalService} from 'ng-zorro-antd';
import {FacilityAuthLanguageInterface} from '../../../../../assets/i18n/facility-authorization/facilityAuth-language.interface';
import {UserForCommonService} from '../../../../core-module/api-service/user';
import {ApplicationService} from '../../share/service/application.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {DateFormatStringEnum} from '../../../../shared-module/enum/date-format-string.enum';
import {PageModel} from '../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {
  FilterCondition,
  QueryConditionModel,
  SortCondition
} from '../../../../shared-module/model/query-condition.model';
import {UserLanguageInterface} from '../../../../../assets/i18n/user/user-language.interface';
import {FacilityLanguageInterface} from '../../../../../assets/i18n/facility/facility.language.interface';
import {FacilityForCommonService} from '../../../../core-module/api-service/facility';
import {RuleUtil} from '../../../../shared-module/util/rule-util';
import {permissionId} from './permissionId';
import {UserForCommonUtil} from '../../../../core-module/business-util/user/user-for-common.util';
import {DeployStatusEnum, DeviceStatusEnum, DeviceTypeEnum} from '../../../../core-module/enum/facility/facility.enum';
import {ResultModel} from '../../../../shared-module/model/result.model';

import {AuthorizationUtil } from '../../share/util/authorization.util';
import {AuthorityModel, DeviceAndDoorDataModel} from '../../share/model/authority.model';
import {UserListModel} from '../../../../core-module/model/user/user-list.model';
import {FacilityListModel} from '../../../../core-module/model/facility/facility-list.model';
import {OperateTypeEnum} from '../../../../shared-module/enum/page-operate-type.enum';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {differenceInCalendarDays} from 'date-fns';
import {TreeSelectorConfigModel} from '../../../../shared-module/model/tree-selector-config.model';
import { FacilityForCommonUtil } from '../../../../core-module/business-util/facility/facility-for-common.util';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {AuthorityTypeEnum} from '../../share/enum/authority.enum';
/**
 * ????????????????????????
 */
@Component({
  selector: 'app-unified-details',
  templateUrl: './unified-details.component.html',
  styleUrls: ['./unified-details.component.scss']
})

export class UnifiedDetailsComponent implements OnInit {
  // ????????????????????????
  @ViewChild('effectiveTimeTemp') effectiveTimeTemp: TemplateRef<HTMLDocument>;
  // ????????????????????????
  @ViewChild('expirationTimeTemp') expirationTimeTemp: TemplateRef<HTMLDocument>;
  // ????????????????????????
  @ViewChild('authRangeTemp') authRangeTemp: TemplateRef<HTMLDocument>;
  // ?????????????????????
  @ViewChild('userTemp') userTemp: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('userListTemp') userListTemp: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('facilityListTemp') facilityListTemp: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('xCTableComp') xCTableComp;
  // ??????????????????
  @ViewChild('authXcTableComp') authXcTableComp;
  // ??????????????????
  @ViewChild('deviceStatusTemp') deviceStatusTemp: TemplateRef<HTMLDocument>;
  @ViewChild('deviceTypeTemp') deviceTypeTemp: TemplateRef<HTMLDocument>;
  // ?????????????????????
  @ViewChild('radioTemp') radioTemp: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('doorLocksTemp') doorLocksTemp: TemplateRef<HTMLDocument>;
  // ????????????
  @ViewChild('thTemplate') thTemplate: TemplateRef<HTMLDocument>;
  // ??????/????????????
  @ViewChild('departmentTemp') departmentTemp: TemplateRef<HTMLDocument>;
  // ?????????????????????????????????
  @ViewChild('unitNameSearch') private unitNameSearch: TemplateRef<HTMLDocument>;
  // ?????????????????????
  public commonLanguage: CommonLanguageInterface;
  // ???????????????????????????
  public language: FacilityAuthLanguageInterface;
  // ?????????????????????
  public userLanguage: UserLanguageInterface;
  // ?????????????????????
  public facilityLanguage: FacilityLanguageInterface;
  // ????????????????????????
  public formColumn: FormItem[] = [];
  // ?????????????????????
  public formStatus: FormOperate;
  // ??????????????????????????????
  public isLoading: boolean = false;
  // ??????????????????
  public authInfo: AuthorityModel = new AuthorityModel();
  // ??????id
  public authId: string = '';
  // ?????????????????? ??????/??????
  public pageType: OperateTypeEnum = OperateTypeEnum.add;
  // ?????????????????? ??????/??????
  public pageTitle: string;
  // ??????????????????(??????)
  public authEffectiveTime: Date | string = null;
  // ??????????????????(??????)
  public authExpirationTime: Date | string = null;
  // ??????????????????(??????)
  public effectiveTime: Date | string = null;
  // ??????????????????(??????)
  public expirationTime: Date | string = null;
  // ???????????????????????????
  public selectUserName: string = '';
  // ?????????????????????id
  public selectedUserId: string | null = null;
  // ?????????id
  public userId: string = '';
  public userName: string = '';
  // ???????????????
  public deviceAndDoorData: DeviceAndDoorDataModel[] = [] ;
  // ???????????????
  public concatParams: DeviceAndDoorDataModel[] = [];
  // ?????????????????????
  public userDataSet: UserListModel[] = [];
  public userPageBean: PageModel = new PageModel(10, 1, 1);
  // ????????????????????????
  public userTableConfig: TableConfigModel;
  // ????????????????????????
  public userQueryCondition: QueryConditionModel = new QueryConditionModel();
  // ????????????
  public filterObject = {};
  // ?????????????????????????????????
  public facilityDataSet: FacilityListModel[] = [];
  // ??????????????????????????????
  public facilityPageBean: PageModel = new PageModel(10, 1, 1);
  // ????????????????????????????????????
  public facilityTableConfig: TableConfigModel;
  // ????????????????????????????????????
  public facilityQueryCondition: QueryConditionModel = new QueryConditionModel();
  // ??????????????????????????????????????????
  public checkList: string[] = [];
  // ??????id
  public deviceId: string;
  // ?????????
  public doorNum: string;
  // ????????????????????????
  public checkedListData: string[] = [];
  // ???????????????????????????
  public _selectedUserId: string = null;
  // ????????????????????????
  public selectUnitName: string = '';
  // ?????????
  public treeNodes = [];
  // ???????????????
  public treeSetting = {};
  // ?????????????????????
  public filterValue: any;
  // ???????????????????????????
  public isVisible: boolean = false;
  // ??????????????????????????????
  public treeSelectorConfig: TreeSelectorConfigModel;
  // ???????????????????????????
  public xcVisible: boolean = false;
  // ????????????
  public authorityType = AuthorityTypeEnum.unifiedAuthority ;
  // ??????????????????????????????????????????
  public deviceTypeCanSeeList;
  constructor(
    // ???????????????
    private $nzI18n: NzI18nService,
    // ??????????????????
    private $userForCommonService: UserForCommonService,
    // ????????????
    private $applicationService: ApplicationService,
    // ????????????
    private $activatedRoute: ActivatedRoute,
    // ??????
    private $router: Router,
    // ????????????
    private $message: FiLinkModalService,
    // ????????????
    private $dateHelper: DateHelperService,
    private $modal: NzModalService,
    // ????????????
    private $facilityCommonService: FacilityForCommonService,
    // ??????????????????
    private $ruleUtil: RuleUtil
  ) {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.facilityAuth);
    this.commonLanguage =  this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.userLanguage = this.$nzI18n.getLocaleData(LanguageEnum.user);
    this.facilityLanguage = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.deviceTypeCanSeeList = CommonUtil.codeTranslate(DeviceTypeEnum, this.$nzI18n);
  }

  /**
   * ?????????
   */
  public ngOnInit(): void {
    this.$activatedRoute.params.subscribe((params: Params) => {
      this.pageType = params.type;
    });
    this.pageTitle = this.getPageTitle(this.pageType);
    this.initColumn();
    if (this.pageType !== OperateTypeEnum.add) {
      this.$activatedRoute.queryParams.subscribe(params => {
        this.authId = params.id;
        this.queryAuthInfoById(this.authId);   // ??????????????????????????????
      });
    } else {
      // ?????????????????????????????????
      this.$activatedRoute.queryParams.subscribe(params => {
        if (JSON.stringify(params) !== '{}') {
          this.deviceId = params.id;
          this.doorNum = params.slotNum;
          const doorNumArr = this.doorNum.split(',');
          // ????????????id????????????????????????-?????????????????????
          this.checkList.push(this.deviceId);
          doorNumArr.forEach(item => {
            // ???????????????id????????????????????????-????????????????????????
            this.deviceAndDoorData.push({
              deviceId: this.deviceId,
              doorNum: item
            });
          });
          const query_Conditions = [
            {
              filterField: 'deviceId',
              operator: 'in',
              filterValue: [this.deviceId],
            }
          ];
          query_Conditions.forEach(item => {
            this.facilityQueryCondition.filterConditions.push(item);
          });
          setTimeout(() => {
            this.formStatus.resetControlData('authDeviceList', this.deviceAndDoorData);
          }, 0);

        }
      });

    }
    // ?????????????????????
    this.initUserTableConfig();
    // ?????????????????????
    this.queryDeptList();
    // ??????????????????
    this.initTreeSelectorConfig();
    this.deviceTypeCanSeeList = AuthorizationUtil.getUserCanLookDeviceType(this.deviceTypeCanSeeList);
  }

  public formInstance(event): void {
    this.formStatus = event.instance;
  }

  /**
   * ????????????????????????
   */
  public userPageChange(event: PageModel): void {
    this.userQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.userQueryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshUserData();
  }

  /**
   * ??????????????????????????????????????????
   */
  public disabledStartDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, new Date()) < 0 || CommonUtil.checkTimeOver(current);
  }
  /**
   * ??????????????????????????????
   */
  public disabledEndDate = (current: Date): boolean => {
    if (this.authEffectiveTime !== null) {
      return differenceInCalendarDays(current, this.authEffectiveTime) < 0 || CommonUtil.checkTimeOver(current);
    }
  }
  /**
   * ??????????????????
   */
  public facilityPageChange(event: PageModel): void {
    this.facilityQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.facilityQueryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshFacilityData();
  }
  /**
   * ????????????????????????
   * @param result ??????
   */
  public effectiveOnChange(result: Date): void {
    this.effectiveTime = result;
    this.authInfo['authEffectiveTime'] = CommonUtil.getTimeStamp(this.effectiveTime);
    this.formStatus.resetControlData('authEffectiveTime', result);
  }

  /**
   * ????????????????????????
   * @param result ??????
   */
  public effectiveOnOk(result: Date): void {
    this.effectiveTime = result;
    this.authInfo['authEffectiveTime'] = CommonUtil.getTimeStamp(this.effectiveTime);
  }


  /**
   * ????????????????????????
   * @param result ??????
   */
  public expirationOnChange(result: Date): void {
    this.expirationTime = result;
    this.authInfo['authExpirationTime'] = CommonUtil.getTimeStamp(this.expirationTime);
    this.formStatus.resetControlData('authExpirationTime', result);
  }
  /**
   * ????????????????????????
   * @param result ??????
   */
  public expirationOnOk(result: Date): void {
    this.expirationTime = result;
    this.authInfo['authExpirationTime'] = CommonUtil.getTimeStamp(this.expirationTime);
  }


  /**
   * ???????????????????????????
   */
  public submit(): void {
    this.isLoading = true;
    // ??????
    if (this.pageType === OperateTypeEnum.add) {
      const authObj: AuthorityModel = this.formStatus.getData();
      authObj.authEffectiveTime = CommonUtil.getTimeStamp(this.authEffectiveTime);
      authObj.authExpirationTime = CommonUtil.getTimeStamp(this.authExpirationTime);
      const effective_Time = authObj.authEffectiveTime;
      const expiration_Time = authObj.authExpirationTime;
      if (expiration_Time > 0 && effective_Time > 0 && expiration_Time < effective_Time) {
        this.$message.info(this.language.expirationTimeTips);
        this.isLoading = false;
      } else {
        authObj.userName = this.selectUserName;
        console.log(authObj);
        this.addUnifiedAuth(authObj);
      }
      // ??????
    } else if (this.pageType === OperateTypeEnum.update) {
      const authObj = this.formStatus.getData();
      authObj.id = this.authId;
      authObj.authEffectiveTime = this.authInfo['authEffectiveTime'];
      authObj.authExpirationTime = this.authInfo['authExpirationTime'];
      authObj.userName = this.selectUserName;
      const effectiveTime = authObj.authEffectiveTime;
      const expirationTime = authObj.authExpirationTime;
      if (expirationTime > 0 && effectiveTime > 0 && expirationTime < effectiveTime) {
        this.$message.info(this.language.expirationTimeTips);
        this.isLoading = false;
      } else {
        this.$applicationService.queryUnifyAuthById(this.authId).subscribe((res) => {
          if (res.code === 0) {
            this.updateUnifiedAuth(authObj);
          } else if (res.code === 120610) {
            this.isLoading = false;
            this.$message.info(this.language.AuthExistTips);
            this.$router.navigate(['/business/application/facility-authorization/unified-authorization']).then();
          }
        });
      }
    }

  }


  /**
   * ??????????????????
   * @param authObj ??????????????????
   */
  public addUnifiedAuth(authObj: AuthorityModel): void {
    this.$applicationService.addUnifyAuth(authObj).subscribe((res: ResultModel<object>) => {
      this.resultJudgment(res);
    });
  }

  /**
   *  ??????????????????
   * @param authObj ????????????
   */
  public updateUnifiedAuth(authObj: AuthorityModel): void {
    this.$applicationService.modifyUnifyAuth(authObj).subscribe((res: ResultModel<object>) => {
      this.resultJudgment(res);
    });
  }

  /**
   * ??????????????????????????????
   * @param authId ??????id
   */
  public queryAuthInfoById(authId: string): void {
    this.$applicationService.queryUnifyAuthById(authId).subscribe((res) => {
      const authInfo = res.data;
      this.selectedUserId = res.data.userId;
      this.authInfo = authInfo;
      if (res.data.authDeviceList.length > 0) {
        res.data.authDeviceList.forEach(item => {
          // ????????????id,????????????????????????-?????????????????????
          this.checkList.push(item.deviceId);
          // ???????????????id???????????????????????????-????????????????????????
          this.deviceAndDoorData.push({
            deviceId: item.deviceId,
            doorNum: item.doorNum
          });
        });
      }
      if (authInfo.authEffectiveTime) {
        this.authEffectiveTime = this.$dateHelper.format(new Date(authInfo.authEffectiveTime), DateFormatStringEnum.DATE_FORMAT_STRING);
      }
      if (authInfo.authExpirationTime) {
        this.authExpirationTime = this.$dateHelper.format(new Date(authInfo.authExpirationTime), DateFormatStringEnum.DATE_FORMAT_STRING);
      }
      this.formStatus.resetData(authInfo);
      this.selectUserName = authInfo.userName;
    });
  }

  /**
   * ?????????????????????????????????
   */
  public goBack(): void {
    this.$router.navigate(['/business/application/facility-authorization/unified-authorization']).then();
  }


  /**
   * ?????????????????????
   */
  public showUserListModal(): void {
    this.initUserTableConfig();
    for (const key in this.userQueryCondition.bizCondition) {
      if (this.userQueryCondition.bizCondition[key]) {
        // ????????????????????????
        delete this.userQueryCondition.bizCondition[key];
      }
    }
    if (this._selectedUserId) {
      this.selectedUserId = this._selectedUserId;
    }
    this.xcVisible = true;
    this.refreshUserData();
  }
  /**
   * ??????????????????
   */
  public handleOk(): void {
    this.selectUserName = this.userName;
    this.formStatus.resetControlData('userId', this.userId);
    this._selectedUserId = this.selectedUserId;
    this.xcVisible = false;
  }

  /**
   * ??????????????????
   */
  handleCancel(): void {
    this.selectedUserId = null;
    this._selectedUserId = null;
    this.selectUserName = null;
    this.xcVisible = false;
  }


  /**
   * ????????????????????????
   */
  public refreshUserData(): void {
    this.userTableConfig.isLoading = true;
    // ????????????id
    this.userQueryCondition.bizCondition.permissionId = permissionId;
    this.$userForCommonService.queryUserLists(this.userQueryCondition).subscribe((res: ResultModel<UserListModel[]>) => {
      this.userTableConfig.isLoading = false;
      if (res.code === ResultCodeEnum.success ) {
        this.userDataSet = res.data;
        this.userPageBean.Total = res.totalCount;
        this.userPageBean.pageIndex = res.pageNum;
        this.userPageBean.pageSize = res.size;
      } else {
        this.$message.error(res.msg);
      }
    }, () => {
      this.userTableConfig.isLoading = false;
    });

  }

  /**
   * ????????????????????????
   */
  public showFacilityListModal(): void {
    this.initFacilityTableConfig();
    if (!this.deviceId) {
      this.facilityQueryCondition.filterConditions = [];
    }
    if (this.deviceAndDoorData.length === 0) {
      this.checkList = [];
    }
    const modal = this.$modal.create({
      nzTitle: this.language.selectingFacilities,
      nzContent: this.facilityListTemp,
      nzOkText: this.language.cancel,
      nzCancelText: this.language.confirm,
      nzOkType: 'danger',
      nzClassName: 'custom-create-modal',
      nzWidth: '1000',
      nzFooter: [
        {
          label: this.language.confirm,
          onClick: () => {
            // ?????????????????????id
            this.concatParams = [];
            const deviceAndDoorParams = [];
            if (this.checkList.length > 0) {
              this.checkList.forEach(item => {
                if (item) {
                  deviceAndDoorParams.push({
                    deviceId: item
                  });
                }
              });
            }
            if (deviceAndDoorParams.length > 0 && this.deviceAndDoorData.length > 0) {
              for (let i = 0; i < deviceAndDoorParams.length; i++) {
                for (let t = 0; t < this.deviceAndDoorData.length; t++) {
                  if (deviceAndDoorParams[i]['deviceId'] === this.deviceAndDoorData[t]['deviceId']) {
                    deviceAndDoorParams.splice(i, 1);
                    i--;
                    break;
                  }
                }
              }
            }
            this.concatParams = this.deviceAndDoorData.concat(deviceAndDoorParams);
            this.formStatus.resetControlData('authDeviceList', this.concatParams);
            this.facilityQueryCondition.pageCondition.pageNum = 1;
            modal.destroy();
          }
        },
        {
          label: this.language.cancel,
          type: 'danger',
          onClick: () => {
            this.facilityDataSet = [];
            if (!this.deviceId) {
              this.deviceAndDoorData = [];
              this.checkList = [];
            }
            this.facilityQueryCondition.pageCondition.pageNum = 1;
            modal.destroy();
          }
        },
      ]
    });
    this.refreshFacilityData();
  }

  /**
   * ????????????
   */
  public checkOptions(item): void {
    this.deviceAndDoorData.push({
      deviceId: item.deviceId,
      doorNum: item.value
    });
    if (this.deviceAndDoorData.length > 1) {
      for (let i = 0; i < this.deviceAndDoorData.length; i++) {
        for (let j = i + 1; j < this.deviceAndDoorData.length; j++) {
          const iDeviceId = this.deviceAndDoorData[j].deviceId;
          const iDoorId = this.deviceAndDoorData[j].doorNum;
          if (this.deviceAndDoorData[i].deviceId === iDeviceId && this.deviceAndDoorData[i].doorNum === iDoorId) {
            this.deviceAndDoorData.splice(j, 1);
            this.deviceAndDoorData.splice(i, 1);
          }
        }
      }
    }
    // ????????????
    if (item && item.checked === true) {
      this.facilityDataSet.forEach(f => {
        if (f.deviceId === item.deviceId) {
          f.checked = true;
        }
      });
      // ????????????id
      this.checkList.push(item.deviceId);
    }
    // ???????????????
    if (item && item.checked === false) {
      this.facilityDataSet.forEach((items) => {
        if (items.deviceId === item.deviceId && items._lockList) {
          if (items._lockList.length >= 2) {
            if (items._lockList.every(e => e.checked === false)) {
              items.checked = false;
            }
          } else {
            items.checked = false;
          }
        }
      });

      for (let i = 0; i < this.checkList.length; i++) {
        if (this.checkList[i] === item.deviceId) {
          // ??????????????????id
          this.checkList.splice(i, 1);
        }
      }
    }
  }




  /**
   * ????????????????????????
   */
  public selectedUserChange(event, data): void {
    this.userName = data.userName;
    this.userId = data.id;
    this.selectUserName = data.userName;
    this.formStatus.resetControlData('userId', data.id);
  }
  /**
   * ???????????????
   */
  private initColumn(): void {
    this.formColumn = [
      {
        // ??????????????????
        label: this.language.name,
        key: 'name',
        type: 'input',
        require: true,
        rule: [{required: true}, {maxLength: 32},
          this.$ruleUtil.getNameRule()],
        customRules: [this.$ruleUtil.getNameCustomRule()],
        asyncRules: [
          this.$ruleUtil.getNameAsyncRule(value => this.$applicationService.queryAuthByName(
            {name: value}),
            res => {
              if (res['code'] === 0) {
                if (res.data.length === 0) {
                  return true;
                } else if (res.data[0].id === this.authId) {
                  return true;
                }
              } else {
                return false;
              }
            })
        ]
      },
      {
        // ???????????????
        label: this.language.user,
        key: 'userId',
        type: 'custom',
        template: this.userTemp,
        require: true,
        rule: [{required: true}],
        asyncRules: []
      },
      {
        // ??????????????????
        label: this.language.authEffectiveTime,
        key: 'authEffectiveTime',
        type: 'custom',
        template: this.effectiveTimeTemp,
        require: true,
        rule: [{required: true}],
        asyncRules: []
      },
      {
        // ??????????????????
        label: this.language.authExpirationTime,
        key: 'authExpirationTime',
        type: 'custom',
        template: this.expirationTimeTemp,
        require: true,
        rule: [{required: true}],
        asyncRules: []
      },
      {
        // ????????????
        label: this.language.authStatus,
        key: 'authStatus',
        type: 'radio',
        require: true,
        col: 24,
        radioInfo: {
          data: [
            {label: this.language.takeEffect, value: 2},
            {label: this.language.prohibit, value: 1},
          ],
          label: 'label',
          value: 'value'
        },
        rule: [{required: true}],
        asyncRules: []
      },
      {
        // ??????????????????
        label: this.language.unifiedAuthRange,
        key: 'authDeviceList',
        type: 'custom',
        template: this.authRangeTemp,
        require: true,
        rule: [{required: true}],
        asyncRules: []
      },
      {
        // ??????
        label: this.language.remark,
        key: 'remark',
        type: 'input',
        require: false,
        rule: [this.$ruleUtil.getRemarkMaxLengthRule()],
        customRules: [this.$ruleUtil.getNameCustomRule()],
      }
    ];
  }

  /**
   * ?????????????????????
   */
  private initUserTableConfig() {
    // ??????????????????
    this.userTableConfig = {
      isDraggable: true,
      isLoading: true,
      showSearchSwitch: true,
      showSizeChanger: true,
      scroll: {x: '1400px', y: '340px'},
      noIndex: true,
      showSearchExport: false,
      notShowPrint: true,
      columnConfig: [
        {
          title: '',
          type: 'render',
          renderTemplate: this.radioTemp,
          fixedStyle: {fixedLeft: true, style: {left: '0px'}}, width: 42
        },
        {
          // ??????
          type: 'serial-number', width: 62, title: this.userLanguage.serialNumber,
        },
        {
          // ??????
          title: this.userLanguage.userCode, key: 'userCode', width: 150, isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'},
        },
        {
          // ??????
          title: this.userLanguage.userName, key: 'userName', width: 150, isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ??????
          title: this.userLanguage.userNickname, key: 'userNickname', width: 150, isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        // ??????/??????
        {
          title: this.language.unit, key: 'department', width: 200, configurable: true,
          searchKey: 'departmentNameList',
          searchable: true,
          searchConfig: {type: 'render', renderTemplate: this.unitNameSearch},
          type: 'render',
          renderTemplate: this.departmentTemp
        },
        {
          // ??????
          title: this.userLanguage.address, key: 'address', width: 150, isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ??????
          title: this.userLanguage.email, key: 'email', width: 150, isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ??????????????????IP
          title: this.userLanguage.lastLoginIp, key: 'lastLoginIp', width: 150, isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ???????????????
          title: this.userLanguage.maxUsers, key: 'maxUsers', width: 120, isShowSort: true
        },
        {
          // ??????
          title: this.userLanguage.userDesc, key: 'userDesc', width: 150, isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ??????
          title: this.userLanguage.operate, searchable: true,
          searchConfig: {type: 'operate'}, key: '', width: 100, fixedStyle: {fixedRight: true, style: {right: '0px'}}
        }
      ],
      showPagination: true,
      bordered: false,
      showSearch: false,
      searchReturnType: 'Array',
      // ????????????
      sort: (event: SortCondition) => {
        const obj = {
          sortProperties: event.sortField,
          sort: event.sortRule
        };
        this.userQueryCondition.bizCondition = Object.assign(this.filterObject, obj);
        this.refreshUserData();
      },
      // ??????
      handleSearch: (event: FilterCondition[]) => {
        const obj = {};
        event.forEach(item => {
          obj[item.filterField] = item.filterValue;
        });
        if (event.length === 0) {
          this.selectUnitName = '';
        }
        // ???????????????
        this.userQueryCondition.pageCondition.pageNum = 1;
        this.filterObject = obj;
        this.userQueryCondition.bizCondition = Object.assign(this.filterObject, obj);
        this.refreshUserData();
      }
    };
  }
  /**
   * ???????????????????????????
   */
  public showModal(filterValue) {
    if (!this.selectUnitName) {
      FacilityForCommonUtil.setTreeNodesStatus(this.treeNodes, []);
    }
    this.filterValue = filterValue;
    if (!this.filterValue.filterValue) {
      this.filterValue.filterValue = [];
    }
    this.treeSelectorConfig.treeNodes = this.treeNodes;
    this.isVisible = true;

  }

  /**
   * ????????????????????????
   * param event
   */
  public selectDataChange(event) {
    let selectArr = [];
    let selectNameArr = [];
    this.selectUnitName = '';
    if (event.length > 0) {
      selectArr = event.map(item => {
        this.selectUnitName += `${item.deptName},`;
        return item.id;
      });
      selectNameArr = event.map(item => {
        return item.deptName;
      });
    }
    this.selectUnitName = this.selectUnitName.substring(0, this.selectUnitName.length - 1);
    if (selectArr.length === 0) {
      this.filterValue.filterValue = null;
    } else {
      this.filterValue.filterValue = selectNameArr;
    }
    FacilityForCommonUtil.setTreeNodesStatus(this.treeNodes, selectArr);
  }
  /**
   * ??????????????????????????????
   */
  public initTreeSelectorConfig() {
    this.treeSetting = {
      check: {
        enable: true,
        chkStyle: 'checkbox',
        chkboxType: {'Y': '', 'N': ''},
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
    };
    this.treeSelectorConfig = {
      title: `${this.facilityLanguage.selectUnit}`,
      width: '1000px',
      height: '300px',
      treeNodes: this.treeNodes,
      treeSetting: this.treeSetting,
      onlyLeaves: false,
      selectedColumn: [
        {
          title: this.facilityLanguage.deptName, key: 'deptName', width: 100,
        },
        {
          title: this.facilityLanguage.deptLevel, key: 'deptLevel', width: 100,
        },
        {
          title: this.facilityLanguage.parentDept, key: 'parentDepartmentName', width: 100,
        }
      ]
    };
  }

  /**
   * ?????????????????????
   */
  public queryDeptList() {
    this.$userForCommonService.queryAllDepartment().subscribe((result: ResultModel<any>) => {
      this.treeNodes = result.data || [];
    });
  }

  /**
   * ????????????????????????
   */
  private initFacilityTableConfig() {
    // ??????????????????
    this.facilityTableConfig = {
      isDraggable: true,
      isLoading: true,
      showSearchSwitch: true,
      showSizeChanger: true,
      scroll: {x: '1304px', y: '340px'},
      noIndex: true,
      showSearchExport: false,
      notShowPrint: true,
      columnConfig: [
        {
          type: 'select',
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
          width: 62
        },
        {
          // ??????
          type: 'serial-number', width: 62, title: this.language.serialNumber,
          fixedStyle: {fixedLeft: true, style: {left: '62px'}}
        },
        {
          // ??????
          title: this.facilityLanguage.deviceName, key: 'deviceName', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'},
          fixedStyle: {fixedLeft: true, style: {left: '124px'}}
        },
        {
          // ??????
          title: this.facilityLanguage.deviceType, key: 'deviceType', width: 200,
          type: 'render',
          renderTemplate: this.deviceTypeTemp,
          searchable: true,
          isShowSort: true,
          searchConfig: {
            type: 'select',
            selectType: 'multiple',
            selectInfo: this.deviceTypeCanSeeList,
            label: 'label',
            value: 'code'
          }
        },
        {
          // ??????
          title: this.language.lockList, key: '_lockList', width: 340,
          type: 'render',
          minWidth: 340,
          renderTemplate: this.doorLocksTemp
        },
        {
          // ??????
          title: this.facilityLanguage.deviceStatus, key: 'deviceStatus', width: 120,
          type: 'render',
          renderTemplate: this.deviceStatusTemp,
          isShowSort: true,
          searchable: true,
          minWidth: 80,
          searchConfig: {
            type: 'select',
            selectType: 'multiple',
            selectInfo: CommonUtil.codeTranslate(DeviceStatusEnum, this.$nzI18n),
            label: 'label',
            value: 'code'
          }
        },
        {
          // ????????????
          title: this.facilityLanguage.deviceCode, key: 'deviceCode', width: 200,
          searchable: true,
          isShowSort: true,
          searchConfig: {type: 'input'}
        },
        {
          // ????????????
          title: this.facilityLanguage.parentId, key: 'areaName', width: 200,
          searchable: true,
          isShowSort: true,
          searchConfig: {type: 'input'}
        },
        {
          // // ????????????
          title: this.facilityLanguage.deployStatus, key: 'deployStatus', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {
            type: 'select',
            selectType: 'multiple',
            selectInfo: CommonUtil.codeTranslate(DeployStatusEnum, this.$nzI18n, null, LanguageEnum.facility),
            label: 'label',
            value: 'code'
          }
        },
        {
          // ??????
          title: this.facilityLanguage.remarks, key: 'remarks', width: 100,
          searchable: true,
          isShowSort: true,
          searchConfig: {type: 'input'}
        },
        {
          // ??????
          title: this.language.operate, searchable: true,
          searchConfig: {type: 'operate'},
          key: '',
          width: 100,
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      showPagination: true,
      bordered: false,
      showSearch: false,
      sort: (event: SortCondition) => {
        this.facilityQueryCondition.sortCondition.sortField = event.sortField;
        this.facilityQueryCondition.sortCondition.sortRule = event.sortRule;
        this.refreshFacilityData();
      },
      handleSearch: (event) => {
        if (event.length === 0) {
          // ???????????????
          this.deviceAndDoorData = [];
          this.checkList = [];
          // ??????????????????????????????
          this.formStatus.group.controls['authDeviceList'].reset(null);
        }
        this.facilityQueryCondition.pageCondition.pageNum = 1;
        this.facilityQueryCondition.filterConditions = event;
        this.refreshFacilityData();
      },
      handleSelect: (event, currentItem) => {
        this.checkedListData = [];
        // ?????????????????????
        if (event.length > 0 && ((currentItem && currentItem.checked === true) || (!currentItem))) {
          event.forEach(item => {
            if (item && item.checked === true) {
              this.checkedListData.push(item.deviceId);
              this.checkList = Array.from(new Set(this.checkedListData));
              if (item._lockList && item._lockList.length > 0) {
                item._lockList.forEach(i => {
                  if (item.deviceId === i.deviceId) {
                    i.checked = true;
                    this.deviceAndDoorData.push({
                      deviceId: i.deviceId,
                      doorNum: i.value
                    });
                    this.deviceAndDoorData = UserForCommonUtil.unique(this.deviceAndDoorData); // ??????
                    console.log(this.deviceAndDoorData, '22222');
                  }
                });
              }
            }
          });
        }

        // ??????????????????
        if (currentItem && currentItem.checked === false) {
          if (currentItem._lockList && currentItem._lockList.length > 0) {
            currentItem._lockList.forEach(item => {
              item.checked = false;
              this.deviceAndDoorData = this.deviceAndDoorData.filter(e => e.deviceId !== item.deviceId);
            });
          }

          // ??????????????????????????????id
          if (this.checkList.includes(currentItem.deviceId)) {
            this.checkList.forEach(item => {
              if (item === currentItem.deviceId) {
                this.checkList = this.checkList.filter(e => e !== item);
              }
            });
          }
        }

        // ??????????????????
        if (event.length === 0 && this.deviceAndDoorData.length > 0) {
          if (this.facilityDataSet && this.facilityDataSet.length > 0) {
            const deviceIdData = [];
            this.facilityDataSet.forEach(item => {
              deviceIdData.push(item.deviceId);
              if (item._lockList && item._lockList.length > 0) {
                item._lockList.forEach(i => {
                  i.checked = false;
                });
                this.deviceAndDoorData = this.deviceAndDoorData.filter(e => e.deviceId !== item.deviceId);
              }
            });
            // ????????????????????????????????????id
            if (deviceIdData.length > 0) {
              deviceIdData.forEach(d => {
                this.checkList = this.checkList.filter(e => e !== d);

              });
            }
          }
        }
      }
    };

  }
  /**
   * ?????????????????? ??????/??????
   * @param pageType ??????/??????
   */
  private getPageTitle(pageType: string): string {
    let title;
    switch (pageType) {
      case OperateTypeEnum.add:
        title = `${this.language.add}${this.language.unifiedAuthorization}`;
        break;
      case OperateTypeEnum.update:
        title = `${this.language.modify}${this.language.unifiedAuthorization}`;
        break;
    }
    return title;
  }
  /**
   * ??????????????????
   */
  private resultJudgment(res: ResultModel<object>): void {
    this.isLoading = false;
    if (res.code === 0) {
      this.$message.success(res.msg);
      this.$router.navigate(['/business/application/facility-authorization/unified-authorization']).then();
    } else if (res.code === 120340) {
      this.$message.info(res.msg);
    } else if (res.code === 120350) {
      this.$message.info(res.msg);
    } else if (res.code === 125505) {
      this.$message.info(res.msg);
    } else {
      this.$message.error(res.msg);
    }
  }


  /**
   * ????????????????????????
   */
  private refreshFacilityData(): void {
    this.facilityTableConfig.isLoading = true;
    this.$applicationService.deviceListOfLockByPage(this.facilityQueryCondition).subscribe((result: ResultModel<FacilityListModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        this.facilityPageBean.Total = result.totalCount;
        this.facilityPageBean.pageIndex = result.pageNum;
        this.facilityPageBean.pageSize = result.size;
        this.facilityTableConfig.isLoading = false;
        this.facilityDataSet = result.data || [];
        this.facilityDataSet.forEach(item => {
          item.areaName = item.areaInfo ? item.areaInfo.areaName : '';
          item['_deviceType'] = item.deviceType as DeviceTypeEnum;
          // ??????
          item._lockList = AuthorizationUtil.getLockList(item.lockList, this.$nzI18n, item._deviceType);
          item['_deviceStatus'] = item.deviceStatus;
          item.deviceType = CommonUtil.codeTranslate(DeviceTypeEnum, this.$nzI18n, item.deviceType) as DeviceTypeEnum;
          item.deviceStatus = CommonUtil.codeTranslate(DeviceStatusEnum, this.$nzI18n, item.deviceStatus)as DeviceStatusEnum;
          item.deployStatus = CommonUtil.codeTranslate(DeployStatusEnum, this.$nzI18n, item.deployStatus, 'facility') as DeployStatusEnum;
          item['iconClass'] = CommonUtil.getFacilityIconClassName(item._deviceType);
          item['deviceStatusIconClass'] = CommonUtil.getDeviceStatusIconClass(item._deviceStatus).iconClass;
          item['deviceStatusColorClass'] = CommonUtil.getDeviceStatusIconClass(item._deviceStatus).colorClass;

          setTimeout(() => {
            if (this.deviceAndDoorData.length > 0 && item._lockList && item._lockList.length > 0) {
              for (let i = 0; i < this.deviceAndDoorData.length; i++) {
                const iDeviceId = this.deviceAndDoorData[i].deviceId;
                const iDoorId = this.deviceAndDoorData[i].doorNum;
                for (let t = 0; t < item._lockList.length; t++) {
                  if (iDeviceId === item._lockList[t].deviceId && iDoorId === item._lockList[t].value) {
                    // ???????????????????????????????????????
                    item.checked = true;
                    item._lockList[t].checked = true;
                  }
                }
              }
            }
          }, 0);
        });
      } else {
        this.facilityTableConfig.isLoading = false;
        this.$message.error(result.msg);
      }

    }, () => {
      this.facilityTableConfig.isLoading = false;
    });
  }


}
