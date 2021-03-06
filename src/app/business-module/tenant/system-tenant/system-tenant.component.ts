import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {PageModel} from '../../../shared-module/model/page.model';
import {Operation, TableConfigModel} from '../../../shared-module/model/table-config.model';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../shared-module/model/query-condition.model';
import {FiLinkModalService} from '../../../shared-module/service/filink-modal/filink-modal.service';
import {TenantLanguageInterface} from '../../../../assets/i18n/tenant/tenant.language.interface';
import {DateHelperService, NzI18nService, NzModalService} from 'ng-zorro-antd';
import {LanguageEnum} from '../../../shared-module/enum/language.enum';
import {Router} from '@angular/router';
import {TableComponent} from '../../../shared-module/component/table/table.component';
import {TenantApiService} from '../share/sevice/tenant-api.service';
import {Result} from '../../../shared-module/entity/result';
import {ResultModel} from '../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../shared-module/enum/result-code.enum';
import {UserForCommonService} from '../../../core-module/api-service/user';
import {CommonLanguageInterface} from '../../../../assets/i18n/common/common.language.interface';
import {LoginTypeEnum, PushTypeEnum, UserStatusEnum} from '../../../shared-module/enum/user.enum';
import {TreeSelectorConfigModel} from '../../../shared-module/model/tree-selector-config.model';
import {DepartmentUnitModel} from '../../../core-module/model/work-order/department-unit.model';
import {FacilityForCommonUtil} from '../../../core-module/business-util/facility/facility-for-common.util';
import {OperatorEnum} from '../../../shared-module/enum/operator.enum';
import {RoleListModel} from '../../../core-module/model/user/role-list.model';
import {FacilityLanguageInterface} from '../../../../assets/i18n/facility/facility.language.interface';
import {FilterValueModel} from '../../../core-module/model/work-order/filter-value.model';
import {TenantModel} from '../share/model/tenant.model';
import {DateFormatStringEnum} from '../../../shared-module/enum/date-format-string.enum';
import {UserListModel} from '../../../core-module/model/user/user-list.model';
import {ExportRequestModel} from '../../../shared-module/model/export-request.model';


@Component({
  selector: 'app-system-tenant',
  templateUrl: './system-tenant.component.html',
  styleUrls: ['./system-tenant.component.scss']
})
export class SystemTenantComponent implements OnInit {

  // ????????????
  @ViewChild('tableComponent') tableComponent: TableComponent;
  // ????????????
  @ViewChild('TenantStatusTemp') TenantStatusTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('userStatusTemp') userStatusTemp: TemplateRef<any>;
  // ???????????????
  @ViewChild('roleTemp') private roleTemp: TemplateRef<any>;
  // ?????????????????????????????????
  @ViewChild('unitNameSearch') private unitNameSearch: TemplateRef<any>;
  // ??????????????????
  @ViewChild('departmentTemp') private departmentTemp: TemplateRef<any>;
  // ??????????????????
  @ViewChild('pushTypeTemp') private pushTypeTemp: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('loginTypeTemp') private loginTypeTemp: TemplateRef<any>;
  // ?????????
  public language: TenantLanguageInterface;
  // ?????????????????????
  public commonLanguage: CommonLanguageInterface;
  // ???????????????????????????
  public areaLanguage: FacilityLanguageInterface;
  // ??????????????????
  public dataSet = [];
  // ??????????????????
  public usersDataSet = [];
  // ??????????????????
  public pageBean: PageModel = new PageModel(10, 1, 1);
  // ??????????????????
  public usersPageBean: PageModel = new PageModel(10, 1, 1);
  // ????????????????????????
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // ????????????????????????
  public usersQueryCondition: QueryConditionModel = new QueryConditionModel();
  // ??????????????????
  public tableConfig: TableConfigModel = new TableConfigModel();
  // ??????????????????
  public usersTableConfig: TableConfigModel;
  // ????????????
  public defaultPassWord: string = '123456';
  // ???????????????????????????????????????????????????
  public isVisible: boolean = false;
  // ???????????????????????????????????????
  public userListVisible: boolean = false;
  // ????????????????????????
  private filterObject = {};
  // ??????ID
  public tenantID: string = '';
  // ?????????????????????
  public roleArray = [];
  // ??????????????????
  public pushTypeEnum = PushTypeEnum;
  // ??????????????????
  public loginTypeEnum = LoginTypeEnum;
  // ???????????????????????????
  public treeSelectorConfig: TreeSelectorConfigModel;
  // ????????????
  public filterValue: FilterValueModel;
  // ?????????????????????
  public treeNodes: DepartmentUnitModel[] = [];
  // ?????????????????????
  public selectUnitName: string;
  // ??????????????????
  public userStatusEnum = UserStatusEnum;
  // ???????????????
  public treeSetting = {};
  // ????????????????????????
  public deleteIndex: number = 0;


