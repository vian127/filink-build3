import {Component, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NzI18nService, NzModalService, NzUploadComponent, UploadFile} from 'ng-zorro-antd';
import {FacilityMissionService} from '../../../../../core-module/mission/facility.mission.service';
import {BusinessFacilityService} from '../../../../../shared-module/service/business-facility/business-facility.service';
import {FacilityApiService} from '../../../share/service/facility/facility-api.service';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {FacilityService} from '../../../../../core-module/api-service/facility/facility-manage';
import {LockService} from '../../../../../core-module/api-service/lock';
import {TableConfigModel} from '../../../../../shared-module/model/table-config.model';
import {PageModel} from '../../../../../shared-module/model/page.model';
import {FacilityLanguageInterface} from '../../../../../../assets/i18n/facility/facility.language.interface';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {CommonLanguageInterface} from '../../../../../../assets/i18n/common/common.language.interface';
import {ResultCodeEnum} from '../../../../../shared-module/enum/result-code.enum';
import {PicResourceEnum} from '../../../../../core-module/enum/picture/pic-resource.enum';
import {CompressUtil} from '../../../../../shared-module/util/compress-util';
import {BINARY_SYSTEM_CONST, FILE_TYPE_CONST, IMG_SIZE_CONST} from '../../../../../core-module/const/common.const';
import {ObjectTypeEnum} from '../../../../../core-module/enum/facility/object-type.enum';
import {SessionUtil} from '../../../../../shared-module/util/session-util';
import {DeviceTypeEnum} from '../../../../../core-module/enum/facility/facility.enum';
import {WellCoverEnum} from '../../../../../core-module/enum/facility/Intelligent-lock/well-cover.enum';
import {LockModel} from '../../../../../core-module/model/facility/lock.model';
import {ControlModel} from '../../../../../core-module/model/facility/control.model';
import {HostTypeEnum} from '../../../../../core-module/enum/facility/Intelligent-lock/host-type.enum';

/**
 * ??????????????????????????????
 */
@Component({
  selector: 'app-basic-operation',
  templateUrl: './basic-operation.component.html',
  styleUrls: ['./basic-operation.component.scss']
})
export class BasicOperationComponent implements OnInit {
  // ??????id
  @Input()
  public deviceId: string;
  // ?????????
  @Input()
  public serialNum: string;
  // ????????????
  @Input()
  public deviceType: DeviceTypeEnum;
  // ????????????
  @Input()
  public deviceName: string;
  // ??????
  @Input()
  public positionBase: string;
  // ???????????????????????????
  @Input()
  public intelligentLabelDetail: boolean;
  @Input()
  public isEndVisible = false; // ????????????
  @Input()
  public viewIsEndVisible = false;
  // ????????????
  @Input()
  public hasGuard = false;
  // ??????????????????
  @ViewChild('openLockTemp') public openLockTemp: TemplateRef<{}>;
  // ??????????????????
  @ViewChild('coreEndTemp') public coreEndTemp: TemplateRef<HTMLDocument>;
  @ViewChild(NzUploadComponent) public upload: NzUploadComponent;
  // ???????????????
  public hasControl: boolean = false;
  // ?????????
  public lockInfo = [];
  // ????????????
  public pageBean: PageModel = new PageModel();
  // ???????????????
  public language: FacilityLanguageInterface;
  // ???????????????
  public commonLanguage: CommonLanguageInterface;
  // ?????????
  public lockInfoConfig: TableConfigModel;
  // ????????????????????????
  public show = false;
  // ??????????????????????????????
  public ViewShow = false;
  // ??????????????????????????????
  public isCoreEnd = false;
  // ??????????????????????????????
  public isCoreFusion = false;
  // ??????????????????????????????
  public isJointClosure = true;
  // ????????????loading
  public loading = false;

  constructor(private $router: Router,
              private $message: FiLinkModalService,
              private $facilityService: FacilityService,
              private $facilityApiService: FacilityApiService,
              private $modal: NzModalService,
              private $lockService: LockService,
              private $refresh: FacilityMissionService,
              private $nzI18n: NzI18nService,
              private $businessFacilityService: BusinessFacilityService) {
  }

