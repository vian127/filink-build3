import {NzI18nService, NzTreeNode} from 'ng-zorro-antd';
import {UserService} from '../../service/user.service';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UserUtilService} from '../../service/user-util.service';
import {RuleUtil} from '../../../../../shared-module/util/rule-util';
import {UserLanguageInterface} from '../../../../../../assets/i18n/user/user-language.interface';
import {OperateTypeEnum} from '../../../../../shared-module/enum/page-operate-type.enum';
import {SessionUtil} from '../../../../../shared-module/util/session-util';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {UserTypeEnum} from '../../enum/user-type.enum';
import {ResultCodeEnum} from '../../../../../shared-module/enum/result-code.enum';
import {UserStatusEnum} from '../../enum/user-status.enum';
import {LoginTypeEnum} from '../../enum/login-type.enum';
import {FormItem} from '../../../../../shared-module/component/form/form-config';
import {FilterCondition, QueryConditionModel} from '../../../../../shared-module/model/query-condition.model';
import {OperatorEnum} from '../../../../../shared-module/enum/operator.enum';
import {FormOperate} from '../../../../../shared-module/component/form/form-operate.service';
import {TreeSelectorConfigModel} from '../../../../../shared-module/model/tree-selector-config.model';
import {DateTypeEnum} from '../../../../../shared-module/enum/date-type.enum';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {OrderUserModel} from '../../../../../core-module/model/work-order/order-user.model';
import {UserListModel} from '../../../../../core-module/model/user/user-list.model';
import {DepartmentListModel} from '../../model/department-list.model';
import {RoleListModel} from '../../../../../core-module/model/user/role-list.model';
import {PushTypeEnum} from '../../enum/push-type.enum';
import {CheckboxModel} from '../../../../../shared-module/model/checkbox-model';
import {CommonLanguageInterface} from '../../../../../../assets/i18n/common/common.language.interface';
import {UserForCommonService} from '../../../../../core-module/api-service';
import {debounceTime, distinctUntilChanged, first, mergeMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {FormControl} from '@angular/forms';
/**
 * ????????????????????????ts
 */
export class MixinTemplateUserEdit {
  // ????????????
  public selectUnitName: string = '';
  // ????????????
  public userInfo: OrderUserModel = {};
  // ???????????????
  public language: UserLanguageInterface;
  // ????????????
  public pageType = OperateTypeEnum.add;
  // ????????????title
  public pageTitle: string;
  // ???????????????
  public accountMinLength: number;
  // ????????????
  public roleList: { label: string, value: string }[] = [];
  // ???????????????
  public treeNodes: NzTreeNode[] = [];
  // ???????????????????????????
  public formColumn: FormItem[] = [];
  // ????????????
  public formStatus: FormOperate;
  // ??????????????????
  public checkedMail: boolean = true;
  // ??????????????????
  public checkedNote: boolean = true;
  // ???????????????id
  public userId: string = '';
  // ?????????????????????
  public areaSelectorConfig: TreeSelectorConfigModel = new TreeSelectorConfigModel();
  public userDisable: string;
  // ??????????????????
  public areaSelectVisible: boolean = false;
  // ????????????
  public timeType: string = DateTypeEnum.day;
  // ?????????????????????
  public pushTypeCheckbox: CheckboxModel[] = [];
  // ????????????
  public checkUserName: string = '';
  // ???????????????
  public commonLanguage: CommonLanguageInterface;

  constructor(
    public $nzI18n: NzI18nService,
    public $userService: UserService,
    public $userForCommonService: UserForCommonService,
    public $message: FiLinkModalService,
    public $active: ActivatedRoute,
    public $router: Router,
    public $userUtilService: UserUtilService,
    public $ruleUtil: RuleUtil
  ) {
  }

  public initPage(accountLimitTemp, departmentTep, telephoneTemp, phoneNumberRules): void {
    // ????????????????????????
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.user);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.pushTypeCheckbox = [
      {label: this.language.mail, value: PushTypeEnum.mail, checked: true},
      {label: this.language.note, value: PushTypeEnum.note, checked: true},
      {label: 'app', value: PushTypeEnum.app, checked: true},
      {label: 'web', value: PushTypeEnum.web, checked: true},
    ];
    this.$active.params.subscribe(params => {
      this.pageType = params.type;
    });
    // ??????????????????
    this.pageTitle = this.getPageTitle(this.pageType);
    // ??????????????????
    this.queryAllRoles();
    // ???????????????
    this.$active.queryParams.subscribe(params => {
      if (this.pageType === OperateTypeEnum.add) {
        // ??????????????????????????????
        this.accountMinLength = Number(params.minLength);
      } else {
        // ????????????id
        this.userId = params.id;
        this.$userService.queryUserInfoById(params.id).subscribe((res: ResultModel<UserListModel>) => {
          // ????????????????????????
          this.userDisable = res.data.loginType;
        });
      }
    });
    this.initForm(accountLimitTemp, departmentTep, telephoneTemp, phoneNumberRules);
  }


  public formInstance(event: { instance: FormOperate }): void {
    this.formStatus = event.instance;
  }

  /**
   * ??????????????????
   * param event
   */
  public areaSelectChange(event: DepartmentListModel[]): void {
    this.userInfo.deptId = event[0].id;
    if (event[0]) {
      this.$userUtilService.setAreaNodesStatus(this.treeNodes, event[0].id);
      this.selectUnitName = event[0].deptName;
      this.formStatus.resetControlData('deptId', this.userInfo.deptId);
    } else {
      // ????????????
      this.$userUtilService.setAreaNodesStatus(this.treeNodes, null);
      this.selectUnitName = '';
      this.formStatus.resetControlData('deptId', null);
    }
  }

  /**
   * ??????????????????
   */
  public getPageTitle(type: string): string {
    let title;
    switch (type) {
      case OperateTypeEnum.add:
        title = `${this.language.addUser} ${this.language.user}`;
        break;
      case OperateTypeEnum.update:
        title = `${this.language.update} ${this.language.user}`;
        break;
    }
    return title;
  }

  /**
   * ??????????????????
   */
  public queryAllRoles(): void {
    const userInfo = SessionUtil.getUserInfo();
    this.$userForCommonService.queryAllRoles().subscribe((res: ResultModel<RoleListModel[]>) => {
      const roleArray = res.data;
      if (roleArray) {
        if (userInfo.userCode === UserTypeEnum.admin) {
          roleArray.forEach(item => {
            // ????????????????????????
            this.roleList.push({label: item.roleName, value: item.id});
          });
        } else {
          // ???admin???????????????????????????????????????
          const _roleArray = roleArray.filter(item => item.id !== UserTypeEnum.superAdmin);
          _roleArray.forEach(item => {
            // ????????????????????????
            this.roleList.push({label: item.roleName, value: item.id});
          });
        }
      }
    });
  }

  /**
   * ??????????????????
   */
  public getDept() {
    return new Promise((resolve, reject) => {
      this.$userUtilService.getDept().then((data: any) => {
        this.treeNodes = data || [];
        this.initAreaSelectorConfig(data);
        resolve();
      });
    });
  }

  /**
   * ???????????????????????????
   */
  public initAreaSelectorConfig(nodes: NzTreeNode[]): void {
    this.areaSelectorConfig = {
      width: '500px',
      height: '300px',
      title: this.language.departmentSelect,
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
      treeNodes: nodes
    };
  }

  /**
   * ????????????????????????????????????params
   */
  public getCheckParams(filterField: string, value: any): QueryConditionModel {
    const params = new QueryConditionModel;
    params.filterConditions[0] = new FilterCondition(filterField, OperatorEnum.eq, value);
    return params;
  }

  /**
   * ????????????
   */
  public getStatusForEdit(res: ResultModel<UserListModel[]>): boolean {
    if (res.code === 0) {
      if (res.data.length === 0) {
        return true;
      } else if (res.data.length > 0) {
        return res.data[0].id === this.userId;
      }
    } else {
      return false;
    }
  }

  /**
   * ????????????
   */
  public getStatusForAdd(res: ResultModel<UserListModel[]>): boolean {
    if (res.code === 0) {
      if (res.data.length === 0) {
        return true;
      } else if (res.data.length > 0) {
        return false;
      }
    } else {
      return false;
    }
  }

  public checkStatus(res: ResultModel<UserListModel[]>): boolean {
    if (this.pageType === OperateTypeEnum.add) {
      return this.getStatusForAdd(res);
    } else {
      return this.getStatusForEdit(res);
    }
  }

  /**
   * ?????????????????????
   */
  public showDeptSelectorModal(): void {
    this.areaSelectorConfig.treeNodes = this.treeNodes;
    this.areaSelectVisible = true;
  }

  /**
   * ????????????
   */
  public initForm(accountLimitTemp, departmentTep, telephoneTemp, phoneNumberRules): void {
    this.formColumn = [
      {
        // ??????
        label: this.language.userCode,
        key: 'userCode',
        type: 'input',
        disabled: this.pageType !== OperateTypeEnum.add,
        require: true,
        rule: [
          {required: true},
          {minLength: this.accountMinLength},
          {maxLength: 32},
          this.$ruleUtil.getNameRule()],
        // ?????????????????????
        customRules: [this.$ruleUtil.getNameCustomRule()],
        // ??????????????????
        asyncRules: [
          this.$ruleUtil.getNameAsyncRule(value => this.$userService.verifyUserInfo(
            this.getCheckParams('userCode', value)
            ),
            res => {
              // ??????????????????
              return this.checkStatus(res);
            })
        ],
      },
      {
        // ??????
        label: this.language.userName,
        key: 'userName',
        type: 'input',
        require: true,
        rule: [{required: true}, {maxLength: 32},
          this.$ruleUtil.getNameRule()],
        customRules: [this.$ruleUtil.getNameCustomRule(), {
          code: 'duplicateSystemAdd',
          msg: this.language.duplicateSystemAdd,
          validator: () => null
        }],
        asyncRules: [
          {
            asyncRule: (control: FormControl) => {
              if (control.value) {
                return control.valueChanges.pipe(
                  distinctUntilChanged(),
                  debounceTime(1000),
                  mergeMap(() => this.$userForCommonService.checkUserNameExist({userName: control.value.trim(), id: this.userId})),
                  mergeMap(res => {
                    if (res.code === ResultCodeEnum.success) {
                      if (res.data === 1) {
                        return of({error: true, duplicateUsernameAdd: true});
                      } else if (res.data === 2) {
                        return of({error: true, duplicateSystemAdd: true});
                      } else {
                        return of(null);
                      }
                    }
                  }),
                  first()
                );
              } else {
                return of(null);
              }
            },
            asyncCode: 'duplicateUsernameAdd', msg: this.language.duplicateUsernameAdd
          },
        ]
      },
      {
        // ??????
        label: this.language.userNickname,
        key: 'userNickname',
        type: 'input',
        require: false,
        rule: [{maxLength: 32},
          this.$ruleUtil.getNameRule()],
        customRules: [this.$ruleUtil.getNameCustomRule()],
        asyncRules: []
      },
      {
        // ????????????
        label: this.language.userStatus,
        key: 'userStatus',
        type: 'radio',
        require: true,
        rule: [{required: true}],
        initialValue: UserStatusEnum.enable,
        radioInfo: {
          data: [
            // ??????
            {label: this.language.enable, value: UserStatusEnum.enable},
            // ??????
            {label: this.language.disable, value: UserStatusEnum.disable},
          ],
          label: 'label',
          value: 'value'
        }
      },
      {
        // ??????
        label: this.language.deptId,
        key: 'deptId',
        type: 'custom',
        require: true,
        rule: [{required: true}],
        asyncRules: [],
        template: departmentTep
      },
      {
        // ??????
        label: this.language.roleId,
        key: 'roleId',
        type: 'select',
        require: true,
        rule: [{required: true}],
        asyncRules: [],
        selectInfo: {
          data: this.roleList,
          label: 'label',
          value: 'value'
        }
      },
      {
        // ??????
        label: this.language.address,
        key: 'address',
        type: 'input',
        require: false,
        rule: [{maxLength: 64}],
        asyncRules: []
      },
      {
        // ?????????
        label: this.language.phoneNumber,
        key: 'phoneNumber',
        type: 'custom',
        require: true,
        col: 24,
        rule: [
          {required: true}
        ],
        asyncRules: phoneNumberRules,
        template: telephoneTemp
      },
      {
        // ??????
        label: this.language.email,
        key: 'email',
        type: 'input',
        require: true,
        rule: [
          {required: true},
          {maxLength: 32},
          this.$ruleUtil.getMailRule()],
        // ??????????????????
        asyncRules: [
          this.$ruleUtil.getNameAsyncRule(value => this.$userForCommonService.verifyUserInfo(
            this.getCheckParams('email', value)
            ),
            res => {
              // ??????????????????
              return this.checkStatus(res);
            }, this.commonLanguage.emailExists)
        ]
      },
      {
        // ????????????
        label: this.language.pushType,
        key: 'pushType',
        type: 'checkbox',
        require: false,
        rule: [],
        asyncRules: [],
        initialValue: this.pushTypeCheckbox
      },
      {
        // ???????????????
        label: this.language.countValidityTime,
        key: 'countValidityTime',
        type: 'custom',
        require: false,
        col: 24,
        rule: [{max: 999, msg: this.language.pleaseEnterAnIntegerLessThan999},
          this.$ruleUtil.positiveInteger()],
        customRules: [],
        asyncRules: [],
        template: accountLimitTemp
      },
      {
        // ????????????
        label: this.language.loginType,
        key: 'loginType',
        type: 'radio',
        require: true,
        rule: [{required: true}],
        initialValue: LoginTypeEnum.singleUser,
        radioInfo: {
          data: [
            // ?????????
            {label: this.language.singleUser, value: LoginTypeEnum.singleUser},
            // ?????????
            {label: this.language.multiUser, value: LoginTypeEnum.multiUser},
          ],
          label: 'label',
          value: 'value'
        },
        modelChange: (controls, event, key, formOperate) => {
          if (event === '1') {
            this.formStatus.group.controls['maxUsers'].disable();
            this.formStatus.resetControlData('maxUsers', 1);
          } else {
            this.formStatus.group.controls['maxUsers'].enable();
            this.formStatus.resetControlData('maxUsers', 100);
          }
        }
      },
      {
        // ???????????????
        label: this.language.maxUsers,
        key: 'maxUsers',
        type: 'input',
        require: false,
        initialValue: 1,
        rule: [
          {pattern: /^([2-9]|[1-9]\d|2|100)$/, msg: this.language.maxUsersTips},
        ],
        asyncRules: []
      },
      {
        // ??????
        label: this.language.userDesc,
        key: 'userDesc',
        type: 'input',
        require: false,
        rule: [this.$ruleUtil.getRemarkMaxLengthRule()],
        customRules: [this.$ruleUtil.getNameCustomRule()],
      },
    ];
    if (this.pageType === OperateTypeEnum.add) {
      setTimeout(() => {
        this.formStatus.group.controls['maxUsers'].disable();
      }, 0);
    } else {
      setTimeout(() => {
        if (this.userDisable === LoginTypeEnum.singleUser) {
          this.formStatus.group.controls['maxUsers'].disable();
        } else {
          this.formStatus.group.controls['maxUsers'].enable();
        }
      }, 380);
    }
  }

  /**
   * ???????????????????????? ?????????????????????????????????????????????????????????
   */
  public subObjDeal(userObj: UserListModel): UserListModel {
    if (userObj.countValidityTime) {
      if (this.timeType === DateTypeEnum.year) {
        userObj.countValidityTime = userObj.countValidityTime + 'y';
      } else if (this.timeType === DateTypeEnum.month) {
        userObj.countValidityTime = userObj.countValidityTime + 'm';
      } else if (this.timeType === DateTypeEnum.day) {
        userObj.countValidityTime = userObj.countValidityTime + 'd';
      }
    }
    // ?????????????????????????????????
    if (this.formStatus.getData('pushType').length) {
      const pushType = [];
      this.formStatus.getData('pushType').forEach(item => {
        if (item.checked) {
          pushType.push(item.value);
        }
      });
      userObj.pushType = pushType.join(',');
    }
    return userObj;
  }

  /**
   * ??????disabled????????????
   */
  public getButtonStatus(): boolean {
    return !this.formStatus.getValid();
  }

}
