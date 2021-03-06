import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {PageModel} from '../../../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../../../shared-module/model/table-config.model';
import {Router} from '@angular/router';
import {NzI18nService} from 'ng-zorro-antd';
import {FormItem} from '../../../../../../shared-module/component/form/form-config';
import {FormOperate} from '../../../../../../shared-module/component/form/form-operate.service';
import {AlarmService} from '../../../../share/service/alarm.service';
import {AlarmLanguageInterface} from '../../../../../../../assets/i18n/alarm/alarm-language.interface';
import {FiLinkModalService} from '../../../../../../shared-module/service/filink-modal/filink-modal.service';
import {QueryConditionModel} from '../../../../../../shared-module/model/query-condition.model';
import {AlarmStoreService} from '../../../../../../core-module/store/alarm.store.service';
import {CurrentAlarmMissionService} from '../../../../../../core-module/mission/current-alarm.mission.service';
import { AlarmForCommonUtil } from '../../../../../../core-module/business-util/alarm/alarm-for-common.util';
import {ResultModel} from '../../../../../../shared-module/model/result.model';
import {LanguageEnum} from '../../../../../../shared-module/enum/language.enum';
import {AlarmLevelEnum} from '../../../../../../core-module/enum/alarm/alarm-level.enum';
import {AlarmSoundEnum} from '../../../../../../core-module/enum/alarm/alarm-sound.enum';
import {AlarmLevelModel} from '../../../../../../core-module/model/alarm/alarm-level.model';
import {AlarmLevelColorModel} from '../../../../../../core-module/model/alarm/alarm-level-color.model';
import {CommonLanguageInterface} from '../../../../../../../assets/i18n/common/common.language.interface';
import {AlarmSetLevelColorEnum} from '../../../../share/enum/alarm.enum';
import {AlarmLevelColor} from '../../../../../../core-module/const/alarm/alarm-level-color.const';
import {PLAY_MAX_NUM, PLAY_MIN_NUM} from '../../../../share/const/alarm-common.const';
import {AlarmQueryTypeEnum} from '../../../../../../core-module/enum/alarm/alarm-query-type.enum';
declare const $: any;
/**
 * ???????????? ?????????????????? ??????????????????
 */
@Component({
  selector: 'app-alarm-level-set',
  templateUrl: './alarm-level-set.component.html',
  styleUrls: ['./alarm-level-set.component.scss']
})
export class AlarmLevelSetComponent implements OnInit {
  // ????????????????????????
  @ViewChild('alarmLevelTemp') alarmLevelTemp: TemplateRef<any>;
  // ????????????????????????
  @ViewChild('alarmColorTemp') alarmColorTemp: TemplateRef<any>;
  // ?????????????????????
  @ViewChild('musicSwitchTemp') musicSwitchTemp: TemplateRef<any>;
  // ???????????????????????????
  @ViewChild('playCountTemp') playCountTemp: TemplateRef<any>;
  // ???????????????????????????????????????
  @ViewChild('selectOptionsTemp') selectOptionsTemp: TemplateRef<any>;
  // ???????????????????????????
  @ViewChild('isPlayTemp') isPlayTemp: TemplateRef<any>;
  // ???????????????
  public language: AlarmLanguageInterface;
  // ???????????????
  public commonLanguage: CommonLanguageInterface;
  // ???????????????
  public dataSet: AlarmLevelModel[] = [];
  // ??????????????????
  public pageBean: PageModel = new PageModel();
  // ???????????????
  public tableConfig: TableConfigModel;
  // ????????????
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // ???????????????????????????
  public countValue: number;
  // ??????????????????
  public isVisible: boolean = false;
  // ?????????????????????
  public isPlay: boolean = false;
  // audio??????
  public player1: any;
  public player2: any;
  // ?????????????????????
  public tableColumnEdit: FormItem[];
  // ????????????????????????
  public formStatus: FormOperate;
  // ??????????????????????????????????????????
  public selectOptions: AlarmLevelColorModel[] = [];
  // ??????????????????
  public resultSelectedColor: string;
  // ??????????????????
  public isLoading: boolean = false;
  // ????????????
  public alarmSetLevelColorEnum = AlarmSetLevelColorEnum;
  // ????????????
  public alarmLevelEnum = AlarmLevelEnum;
  // ???????????????
  public alarmSoundEnum = AlarmSoundEnum;
  // ?????????
  public languageEnum = LanguageEnum;
  // ???????????????
  public isSubmit: boolean;
  // ??????id
  private alarmId: string = '';
  // ??????????????????????????????
  private AllSelectOptions: AlarmLevelColorModel[] = [];
  // ????????????????????????
  private selectedColor: string;
  // ????????????
  private alarmColorObj: AlarmLevelColorModel = new AlarmLevelColorModel();