  constructor(
    public $tenantApiService: TenantApiService,
    public $router: Router,
    public $nzI18n: NzI18nService,
    public $nzModalService: NzModalService,
    public $message: FiLinkModalService,
    public $userForCommonService: UserForCommonService,
    public $dateHelper: DateHelperService,
    public modalService: NzModalService,
  ) {
  }


  public ngOnInit(): void {
    // ?????????
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.tenant);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.areaLanguage = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    // ????????????????????????
    this.tenantInitTableConfig();
    // ????????????????????????
    this.tenantRefreshData();
    // ????????????????????????
    this.userInitTableConfig();
    // ??????????????????
    this.initTreeSelectorConfig();
  }


  /**
   * ????????????????????????
   */
  public tenantRefreshData(): void {
    this.tableConfig.isLoading = true;
    this.$tenantApiService.queryTenantList(this.queryCondition).subscribe((res: ResultModel<TenantModel[]>) => {
      if (res.code === ResultCodeEnum.success) {
        this.tableConfig.isLoading = false;
        this.dataSet = res.data;
        this.pageBean.Total = res.totalCount;
        this.pageBean.pageIndex = res.pageNum;
        this.pageBean.pageSize = res.size;
      }
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * ????????????????????????
   */
  public userRefreshData(): void {
    this.usersTableConfig.isLoading = true;
    this.usersQueryCondition.bizCondition.tenantId = this.tenantID;
    this.$tenantApiService.queryUserListByTenantId(this.usersQueryCondition).subscribe((res: ResultModel<UserListModel[]>) => {
      if (res.code === ResultCodeEnum.success) {
        this.usersTableConfig.isLoading = false;
        this.usersDataSet = res.data;
        this.usersPageBean.Total = res.totalCount;
        this.usersPageBean.pageIndex = res.pageNum;
        this.usersPageBean.pageSize = res.size;
        this.usersDataSet.forEach(item => {
          // ?????????????????????
          if (item.countValidityTime && item.createTime) {
            const validTime = item.countValidityTime;
            const createTime = item.createTime;
            const endVal = validTime.charAt(validTime.length - 1);
            const fontVal = validTime.substring(0, validTime.length - 1);
            const now = new Date(createTime);
            if (endVal === 'y') {
              const year_date = now.setFullYear(now.getFullYear() + Number(fontVal));
              item.countValidityTime = this.$dateHelper.format(new Date(year_date), DateFormatStringEnum.date);
            } else if (endVal === 'm') {
              const week_date = now.setMonth(now.getMonth() + Number(fontVal));
              item.countValidityTime = this.$dateHelper.format(new Date(week_date), DateFormatStringEnum.date);
            } else if (endVal === 'd') {
              const day_date = now.setDate(now.getDate() + Number(fontVal));
              item.countValidityTime = this.$dateHelper.format(new Date(day_date), DateFormatStringEnum.date);
            }
          }
        });
      }
    }, () => {
      this.usersTableConfig.isLoading = false;
    });
  }


  /**
   * ??????????????????
   */
  private tenantInitTableConfig(): void {
    this.tableConfig = {
      isDraggable: true,
      isLoading: true,
      outHeight: 108,
      showSizeChanger: true,
      showSearchSwitch: true,
      showPagination: true,
      notShowPrint: false,
      primaryKey: '16-1',
      scroll: {x: '1600px', y: '340px'},
      noIndex: true,
      showSearchExport: true,
      columnConfig: [
        { // ??????
          type: 'select',
          width: 62,
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
        },
        { // ??????
          type: 'serial-number',
          width: 62,
          title: '??????',
          fixedStyle: {fixedLeft: true, style: {left: '62px'}}
        },
        { // ????????????
          title: this.language.tenantName, key: 'tenantName', width: 150,
          isShowSort: true,
          configurable: false,
          searchable: true,
          searchConfig: {type: 'input'},
          fixedStyle: {fixedLeft: true, style: {left: '124px'}}
        },
        { // ??????
          title: this.language.tenantStatus, key: 'status', width: 120, isShowSort: true,
          searchable: true,
          configurable: true,
          type: 'render',
          minWidth: 80,
          renderTemplate: this.TenantStatusTemp,
          searchConfig: {
            type: 'select',
            selectInfo: [
              {label: this.language.disable, value: '0'},
              {label: this.language.enable, value: '1'}
            ]
          }
        },
        { // ??????
          title: this.language.phoneNumber, key: 'phoneNumber', width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ??????
          title: this.language.email, key: 'email', width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.language.address, key: 'address', width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ??????
          title: this.language.remark, key: 'remark', width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ??????
          title: this.language.operate,
          searchable: true,
          searchConfig: {type: 'operate'},
          key: '', width: 180,
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      topButtons: [
        { // ??????
          text: this.language.add,
          iconClassName: 'fiLink-add-no-circle',
          handle: () => {
            this.$router.navigate(['/business/tenant/system-tenant/add'], {
              queryParams: {type: 'add'}
            }).then();
          }
        },
        { // ????????????
          text: this.language.delete,
          btnType: 'danger',
          className: 'table-top-delete-btn',
          iconClassName: 'fiLink-delete',
          canDisabled: true,
          needConfirm: false,
          confirmContent: this.language.deleteMsg,
          handle: (event) => {
            const ids = event.map(item => item.id);
            if (ids) {
              // ??????????????????
              this.deleteIndex = 0;
              // ????????????
              this.deleteModel(ids);
            }
          }
        },
      ],
      operation: [
        { // ??????
          text: this.language.update, className: 'fiLink-edit', handle: (data) => {
            this.$router.navigate(['business/tenant/system-tenant/update'], {
              queryParams: {id: data.id, type: 'update'}
            }).then();
          },
        },
        { // ????????????
          text: this.language.receptionConfig, className: 'fiLink-peizhi', handle: (data) => {
            this.$router.navigate(['business/tenant/reception-config'], {
              queryParams: {id: data.id, roleId: data.roleId}
            }).then();
          },
        },
        { // ????????????
          text: this.language.userList, className: 'fiLink-filink-yonghu-icon', handle: (data) => {
            // ????????????????????????
            this.userInitTableConfig();
            // ????????????
            this.userListVisible = true;
            // ?????????????????????????????????
            this.tenantID = data.id;
            // ????????????????????????
            this.userRefreshData();
            // ??????????????????
            this.queryAllRoles();
            // ?????????????????????
            this.queryDeptList();
          },
        },
        { // ???????????????
          text: this.language.adminConfig, className: 'fiLink-filink-guanliyuan-icon', handle: (data) => {
            const body = {
              id: data.id
            };
            this.$tenantApiService.queryAdminById(body).subscribe((result: ResultModel<any>) => {
              if (result.code === ResultCodeEnum.success) {
                if (result.data.id !== null) {
                  this.$router.navigate(['business/tenant/tenant-admin-config/update'], {
                    queryParams: {id: data.id, type: 'update'}
                  }).then();
                } else {
                  this.modalService.warning({
                    nzTitle: this.language.addAdminMsg,
                    nzOkText: this.commonLanguage.cancel,
                    nzOkType: 'danger',
                    nzCancelText: this.commonLanguage.confirm,
                    nzMaskClosable: false,
                    nzOnCancel: () => {
                      this.$router.navigate(['business/tenant/tenant-admin-config/add'], {
                        queryParams: {id: data.id, type: 'add'}
                      }).then();
                    },
                    nzOnOk: () => {

                    }
                  });
                }
              } else {
                this.$message.error(result.msg);
              }
            });
          },
        },
        { // ????????????
          text: this.language.resetPassword,
          className: 'fiLink-password-reset',
          handle: (data) => {
            this.$nzModalService.confirm({
              nzTitle: this.language.resetPasswordTitle,
              nzContent: this.language.resetPasswordContent + this.defaultPassWord,
              nzMaskClosable: false,
              nzOkText: this.language.cancelText,
              nzCancelText: this.language.okText,
              nzOkType: 'danger',
              nzOnOk: () => {
              },
              nzOnCancel: () => {
                const body = {
                  id: data.id
                };
                this.$tenantApiService.resetAdminPWD(body).subscribe((result: ResultModel<any>) => {
                  if (result.code === ResultCodeEnum.success) {
                    this.$message.success(this.language.resetSuccessTips);
                  } else {
                    this.$message.error(result.msg);
                  }
                });
              }
            });
          },
        },
        { // ??????
          text: this.language.delete,
          className: 'fiLink-delete red-icon',
          btnType: 'danger',
          iconClassName: 'fiLink-delete',
          needConfirm: false,
          canDisabled: false,
          confirmContent: this.language.deleteMsg,
          handle: (event) => {
            const ids = event.id;
            // ??????????????????
            this.deleteIndex = 0;
            if (ids) {
              // ????????????
              this.deleteModel([ids]);
            }
          }
        },
      ],
      moreButtons: this.initLeftBottomButton(),
      handleExport: (event) => {
        // ????????????
        const body = {
          queryCondition: this.queryCondition,
          columnInfoList: event.columnInfoList,
          excelType: event.excelType
        };
        if (event.selectItem.length > 0) {
          event.queryTerm['id'] = event.selectItem.map(item => item.id);
          body.queryCondition.filterConditions.push(
            new FilterCondition('idArray', OperatorEnum.in, event.queryTerm['id'])
          );
        }
        // ????????????
        this.$tenantApiService.exportTenantProcess(body).subscribe((res: Result) => {
          if (res.code === ResultCodeEnum.success) {
            this.$message.success(this.language.exportSuccess);
          } else {
            this.$message.error(this.language.exportFailed);
          }
        });
      },
      // ??????
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition = event;
        this.tenantRefreshData();
      },
      // ??????
      handleSearch: (event: FilterCondition[]) => {
        event.forEach(item => {
          if (item.filterField === 'phoneNumber') {
            item.operator = 'like';
          }
          if (item.filterField === 'email') {
            item.operator = 'like';
          }
        });
        this.queryCondition.filterConditions = event;
        this.queryCondition.pageCondition.pageNum = 1;
        this.tenantRefreshData();
      }
    };
  }


  /**
   * ??????????????????
   */
  public userInitTableConfig(): void {
    this.usersTableConfig = {
      primaryKey: '01-1',
      isDraggable: true,
      showSearchSwitch: true,
      isLoading: false,
      showSizeChanger: true,
      notShowPrint: true,
      noIndex: true,
      scroll: {x: '1600px', y: '600px'},
      columnConfig: [
        // ??????
        {
          type: 'serial-number', width: 62, title: this.language.serialNumber,
          fixedStyle: {fixedLeft: true, style: {left: '0px'}}
        },
        // ??????
        {
          title: this.language.userCode, key: 'userCode', width: 180, isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'},
          fixedStyle: {fixedLeft: true, style: {left: '63px'}}
        },
        // ??????
        {
          title: this.language.userName, key: 'userName', width: 150, isShowSort: true,
          searchable: true, configurable: false,
          searchConfig: {type: 'input'}
        },
        // ??????
        {
          title: this.language.userNickname, key: 'userNickname', width: 150, isShowSort: true,
          searchable: true, configurable: true,
          searchConfig: {type: 'input'}
        },
        // ????????????
        {
          title: this.language.userStatus, key: 'userStatus', width: 120, isShowSort: true,
          searchable: true, configurable: true,
          type: 'render',
          minWidth: 80,
          renderTemplate: this.userStatusTemp,
          searchConfig: {
            type: 'select',
            selectInfo: [
              {label: this.language.disable, value: UserStatusEnum.disable},
              {label: this.language.enable, value: UserStatusEnum.enable}
            ]
          }
        },
        // ??????
        {
          title: this.language.role, key: 'role', width: 150, isShowSort: true,
          searchable: true, configurable: true,
          type: 'render',
          renderTemplate: this.roleTemp,
          searchConfig: {
            type: 'select', selectType: 'multiple', selectInfo: this.roleArray
          }
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
        // ?????????
        {
          title: this.language.phoneNumber, key: 'phoneNumber', width: 150, isShowSort: true,
          searchable: true, configurable: true,
          searchConfig: {type: 'input'}
        },
        // ??????
        {
          title: this.language.email, key: 'email', width: 150, isShowSort: true,
          searchable: true, configurable: true,
          searchConfig: {type: 'input'}
        },
        // ????????????
        {
          title: this.language.pushType, key: 'pushType', width: 150, isShowSort: true,
          searchable: true, configurable: true,
          type: 'render', renderTemplate: this.pushTypeTemp,
          searchConfig: {
            type: 'select', selectType: 'multiple',
            selectInfo: [
              {label: this.language.mail, value: PushTypeEnum.mail},
              {label: this.language.note, value: PushTypeEnum.note},
              {label: 'app', value: PushTypeEnum.app},
              {label: 'web', value: PushTypeEnum.web}
            ]
          }
        },
        // ??????
        {
          title: this.language.address, key: 'address', width: 150, isShowSort: true,
          searchable: true, configurable: true,
          searchConfig: {type: 'input'}
        },
        // ????????????????????????
        {
          title: this.language.lastLoginTime, key: 'lastLoginTime', width: 180, isShowSort: true,
          searchable: true,
          pipe: 'date',
          searchConfig: {type: 'dateRang'}
        },
        // ??????????????????IP
        {
          title: this.language.lastLoginIp, key: 'lastLoginIp', width: 150, isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        // ????????????
        {
          title: this.language.loginType, key: 'loginType', width: 120, isShowSort: true,
          searchable: true, configurable: true,
          type: 'render',
          renderTemplate: this.loginTypeTemp,
          searchConfig: {
            type: 'select',
            selectInfo: [
              {label: this.language.singleUser, value: LoginTypeEnum.singleUser},
              {label: this.language.multiUser, value: LoginTypeEnum.multiUser}
            ]
          }
        },
        // ???????????????
        {
          title: this.language.maxUsers, key: 'maxUsers', width: 120, isShowSort: true, configurable: true
        },
        // ???????????????
        {
          title: this.language.countValidityTime, key: 'countValidityTime', width: 150, configurable: true
        },
        // ??????
        {
          title: this.language.userDesc, key: 'userDesc', width: 150, isShowSort: true,
          searchable: true, configurable: true,
          searchConfig: {type: 'input'},
        },
        { // ??????
          title: this.language.operate,
          searchable: true,
          searchConfig: {type: 'operate'},
          key: '', width: 100,
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      showPagination: true,
      bordered: false,
      showSearch: false,
      // ????????????
      sort: (event: SortCondition) => {
        const obj = {
          sortProperties: event.sortField,
          sort: event.sortRule
        };
        this.usersQueryCondition.bizCondition = Object.assign(this.filterObject, obj);
        this.userRefreshData();
      },
      // ????????????
      handleSearch: (event: FilterCondition[]) => {
        const obj: any = {};
        event.forEach(item => {
          if (item.operator === OperatorEnum.gte) {
            obj.lastLoginTime = item.filterValue;
          } else if (item.operator === OperatorEnum.lte) {
            obj.lastLoginTimeEnd = item.filterValue;
          } else if (item.filterField === 'role') {
            obj.roleNameList = item.filterValue;
          } else {
            obj[item.filterField] = item.filterValue;
          }
        });
        if (event.length === 0) {
          this.selectUnitName = '';
        }
        this.usersQueryCondition.pageCondition.pageNum = 1;
        this.filterObject = obj;
        this.usersQueryCondition.bizCondition = Object.assign(this.filterObject, obj);
        this.userRefreshData();
      },
    };
  }


  /**
   * ??????????????????
   */
  public tenantPageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.tenantRefreshData();
  }


  /**
   * ?????????????????????
   */
  public usersPageChange(event: PageModel): void {
    this.usersQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.usersQueryCondition.pageCondition.pageSize = event.pageSize;
    this.userRefreshData();
  }


  /**
   * ????????????????????????
   */
  private initLeftBottomButton(): Operation[] {
    const leftBottomButtonsTemp = [
      // ??????
      {
        canDisabled: true,
        className: 'small-button',
        iconClassName: 'fiLink-filink-qiyongi-icon',
        needConfirm: true,
        confirmContent: this.language.enableMsg,
        text: this.language.enable,
        handle: (event) => {
          const ids = event.map(item => item.id);
          if (ids.length) {
            this.clickBatchSwitch(ids, '1', '1');
          } else {
            this.$message.warning('?????????????????????');
          }
        }
      },
      // ??????
      {
        canDisabled: true,
        className: 'small-button',
        iconClassName: 'fiLink-filink-jinyong-icon',
        needConfirm: true,
        confirmContent: this.language.disableMsg,
        text: this.language.disable,
        handle: (event) => {
          const ids = event.map(item => item.id);
          if (ids.length) {
            this.clickBatchSwitch(ids, '0', '1');
          } else {
            this.$message.warning('?????????????????????');
          }
        }
      },
      // ????????????
      {
        canDisabled: false,
        className: 'small-button',
        iconClassName: 'fiLink-filink-qiyongi-icon',
        needConfirm: true,
        confirmContent: this.language.enableAllMsg,
        text: this.language.enableAll,
        handle: (event) => {
          const ids = [];
          this.clickBatchSwitch(ids, '1', '0');
        }
      },
      // ????????????
      {
        canDisabled: false,
        className: 'small-button',
        iconClassName: 'fiLink-filink-jinyong-icon',
        needConfirm: true,
        confirmContent: this.language.disableAllMsg,
        text: this.language.disableAll,
        handle: (event) => {
          const ids = [];
          this.clickBatchSwitch(ids, '0', '0');
        }
      },
    ];
    return leftBottomButtonsTemp;
  }


  /**
   * ??????????????????
   */
  clickSwitch(data) {
    let statusValue;
    this.dataSet.forEach(item => {
      if (item.id === data.id) {
        item.clicked = true;
      }
    });
    data.status === '1' ? statusValue = '0' : statusValue = '1';
    const body = {
      ids: [data.id],
      status: statusValue,
      isAll: '1'
    };
    this.$tenantApiService.updateTenantStatus(body).subscribe((res: Result) => {
      if (res.code === ResultCodeEnum.success) {
        this.dataSet.forEach(item => {
          item.clicked = false;
          if (item.id === data.id) {
            item.status === '1' ? item.status = '0' : item.status = '1';
          }
        });
      } else {
        this.$message.error(res.msg);
      }
    });
  }


  /**
   * ????????????????????????
   */
  clickBatchSwitch(data, status, isAll) {
    const body = {
      ids: data,
      status: status,
      isAll: isAll
    };
    this.$tenantApiService.updateTenantStatus(body).subscribe((res: Result) => {
      if (res.code === ResultCodeEnum.success) {
        this.queryCondition.pageCondition.pageNum = 1;
        this.tenantRefreshData();
      } else {
        this.$message.error(res.msg);
      }
    });
  }

  /**
   * ????????????????????????
   */
  public closeModal(): void {
    this.tableComponent = null;
    this.filterValue = null;
    this.userListVisible = false;
    this.isVisible = false;
    this.roleArray = [];
    this.selectUnitName = '';
    this.usersQueryCondition = new QueryConditionModel();
  }

  /**
   * ????????????????????????
   */
  public deleteModel(ids) {
    // ????????????
    this.deleteIndex++;
    // ??????
    let title = '';
    // ??????
    let text = '';

    if (this.deleteIndex === 1) {
      title = this.language.deleteTitleFirst;
      text = this.language.deleteTextFirst;
    } else if (this.deleteIndex === 2) {
      title = this.language.deleteTitleSecond;
      text = this.language.deleteTextSecond;
    } else {
      title = this.language.deleteTitleThird;
      text = this.language.deleteTextThird;
    }

    // ??????
    this.modalService.warning({
      nzTitle: title,
      nzContent: text,
      nzOkText: this.commonLanguage.cancel,
      nzOkType: 'danger',
      nzCancelText: this.commonLanguage.confirm,
      nzMaskClosable: false,
      nzOnCancel: () => {
        if (this.deleteIndex === 3) {
          this.delTemplate(ids);
        } else {
          this.deleteModel(ids);
        }
      },
      nzOnOk: () => {

      }
    });
  }


  /**
   * ????????????????????????
   * param ids
   */
  private delTemplate(ids: string[]): void {
    const body = {
      ids: ids
    };
    this.$tenantApiService.deleteTenant(body).subscribe((result: Result) => {
      if (result.code === ResultCodeEnum.success) {
        this.$message.success(this.language.successDeleteTenant);
        this.queryCondition.pageCondition.pageNum = 1;
        this.tenantRefreshData();
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ????????????
   */
  private queryAllRoles(): void {
    this.$tenantApiService.queryRoleByTenantId(this.tenantID).subscribe((res: ResultModel<RoleListModel[]>) => {
      const roleArr = res.data;
      if (roleArr) {
        roleArr.forEach(item => {
          this.roleArray.push({'label': item.roleName, 'value': item.roleName});
        });
      }

    });
  }

  /**
   * ?????????????????????
   */
  public queryDeptList(): void {
    this.$tenantApiService.deptListByTenantId(this.tenantID).subscribe((result: ResultModel<DepartmentUnitModel[]>) => {
      this.treeNodes = result.data || [];
    });
  }


  /**
   * ???????????????????????????
   */
  public showModal(filterValue: FilterCondition): void {
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
  public selectDataChange(event: DepartmentUnitModel[]): void {
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
  }

  /**
   * ??????????????????????????????
   */
  public initTreeSelectorConfig(): void {
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
      title: `${this.areaLanguage.selectUnit}`,
      width: '1000px',
      height: '300px',
      treeNodes: this.treeNodes,
      treeSetting: this.treeSetting,
      onlyLeaves: false,
      selectedColumn: [
        {
          title: this.areaLanguage.deptName, key: 'deptName', width: 100,
        },
        {
          title: this.areaLanguage.deptLevel, key: 'deptLevel', width: 100,
        },
        {
          title: this.areaLanguage.parentDept, key: 'parentDepartmentName', width: 100,
        }
      ]
    };
  }


}