  public ngOnInit(): void {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.facilityTypeJudgment();
    this.lockInfoConfig = {
      noIndex: true,
      columnConfig: [
        {type: 'select', width: 62},
        {type: 'serial-number', width: 62, title: this.language.serialNumber},
        {title: this.language.doorNum, key: 'doorNum', width: 100},
        {title: this.language.doorName, key: 'doorName', width: 100},
      ]
    };
    // ????????????????????????????????????????????????????????????????????????
    this.$lockService.getLockControlInfo(this.deviceId).subscribe((result: ResultModel<ControlModel[]>) => {
      if (result.data && result.data.length) {
        const equipmentModelType = result.data[0].equipmentModelType;
        this.hasControl = equipmentModelType === HostTypeEnum.ElectronicLock || equipmentModelType === HostTypeEnum.MechanicalLock;
      }
    });
  }

  /**
   * ???????????????????????????
   */
  public checkHasRole(code: string): boolean {
    return !SessionUtil.checkHasRole(code);
  }

  /**
   * ???????????????????????????????????????
   */
  public clickButton(): void {
    this.getLockInfo(this.deviceId).then((res: any[]) => {
      if (res.length > 0) {
        this.$router.navigate(['business/facility/facility-config'],
          {queryParams: {id: this.deviceId, serialNum: this.serialNum, deviceType: this.deviceType}}).then();
      } else {
        this.$message.error(this.language.noControlMsg);
      }
    });
  }

  /**
   * ????????????
   */
  public deleteFacility(): void {

    // ??????????????????????????????????????????????????????
    this.$modal.confirm({
      nzTitle: this.language.prompt,
      nzContent: this.language.deleteFacilityMsg,
      nzMaskClosable: false,
      nzKeyboard: false,
      nzOkText: this.language.handleCancel,
      nzCancelText: this.language.handleOk,
      nzOkType: 'danger',
      nzOnOk: () => {
      },
      nzOnCancel: () => {
        this.$facilityApiService.deleteDeviceDyIds([this.deviceId]).subscribe((result: ResultModel<string>) => {
          if (result.code === ResultCodeEnum.success) {
            this.$message.success(this.language.deleteFacilitySuccess);
            this.$router.navigate(['business/facility/facility-list']).then();
          } else {
            this.$message.error(result.msg);
          }
        });
      }
    });
  }

  /**
   * ????????????
   */
  public updateFacility(): void {
    this.$router.navigate(['business/facility/facility-detail/update'],
      {queryParams: {id: this.deviceId}}).then();
  }

  /**
   * ????????????
   */
  public viewCable(): void {
    this.$router.navigate(['business/facility/view-cable'],
      {queryParams: {id: this.deviceId}}).then();
  }

  /**
   * ??????????????????
   */
  public authorization(): void {
    if ([DeviceTypeEnum.well, DeviceTypeEnum.opticalBox, DeviceTypeEnum.outdoorCabinet].includes(this.deviceType)) {
      // ??????????????????
      const modal = this.$modal.create({
        nzTitle: this.language.authorization,
        nzContent: this.openLockTemp,
        nzOkText: this.language.handleCancel,
        nzCancelText: this.language.handleOk,
        nzOkType: 'danger',
        nzClassName: 'custom-create-modal',
        nzMaskClosable: false,
        nzFooter: [
          {
            label: this.language.handleOk,
            onClick: () => {
              const slotNum = [];
              this.lockInfo.forEach(item => {
                if (item.checked) {
                  slotNum.push(item.doorNum);
                }
              });
              if (slotNum.length === 0) {
                this.$message.error(this.language.chooseDoorLock);
                return;
              }
              // ?????????????????????????????????id?????????
              this.$router.navigate(['/business/application/facility-authorization/unified-details/add'],
                {queryParams: {id: this.deviceId, slotNum: slotNum.join(',')}}).then(() => {
                modal.destroy();
              });
            }
          },
          {
            label: this.language.handleCancel,
            type: 'danger',
            onClick: () => {
              modal.destroy();
            }
          },
        ]
      });
      this.getLockInfo(this.deviceId).then();
    } else {
      this.$message.error(this.language.noSupport);
    }
  }