  constructor(private $message: FiLinkModalService,
              private $router: Router,
              private $nzI18n: NzI18nService,
              private $alarmService: AlarmService,
              private $alarmStoreService: AlarmStoreService,
              private $curr: CurrentAlarmMissionService,
              private el: ElementRef) {
  }

  ngOnInit() {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.alarm);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    // ???????????????????????????
    this.initAlarmColor();
    // ????????????????????????
    this.initSelectOptions();
    // ?????????????????????
    this.initTableConfig();
    // ?????????????????????
    this.initForm();
    // ????????????
    this.refreshData();
    // ???????????????????????????
    this.player1 = this.el.nativeElement.querySelector('#music');
    this.player2 = this.el.nativeElement.querySelector('#audio');
  }

  /**
   * ??????????????????
   * param event
   */
  public pageChange(event: PageModel): void {
    this.refreshData();
  }

  /**
   * ??????????????????????????????
   * param event
   */
  public formInstance(event: { instance: FormOperate }): void {
    this.formStatus = event.instance;
    this.formStatus.group.statusChanges.subscribe(() => {
      this.isSubmit = this.formStatus.getValid();
    });
  }

  /**
   * ??????
   */
  public playMusic(data: AlarmLevelModel): void {
    if (data && data.alarmLevelSound) {
      const srcPath = 'assets/audio';
      const musicPath = `${srcPath}/${data.alarmLevelSound}`;
      this.player1.src = musicPath;
      this.player1.play();
    }
  }

  /**
   * ???
   */
  public plus(): void {
    if (Number.isInteger(this.countValue)) {
      // ????????????????????? ????????????????????? ?????? '1'
      this.countValue = Number(this.countValue);
      if (this.countValue >= PLAY_MAX_NUM) {
        return;
      } else {
        this.countValue = this.countValue + 1;
      }
    } else {
      this.countValue = PLAY_MIN_NUM;
    }
  }

  /**
   * ???
   */
  public minus(): void {
    if (Number.isInteger(this.countValue)) {
      this.countValue = Number(this.countValue);
      if (this.countValue <= PLAY_MIN_NUM) {
        this.countValue = PLAY_MIN_NUM;
      } else {
        this.countValue = this.countValue - 1;
      }
    } else {
      this.countValue = PLAY_MIN_NUM;
    }
  }

  /**
   * keyup ????????????????????????
   * param event
   */
  public onKey(event: KeyboardEvent): void {
    const valNumber: number = Number(event.key);
    if (valNumber <= PLAY_MAX_NUM && valNumber >= PLAY_MIN_NUM) {
      this.countValue = valNumber;
    } else {
      this.countValue = PLAY_MIN_NUM;
    }
  }

  /**
   * ??????????????????????????????
   */
  public editHandle(): void {
    this.player2.pause();
    this.formStatus.resetControlData('playCount', this.countValue);
    const editData: AlarmLevelModel = this.formStatus.getData();
    editData.id = this.alarmId;
    // ??????????????????
    editData.alarmLevelColor = this.resultSelectedColor;
    // ??????????????????
    editData.alarmLevelName = AlarmForCommonUtil.translateAlarmLevel(this.$nzI18n, editData.id) as string;
    this.isLoading = true;
    this.$alarmService.updateAlarmLevel(editData).subscribe((res: ResultModel<string>) => {
      this.isLoading = false;
      if (res.code === 0) {
        this.$message.success(res.msg);
        this.isVisible = false;
        // ??????????????????
        this.$curr.sendMessage(AlarmQueryTypeEnum.count);
        this.refreshData();
      } else if (res.code === 170122) {
        // ????????????????????????
        this.$message.info(res.msg);
        this.resultSelectedColor = this.selectedColor;
        this.refreshData();
      } else {
        this.$message.info(res.msg);
      }
    }, () => {
      this.isLoading = false;
    });
  }

  /**
   * ????????????
   */
  public editHandleCancel(): void {
    this.isVisible = false;
    this.player2.pause();
  }

  /**
   * ????????????????????????
   */
  private refreshData(): void {
    this.tableConfig.isLoading = true;
    this.$alarmService.queryAlarmLevelList(this.queryCondition).subscribe((res: ResultModel<AlarmLevelModel[]>) => {
      this.pageBean.Total = res.totalCount;
      this.tableConfig.isLoading = false;
      this.dataSet = res.data;
      this.changeSelectOptions(this.selectedColor);
      if (res.code === 0 && this.dataSet && this.dataSet[0]) {
        // ??????????????????????????????
        this.$alarmStoreService.alarm = this.dataSet.map(item => {
          item.color = this.alarmColorObj[item.alarmLevelColor];
          return item;
        });
      }
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }
  /**
   * ??????????????????????????????????????????
   */
  private initSelectOptions(): void {
    this.AllSelectOptions = [];
    AlarmLevelColor.forEach(item => {
      this.AllSelectOptions.push({
        value: item.value,
        label: this.language[item.label],
        color: item.color,
        style: item.style
      });
    });
    this.selectOptions = this.AllSelectOptions;
  }

  /**
   * ???????????????????????????
   * param id
   */
  private changeSelectOptions(id: string): void {
    const arr = this.dataSet.map(item => item.alarmLevelColor);
    this.selectOptions = this.AllSelectOptions.filter(item => {
      return arr.indexOf(item.value) === -1 || item.value === id;
    });
  }

  /**
   * ?????????????????????
   */
  private initTableConfig(): void {
    const width = ($('.alarm-level-set').width() - 224) / 5;
    this.tableConfig = {
      isDraggable: true,
      isLoading: false,
      showSearchSwitch: false,
      showSizeChanger: false,
      primaryKey: '02-6-1',
      scroll: {x: '1000px', y: '600px'},
      columnConfig: [
        {type: 'select', fixedStyle: {fixedLeft: true, style: {left: '0px'}}, width: 62},
        {
          // ????????????
          title: this.language.alarmLevelCode, key: 'alarmLevelCode', width: width,
          configurable: true,
          type: 'render',
          searchable: true,
          searchConfig: {type: 'input'},
          renderTemplate: this.alarmLevelTemp,
        },
        {
          // ??????
          title: this.language.alarmLevelColor, key: 'alarmLevelColor', width: width,
          configurable: true,
          type: 'render',
          renderTemplate: this.alarmColorTemp,
        },
        {
          // ?????????
          title: this.language.alarmLevelSound,
          key: 'alarmLevelSound',
          width: width,
          configurable: true,
          type: 'render',
          searchable: true,
          searchConfig: {type: 'input'},
          renderTemplate: this.musicSwitchTemp
        },
        {
          // ????????????
          title: this.language.isPlay, key: 'isPlay', width: width,
          configurable: true,
          type: 'render',
          renderTemplate: this.isPlayTemp
        },
        {
          // ????????????
          title: this.language.playCount, key: 'playCount', width: width,
          configurable: true
        },
        {
          title: this.language.operate, searchable: true,
          searchConfig: {type: 'operate'}, key: '', width: 100, fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      showPagination: false,
      bordered: false,
      showSearch: false,
      searchReturnType: 'object',
      topButtons: [],
      operation: [
        {
          // ??????
          text: this.language.update,
          permissionCode: '02-3-1-4-1',
          className: 'iconfont fiLink-edit',
          handle: (data: AlarmLevelModel) => {
            this.alarmId = data.id;
            this.selectedColor = data.alarmLevelColor;
            this.changeSelectOptions(data.alarmLevelColor);
            this.isVisible = true;
            this.resultSelectedColor = this.selectedColor;
            // ????????????
            this.$alarmService.queryAlarmLevelById(this.alarmId).subscribe((res: ResultModel<AlarmLevelModel>) => {
              const alarmData = res.data;
              const counts = res.data.playCount;
              this.formStatus.resetData(alarmData);
              this.countValue = counts;
            });
          }
        }
      ]
    };
  }
  /**
   * ???????????????????????????
   */
  private initAlarmColor(): void {
    AlarmLevelColor.forEach(item => {
      this.alarmColorObj[item.value] = item;
    });
  }
  /**
   * ?????????????????????????????????????????????
   */
  private initForm(): void {
    this.tableColumnEdit = [
      {
        // ????????????
        label: this.language.alarmLevelCode, key: 'alarmLevelCode',
        type: 'select', require: false, col: 24,
        disabled: true,
        selectInfo: {
          data: AlarmForCommonUtil.translateAlarmLevel(this.$nzI18n),
          label: 'label',
          value: 'code'
        },
        rule: [], asyncRules: []
      },
      {
        // ??????
        label: this.language.alarmLevelColor, key: 'alarmLevelColor',
        type: 'custom', require: false, col: 24,
        asyncRules: [],
        template: this.selectOptionsTemp,
        rule: [],
      },
      {
        // ?????????
        label: this.language.alarmLevelSound, key: 'alarmLevelSound',
        type: 'select', require: false, col: 24,
        selectInfo: {
          data: [
            {label: 'a.mp3', value: 'a.mp3'},
            {label: 'b.mp3', value: 'b.mp3'},
            {label: 'c.mp3', value: 'c.mp3'},
            {label: 'd.mp3', value: 'd.mp3'},
            {label: 'e.mp3', value: 'e.mp3'},
            {label: 'f.mp3', value: 'f.mp3'},
            {label: 'g.mp3', value: 'g.mp3'}
          ],
          label: 'label',
          value: 'value'
        },
        openChange: (a, b, c) => {
          const srcPath = 'assets/audio';
          if (b) {
            this.player2.pause();
          } else {
            if (a.alarmLevelSound.value) {
              const musicPath = `${srcPath}/${a.alarmLevelSound.value}`;
              this.player2.src = musicPath;
              this.player2.play();
            }
          }
        },
        rule: [], asyncRules: []
      },
      {
        // ????????????
        label: this.language.isPlay,
        key: 'isPlay',
        type: 'radio',
        require: false,
        col: 24,
        radioInfo: {
          data: [
            {label: this.language.yes, value: AlarmSoundEnum.yes},
            {label: this.language.no, value: AlarmSoundEnum.no},
          ],
          label: 'label',
          value: 'value'
        },
        rule: [],
        asyncRules: []
      },
      {
        // ????????????
        label: this.language.playCount,
        key: 'playCount',
        type: 'custom',
        col: 24,
        initialValue: 3,
        require: false,
        rule: [{required: true}, {min: 0, max: 5, pattern: '^[0-5]\d*$', msg: this.commonLanguage.inputError}],
        asyncRules: [],
        template: this.playCountTemp
      }
    ];
  }
}