  /**
   * ?????????????????????
   */
  public getLockInfo(deviceId): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.$lockService.getLockInfo(deviceId).subscribe((result: ResultModel<LockModel[]>) => {
        this.lockInfo = result.data || [];
        if (this.deviceType === DeviceTypeEnum.well) {
          this.lockInfo = this.lockInfo.filter(item => item.doorNum !== WellCoverEnum.outCover);
        }
        resolve(this.lockInfo);
      }, (err) => {
        reject(err);
      });
    });

  }

  /**
   * ??????????????????
   */
  public updateDeviceStatus(deviceStatus: string, msg: string): void {
    this.handlePrompt(msg, () => {
      const body = {deviceIds: [this.deviceId], deployStatus: deviceStatus};
      this.$lockService.updateDeviceStatus(body).subscribe((result: ResultModel<string>) => {
        if (result.code === ResultCodeEnum.success) {
          this.$message.success(this.language.deployCommandIssuedSuccessfully);
          // ????????????????????????????????????
          this.$refresh.refreshChange(true);
        } else {
          this.$message.error(result.msg);
        }
      });
    });

  }

  /**
   *  ??????????????????
   *  param nzContent
   *  param handle
   */
  public handlePrompt(nzContent: string, handle: () => void): void {
    this.$modal.confirm({
      nzTitle: this.language.prompt,
      nzContent: nzContent,
      nzMaskClosable: false,
      nzOkText: this.language.handleCancel,
      nzCancelText: this.language.handleOk,
      nzOkType: 'danger',
      nzOnOk: () => {
      },
      nzOnCancel: () => {
        handle();
      }
    });
  }

  /**
   * ????????????????????????
   */
  public coreEnd(): void {
    this.isEndVisible = true;
    this.show = true;
  }

  /**
   * ??????????????????????????????
   */
  public viewCoreEnd(): void {
    this.viewIsEndVisible = true;
    this.ViewShow = true;
  }

  /**
   * ??????????????????
   */
  public viewFacilities(): void {
    this.$router.navigate(['/business/facility/view-facility-picture'],
      {queryParams: {id: this.deviceId}, queryParamsHandling: 'preserve'}).then();
  }


  /**
   * ??????: ????????? ?????????  ??????: ????????? ????????? ?????????
   */
  public facilityTypeJudgment(): void {
    // ?????????????????????????????????
    if (this.deviceType === DeviceTypeEnum.junctionBox) {
      this.isJointClosure = false;
    }
    this.isCoreEnd = [DeviceTypeEnum.opticalBox, DeviceTypeEnum.distributionFrame].includes(this.deviceType);
    this.isCoreFusion = [DeviceTypeEnum.opticalBox, DeviceTypeEnum.distributionFrame,
      DeviceTypeEnum.junctionBox].includes(this.deviceType);
  }


  /**
   * ??????????????????????????????
   */
  beforeUpload = (file: UploadFile): boolean => {
    if (!FILE_TYPE_CONST.includes(file.type)) {
      this.$message.error(this.language.fileFormatError);
      return false;
    }
  };
  /**
   * ????????????
   */
  uploadImg = (item: UploadFile) => {
    if (!item) {
      return;
    }
    this.loading = true;
    const formData = new FormData();
    formData.append('resource', PicResourceEnum.realPic);
    formData.append('objectId', this.deviceId);
    formData.append('objectType', ObjectTypeEnum.facility);
    if (item.file.size / (BINARY_SYSTEM_CONST) > IMG_SIZE_CONST) {
      CompressUtil.compressImg(item.file as File).then((res: File) => {
        formData.append('pic', res, res.name);
        this.handleUpload(formData);
      });
    } else {
      formData.append('pic', item.file);
      this.handleUpload(formData);
    }
  };

  /**
   * ????????????
   */
  private handleUpload(formData: FormData) {
    this.$facilityApiService.uploadPicture(formData).subscribe((result: ResultModel<string>) => {
      if (result.code === ResultCodeEnum.success) {
        this.loading = false;
        this.$message.success(this.language.uploadFacilityImgSuccess);
        this.$businessFacilityService.eventEmit.emit();
      }
    }, () => {
      this.loading = false;
    });
  }

}
