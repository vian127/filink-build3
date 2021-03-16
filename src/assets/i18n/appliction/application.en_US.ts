export default {
  // 策略类型
  policyControl: {
    lighting: 'Lighting strategy',
    information: 'Information release strategy',
    broadcast: 'Broadcast publishing strategy',
    linkage: 'Linkage strategy',
    centralizedControl: 'Security monitoring strategy'
  },
  // 执行周期
  execType: {
    nothing: 'None',
    daily: 'Every day',
    workingDay: 'Working day',
    vacations: 'Holiday',
    execution: 'Interval execution',
    custom: 'Custom'
  },
  // 执行周期
  executionCycleType: {
    none: 'None',
    everyDay: 'Every day',
    workingDay: 'Working day',
    holiday: 'Holiday',
    intervalExecution: 'Interval execution',
    custom: 'Custom',
  },
  // 告警级别
  alarmLevel: {
    urgent: 'Urgent',
    main: 'Main',
    secondary: 'Secondary',
    tips: 'Tips',
  },
  // 门锁
  doorNumber: {
    doorOne: 'One',
    doorTwo: 'Two',
    doorThree: 'three',
    doorFour: 'Four',
  },
  // 执行状态
  execStatus: {
    free: 'Free',
    implement: 'In execution'
  },
  // 控制状态
  controlType: {
    platform: 'Platform control',
    equipment: 'Equipment control'
  },
  // 策略状态
  strategyStatus: {
    open: 'Enable',
    close: 'Disable'
  },
  // 设备状态
  equipmentStatus: {
    unSet: 'Not configured',
    online: 'On line',
    alarm: 'Alarm',
    break: 'Fault',
    offline: 'Off Line',
    outOfContact: 'Out of contact',
    dismantled: 'Removed',
    event: 'Event',
  },
  conditionType: {
    event: 'Event',
    alarm: 'Alarm',
    trigger: 'Flip flop',
  },
  // 告警统计
  alarmLevelStatus: {
    signal: 'Communication alarm',
    businessQuality: 'Service quality alarm',
    environmentalScience: 'Environment alarm',
    power: 'Power alarm',
    security: 'security alarm',
    equipment: 'Equipment alarm'
  },
  // 节目状态
  programStatus: {
    toBeReviewed: 'To be reviewed',
    reviewed: 'Reviewed',
    auditFailed: 'Audit failed',
    disabled: 'Disabled',
    underReviewed: 'Under review',
    enabled: 'Enabled',
  },
  // 文件类型
  fileType: {
    video: 'video',
    image: 'Image',
    text: 'Text'
  },
  // 工单状态
  workOrderState: {
    assigning: 'Assignment in progress',
    assigned: 'Assigned',
    underReview: 'Under review',
    completed: 'Completed',
    chargeback: 'Chargeback',
    cancelled: 'Cancelled'
  },
  // 表格
  equipmentTable: {
    equipment: 'Equipment',
    facilities: 'List of facilities',
    group: 'Group',
    loop: 'Loop',
    moreOperate: 'More operations',
    lighting: 'Lighting',
    doorOpen: 'Illegal door opening',
    circuitDetails: 'Circuit details',
    loopControl: 'Loop control',
    lampControl: 'Lighting circuit',
    loopOperation: 'Loop operation',
    associatedFacilities: 'Loop associated facilities',
    currentPage: 'Current No',
    strategyConsole: 'Lighting strategy workbench',
    page: 'Page',
    common: 'Common',
    total: 'Total',
    strip: 'Strip',
    supported: 'This function is not supported for the time being!',
    groupStatue: 'Group control',
    strategyIssued: 'Strategy issued',
    strategyOperationIssued: 'Confirm the issuance of execution strategy',
    strategyLightIntensity: 'The light intensity value is a positive integer!',
    assetNumber: 'Asset number',
    equipmentName: 'Name',
    equipmentType: 'Type',
    equipmentStatus: 'State',
    equipmentModel: 'Model',
    supplier: 'Supplier',
    scrapTime: 'Scrap life',
    open: 'Open',
    close: 'Close',
    confirmOpen: 'Make sure to turn on',
    confirmClose: 'Are you sure to close',
    upElectric: 'Power on',
    downElectric: 'Power down',
    confirmUpElectric: 'Confirm power on',
    confirmDownElectric: 'Confirm power down',
    light: 'Brightness',
    details: 'View details',
    equipmentDetail: 'Device details',
    brightness: 'Brightness adjustment',
    groupName: 'Group name',
    remark: 'Remarks',
    gate: 'Switch on',
    pull: 'Switch off',
    confirmPull: 'Confirm that the brake is opened',
    confirmGate: 'Confirm closing',
    equipmentList: 'Equipment List',
    groupList: 'Group List',
    loopList: 'Loop List',
    switch: 'Switch',
    shut: 'Shut',
    play: 'Play',
    confirmPlay: 'Confirm playback'
  },
  electricityDate: {
    week: 'This week',
    month: 'This month',
    year: 'This year'
  },
  lightRateList: {
    lastYear: 'lastYear',
    lastMonth: 'lastYear',
    lastWeek: 'lastWeek'
  },
  workOrderList: {
    lastYear: 'This year',
    lastMonth: 'This month',
    lastWeek: 'This week'
  },
  enableOnvifState: {
    yes: 'yes',
    no: 'no'
  },
  conditionsMet: {
    all: 'all',
    single: 'single'
  },
  // 策略列表
  strategyList: {
    moveOutOfTheLoop: 'Are you sure you want to remove the data',
    intervalTimeTips: 'The interval days must be within the validity period!',
    disabledPolicy: 'Disabled policies cannot be distributed!',
    facilities: 'Grouping facilities',
    releaseStrategy: 'Information release strategy',
    day: 'Day',
    more: 'more',
    operationUser: 'Operation user',
    operationTime: 'Operation time',
    operationResult: 'Operation results',
    operationDetails: 'Operation details',
    workbenchStrategy: 'There no lighting strategy yet. Go ahead and create it~',
    information: 'There is no more information~',
    strategyName: 'Policy name',
    strategyType: 'Policy type',
    effectivePeriodTime: 'Effective Period Time',
    execCron: 'Execution cycle',
    execStatus: 'Exec Status',
    createTime: 'Create Time',
    applyUser: 'Apply User',
    remark: 'Remark',
    strategyStatus: 'Strategy Status',
    strategyAdd: 'Add',
    strategyDelete: 'Delete',
    strategyEdit: 'Edit',
    confirmDelete: 'Confirm Delete',
    enable: 'Enable',
    confirmEnable: 'Confirm Enable',
    deactivation: 'Deactivation',
    confirmDeactivation: 'Confirm Deactivation',
    selectDisabled: 'Please select disabled data',
    deviceModeDoesItMatch: 'Please verify that the control type and device mode match',
    selectEnable: 'Please select the enabled data',
    equipmentCode: 'Equipment Code',
    equipmentName: 'Equipment Name',
    equipmentAdd: 'Add policy',
    newStrategy: 'New strategy',
    equipmentEdit: 'Editing strategy',
    equipmentTip: 'Tips',
    conditions: 'Input at least one of the following conditions and actions',
    term: 'Condition',
    action: 'Action',
    switch: 'Switch',
    lightIntensity: 'Light intensity',
    timeInterval: 'Time interval',
    eventSources: 'Other event sources',
    event: 'Event source',
    dimming: 'Dimming',
    save: 'Save',
    selectEquipment: 'Select device',
    alarmList: 'Alarm list',
    eventList: 'Event list',
    alarmName: 'Alarm name',
    alarmObject: 'Alarm Object',
    alarmDeviceName: 'Equipment name',
    areaName: 'Region',
    areaLevel: 'Area Level',
    selectArea: 'Select Area',
    address: 'Detailed address',
    alarmFixedLevel: 'Alarm level',
    responsibleDepartment: 'Responsible unit',
    previousStep: 'Back',
    nextStep: 'Next step',
    confirm: 'Confirm',
    cancel: 'Cancel',
    strategyDetails: 'Strategy details',
    deletePolicy: 'Delete policy',
    sureDelete: 'Are you sure you want to delete',
    strategiesUse: 'Strategies in use',
    allStrategy: 'All strategies',
    timeSlot: 'Time slot',
    add: 'Add',
    noData: 'No data available',
    programSelection: 'Program selection',
    loop: 'Loop',
    noLoop: 'No circulation',
    volume: 'Volume',
    cycleMode: 'Cycle Mode',
    moveUp: 'Move up',
    moveDown: 'Move Down',
    programList: 'Program list',
    programName: 'Program name',
    programPurpose: 'Program use',
    duration: 'Duration',
    mode: 'Format',
    resolution: 'Resolving power',
    programFileName: 'Program files',
    trigger: 'Trigger conditions',
    sourceType: 'Event source type',
    performAction: 'Perform the action',
    addDevice: 'Add device',
    setCommand: 'Setting instruction',
    screen: 'Screen',
    singleControl: 'Single control',
    multiControl: 'Multi control',
    equipmentType: 'Equipment type',
    lamp: 'Lamp',
    enableNow: 'Enable now',
    applicationScope: 'Scope of application',
    daysBetween: 'Interval days',
    execution: 'Implementation date',
    controlType: 'Control type',
    enableStatus: 'Enable status',
    loopId: 'Loop ID',
    loopName: 'Group name',
    basicInformation: 'Basic information of strategy',
    updateTime: 'Update time',
    createUser: 'Founder',
    singleLights: 'Quantity of single lamp',
    controlQuantity: 'Centralized control quantity',
    wisdomPoles: 'Number of smart sticks',
    convenient: 'Convenient entrance',
    policySelected: 'No policy selected',
    lightingRate: 'Lighting rate',
    workOrder: 'Work order increment',
    equipmentStatus: 'Equipment status',
    electricity: 'Electricity consumption',
    alarmStatistics: 'Alarm Statistics',
    loopDefinition: 'Circuit name',
    loopCode: 'Loop Code',
    loopStatus: 'Loop Status',
    controlObj: 'Control Object',
    distribution: 'Distribution box',
    centralController: 'Centralized controller',
    effectivePeriodStart: '',
    effectivePeriodEnd: '',
    pleaseSelectProgram: 'Please select Program',
    pleaseInputShowTime: 'Please input time of show',
    playProgramList: 'Playlist',
    dragToSort: 'Drag table row data to sort',
    timePeriodCrossingErrTip: 'The playing period overlaps with the one filled in. Please re-enter!',
    execTimeErrorTip: 'Please enter the validity period first!',
    lightValueErrorTip: 'Please enter the value of light intensity!',
    sameTimeErrorTip: 'Period cannot be repeated!',
    onlyEndTime: 'only end time error',
    deleteMsg: 'delete success!',
    sunrise: 'sunrise',
    sunset: 'sunset',
    custom: 'custom',
    coincident: 'coincident',
    addTrigger: 'add trigger',
    addAction: 'add action',
    triggerEquipment: 'trigger Equipment',
    noXMlInfoMsg: 'The currently selected device is not configured with protocol scripts!',
    triggerConditionMustMsg: 'Please select trigger condition first!',
    hasEnableData: 'The selected strategy has an enabled state, please select again',
    hasDisableData: 'The selected strategy has a disabled state, please select again',
    editInfo: 'you can not edit policy in enabled state'
  },
  // 内容列表
  contentList: {
    programName: 'Program name',
    programPurpose: 'Program purpose',
    duration: 'Duration',
    format: 'Format',
    fileType: 'Type',
    resolvingPower: 'Resolving power',
    applicant: 'Applicant',
    addBy: 'Add by',
    addTime: 'Add time',
    checker: 'Checker',
    auditTime: 'Audit time',
    programFiles: 'Program files',
    preview: 'Preview',
    initiateAudit: 'Initiate audit',
    theProgramIsPlaying: 'The program is playing',
    failedToReviewThePlayingContent: 'Failed to review the playing content',
    playbackDisabled: 'Playback disabled',
    editContent: 'Edit content',
    addContent: 'Add content',
    programDescription: 'Program description',
    size: 'Size',
    type: 'Type',
    pleaseUploadVideoOrPicture: 'Please upload video or picture',
    describeProgram: 'Describe the purpose of the program content',
    automaticAcquisition: 'Automatic acquisition of uploaded files',
    backstageAutoFill: 'Backstage auto fill',
    contentList: 'Content list',
    otherDepartments: 'Do not operate other departments',
    notDelete: 'The program that initiated the audit cannot be deleted',
    canEnabled: 'Only approved or disabled programs can be enabled',
    canDisabled: 'Only enabled programs can be disabled',
    fileRestrictions: 'Please upload files less than 10MB',
    resolutionFormat: 'The file content exceeds the resolution format range (1280 * 512)',
  },
  // 内容审核
  auditContent: {
    workOrderName: 'Work order name',
    personLiable: 'Person liable',
    workOrderStatus: 'Work Order status',
    expectedCompletionTime: 'Expected completion time',
    actualCompletionTime: 'Actual completion time',
    creationTime: 'Creation time',
    examineOpinion: 'Examine opinion',
    examineContent: 'Examine content',
    reasonsForTransfer: 'Reasons for transfer',
    chargebackReason: 'Chargeback reason',
    viewDetails: 'View details',
    cannotBeDeleted: 'The work order in approval cannot be deleted',
    cannotBeCancel: 'The work order cannot be cancelled',
    workOrderInformation: 'Basic information of work order',
    transfer: 'Transfer',
    chargeback: 'Chargeback',
    basicOperation: 'Strategy Basic operation',
    contentExamine: 'Content Examine',
    programApplicant: 'Program applicant',
    programPurpose: 'Program purpose',
    findingsOfAudit: 'Findings of audit',
    designatedPerson: 'Designated person',
    deleteTheWorkOrder: 'Are you sure you want to delete the work order',
    cancelTheWorkOrder: 'Are you sure to cancel the work order',
    contentAudit: 'Content audit work order',
    deleteOthers: 'Unable to delete others\' work order',
    notDelete: 'The work order is being processed and cannot be deleted',
    contentWorkOrder: 'Content work order',
  },
  // 信息工作台
  informationWorkbench: {
    enabledSuccessfully: 'Enabled successfully',
    disableSuccessfully: 'Disable successfully',
    startStatistics: 'Start statistics',
    quantityStatistics: 'Statistics of alarm classification quantity',
    programLaunchQuantity: 'Statistics of equipment program launch quantity',
    playingTime: 'Statistics of equipment program launch quantity',
    createIt: 'You haven\'t released any information yet. Go ahead and create it',
    workbench: 'Information release workbench',
    programDistribution: 'Program distribution',
  },
  // 信息工作台
  securityWorkbench: {
    workbench: 'Workbench',
    channelName: 'Channel name',
    channelNumber: 'Channel number',
    channelStatus: 'Channel Status',
    cameraType: 'Camera access type',
    onvifStatus: 'Is onvif detection enabled',
    onvifIp: 'Detect onvif IP',
    onvifAccount: 'Probe onvif user name',
    onvifPassword: 'Detect onvif password',
    rtspAddr: 'Camera access RTSP address',
    onvifAddr: 'Camera access to onvif address',
    cameraAccount: 'Camera user name',
    cameraPassword: 'Camera password',
    videoRetentionDays: 'Video retention days (days)',
    audioSwitch: 'Other settings',
    selectDevice: 'Select device',
    cameraIp: 'Camera IP',
    cameraPort: 'Camera port',
    sslStatus: 'Enable',
    sslCertFile: 'SSL certificate upload',
    httpsPort: 'HTTPS port number',
    sslKeyFile: 'SSL key upload',
    platform: 'Access platform',
    deviceSerial: 'Equipment serial number',
    platformIp: 'IP address',
    deviceName: 'Equipment name',
    listenPort: 'Listening port',
    password: 'Access code',
    basicConfiguration: 'Basic configuration',
    certificateConfiguration: 'Certificate configuration',
    accessPlatform: 'Third party access platform',
    channelList: 'Channel list',
    channelConfiguration: 'Channel configuration',
    splitScreenSetting: 'Split screen setting',
    allOn: 'All on',
    closeAll: 'close all',
    noEquipment: 'No equipment',
    fillInChannel: 'Please fill in the channel configuration',
    fillInBasic: 'Please fill in the basic configuration',
    selectedQuantity: 'The selected quantity cannot exceed',
    presetBitSetting: 'Preset bit setting',
    preset: 'Preset',
    enableOnvifProbe: 'Enable onvif probe',
    accessDetails: 'Passageway details',
  },
  // 设备地图
  equipmentMap: {
    addAttention: ' Add attention',
    changeGroup: 'Change group',
    collectSuccess: `Collect Success`,
    notGroup: 'Ungrouped',
    pleaseChoose: 'Please Frame Select first',
  },
  // 常用
  frequentlyUsed: {
    serialNumber: 'No.',
    operate: 'Operate',
    state: 'state',
    remarks: 'Remarks',
    incident: 'Event',
    add: 'Add',
    delete: 'Delete',
    confirmDelete: 'Confirm delete',
    enable: 'Enable',
    confirmEnable: 'Confirm enable',
    deactivation: 'Deactivation',
    confirmDeactivation: 'Confirm deactivation',
    edit: 'Edit',
    deleteSucceeded: 'Delete succeed',
    confirm: 'Confirm',
    cancel: 'Cancel',
    pass: 'Pass',
    noPass: 'No pass',
    submit: 'Submit',
    unit: 'unit',
    piece: 'piece',
    hour: 'hour',
    second: 'second',
    strategiesUse: 'Strategies in use',
    allStrategy: 'All strategies',
    open: 'Open',
    close: 'Close',
    executionCycle: 'Execution cycle',
    convenientEntrance: 'Convenient entrance',
    brightness: 'brightness',
    volume: 'volume',
    noPolicySelected: 'No policy selected',
    workOrder: 'Work order increment',
    equipmentStatus: 'Statistics of equipment status',
    reminder: 'Reminder',
    validity: 'Term of validity',
    page: 'page',
    strip: 'strip',
    common: 'common',
    currentNo: 'Current No',
    total: 'total',
    yes: 'Yes',
    no: 'No',
    select: 'Single choice',
    disabled: 'Disable',
    isEnable: 'Enable',
    openVolume: 'Open volume',
    closeVolume: 'Close volume',
    uploadTips: 'Please upload MP4, 3gp, JPG, GIF, BMP files',
    facilityList: 'Facility List',
    pleaseChoose: 'Please choose',
    switch: 'Switch',
    bitsAtMost: 'Input 255 bits at most!',
    operationSuccess: 'The operation was successful!',
    commandSuccessful: 'Command issued successfully!',
    failedCommand: 'Failed to issue command!',
    groupDetail: 'Group detail',
    apertureReduction: 'Aperture reduction',
    apertureAmplification: 'Aperture amplification',
    focusAdjustment: 'Pre focus adjustment',
    focusPostAdjustment: 'Focus post adjustment',
    focusBecomesSmaller: 'The focus becomes smaller',
    focusBecomesLarger: 'The focus becomes larger',
    upElectric: 'Power on',
    downElectric: 'Power down',
    goToPresetPosition: 'Go to preset position',
    selectChannel: 'Please select at least one channel',
    noPlayableChannel: 'No playable channel',
    notPermission: 'You do not have operation permission',
    playingVideo: 'Please select the video that is playing',
    firstVideo: 'Please play the video first',
    configurationAdded: 'Basic configuration added',
    isFirst: 'It\'s already the first one',
    isLast: 'It\'s the last one',
    tip: 'Tips',
  },
  // 报表分析
  reportAnalysis: {
    analysisTable: 'Statistics table',
    pleaseChooseWeek: 'Please Choose Week',
    pleaseChooseMonth: 'Please Choose Month',
    pleaseChooseYear: 'Please Choose Year',
    exportSuccess: 'Export Success',
    reportAnalysis: 'Report Analysis',
    electricCurrent: 'ElectricCurrent Report',
    voltage: 'Voltage Report',
    powerReport: 'Power Report',
    electricEnergy: 'ElectricEnergy Report',
    powerFactor: 'PowerFactor Report',
    electricityConsumptionReport: 'ElectricityConsumption Report',
    electricityConsumption: 'electricityConsumption (kw·h)',
    workingTimeReport: 'WorkingTime Report',
    workingTime: 'WorkingTime',
    lightingRate: 'LightingRate Report',
    energySavingRateReport: 'EnergySavingRate Report',
    energySavingRate: 'EnergySavingRate',
    equipmentType: 'Equipment Type',
    statisticalDimension: 'Statistical Dimension',
    statisticalScope: 'Statistical Scope',
    timeType: 'Time Type',
    area: 'Area',
    group: 'Group',
    equipment: 'Equipment',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    areaName: 'Area Name',
    groupName: 'Group Name',
    equipmentName: 'Equipment Name',
    time: 'Time',
    summaryGraph : 'Summary Graph ',
    inputCurrent: 'inputCurrent (A)',
    minInputCurrent: 'minInputCurrent (A)',
    maxInputCurrent: 'maxInputCurrent (A)',
    aEffectiveValueOfCurrent: 'aEffectiveValueOfCurrent (A)',
    bEffectiveValueOfCurrent: 'bEffectiveValueOfCurrent (A)',
    cEffectiveValueOfCurrent: 'cEffectiveValueOfCurrent (A)',
    minAEffectiveValueOfCurrent : 'minAEffectiveValueOfCurrent (A)',
    maxAEffectiveValueOfCurrent : 'maxAEffectiveValueOfCurrent (A)',
    minBEffectiveValueOfCurrent : 'minBEffectiveValueOfCurrent (A)',
    maxBEffectiveValueOfCurrent : 'maxBEffectiveValueOfCurrent (A)',
    minCEffectiveValueOfCurrent : 'minCEffectiveValueOfCurrent (A)',
    maxCEffectiveValueOfCurrent : 'maxCEffectiveValueOfCurrent (A)',
    //  A相电压有效值(V)
    aEffectiveValueOfVoltage : 'AEffectiveValueOfVoltage (V)',
    // B相电压有效值(V)
    bEffectiveValueOfVoltage: 'BEffectiveValueOfVoltage (V)',
    //  C相电压有效值(V)
    cEffectiveValueOfVoltage : 'CEffectiveValueOfVoltage (V)',
    // AB相电压有效值(V)
    abEffectiveValueOfVoltage : 'abEffectiveValueOfVoltage (V)',
    // BC相电压有效值(V)
    bcEffectiveValueOfVoltage : 'bcEffectiveValueOfVoltage (V)',
    // CA相电压有效值(V)
    caEffectiveValueOfVoltage : 'caEffectiveValueOfVoltage (V)',
    // 最小A相电压有效值
    minAEffectiveValueOfVoltage : 'minAEffectiveValueOfVoltage (V)',
    // 最大A相电压有效值
    maxAEffectiveValueOfVoltage : 'maxAEffectiveValueOfVoltage (V)',
    // 最小B相电压有效值
    minBEffectiveValueOfVoltage : 'minBEffectiveValueOfVoltage (V)',
    // 最大B相电压有效值
    maxBEffectiveValueOfVoltage : 'maxBEffectiveValueOfVoltage (V)',
    // 最小C相电压有效值
    minCEffectiveValueOfVoltage : 'minCEffectiveValueOfVoltage (V)',
    // 最大C相电压有效值
    maxCEffectiveValueOfVoltage : 'maxCEffectiveValueOfVoltage (V)',
    // 最小AB线电压
    minABEffectiveValueOfVoltage : 'minABEffectiveValueOfVoltage (V)',
    // 最大AB线电压
    maxABEffectiveValueOfVoltage : 'maxABEffectiveValueOfVoltage (V)',
    // 最小BC线电压
    minBCEffectiveValueOfVoltage : 'minBCEffectiveValueOfVoltage (V)',
    // 最大BC线电压
    maxBCEffectiveValueOfVoltage : 'maxBCEffectiveValueOfVoltage (V)',
    // 最小CA线电压
    minCAEffectiveValueOfVoltage : 'minCAEffectiveValueOfVoltage (V)',
    // 最大CA线电压
    maxCAEffectiveValueOfVoltage : 'maxCAEffectiveValueOfVoltage (V)',
    // 功率
    power : 'power (kw)',
    // 最小功率
    minPower : 'minPower (kw)',
    // 最大功率
    maxPower : 'maxPower (kw)',
    // 瞬时总有功功率
    activePower : 'activePower (kw)',
    // 瞬时A相有功功率
    aActivePower : 'AActivePower (kw)',
    // 瞬时B相有功功率
    bActivePower : 'BActivePower (kw)',
    // 瞬时C相有功功率
    cActivePower : 'CActivePower (kw)',
    // 瞬时总无功功率
    reactivePower : 'reactivePower (kw)',
    // 瞬时A相无功功率
    aReactivePower : 'AReactivePower (kw)',
    // 瞬时B相无功功率
    bReactivePower : 'BReactivePower (kw)',
    // 瞬时C相无功功率
    cReactivePower : 'CReactivePower (kw)',
    // 最小瞬时总有功功率
    minActivePower : 'minActivePower (kw)',
    // 最大瞬时总有功功率
    maxActivePower : 'maxActivePower (kw)',
    // 最小瞬时A相有相功率 (kw)
    minAActivePower : 'minAActivePower (kw)',
    // 最大瞬时A相有相功率(kw)
    maxAActivePower : 'maxAActivePower (kw)',
    // 最小瞬时B相有功功率
    minBActivePower : 'minBActivePower率 (kw)',
    // 最大瞬时B相有功功率
    maxBActivePower : 'maxBActivePower (kw)',
    // 最小瞬时C相有功功率
    minCActivePower : 'minCActivePower (kw)',
    // 最大瞬时C相有功功率
    maxCActivePower : 'maxCActivePower (kw)',
    // 最小瞬时总无功功率
    minReactivePower : 'minReactivePower (kw)',
    // 最大瞬时总无功功率
    maxReactivePower : 'maxReactivePower (kw)',
    // 最小瞬时A相无功功率
    minAReactivePower : 'minAReactivePower (kw)',
    // 最小瞬时A相无功功率
    maxAReactivePower : 'maxAReactivePower (kw)',
    // 最小瞬时B相无功功率
    minBReactivePower : 'minBReactivePower (kw)',
    // 最大瞬时B相无功功率
    maxBReactivePower : 'maxBReactivePower (kw)',
    // 最小瞬时C相无功功率
    minCReactivePower : 'minCReactivePower (kw)',
    // 最大瞬时C相无功功率
    maxCReactivePower : 'maxCReactivePower (kw)',
    // 电能
    energy : 'energy (kw·h)',
    // 总相正向有功电能量
    activeElectricEnergy : 'ActiveElectricEnergy (kw·h)',
    // A相正向有功电能量
    aActiveElectricEnergy : 'AActiveElectricEnergy (kw·h)',
    // B相正向有功电能量
    bActiveElectricEnergy : 'BActiveElectricEnergy (kw·h)',
    // C相正向有功电能量
    CActiveElectricEnergy : 'CActiveElectricEnergy (kw·h)',
    // 总正向无功电能量
    reactiveEnergy : 'ReactiveEnergy (kw·h)',
    // A相正向无功电能量
    aReactiveEnergy : 'AReactiveEnergy (kw·h)',
    // B相正向无功电能量
    BReactiveEnergy : 'BReactiveEnergy (kw·h)',
    // C相正向无功电能量
    CReactiveEnergy : 'CReactiveEnergy (kw·h)',
    // 瞬时总相功率因数
    PowerFactor : 'PowerFactor',
    // 瞬时A相功率因数
    APowerFactor : 'APowerFactor',
    // 瞬时B相功率因数
    BPowerFactor : 'BPowerFactor',
    // 瞬时C相功率因数
    CPowerFactor : 'CPowerFactor',
    // 最小瞬时总相功率因数
    minPowerFactor : 'minPowerFactor',
    // 最大瞬时总相功率因数
    maxPowerFactor : 'maxPowerFactor',
    // 最小瞬时A相功率因数
    minAPowerFactor : 'minAPowerFactor',
    // 最大瞬时A相功率因数
    maxAPowerFactor : 'maxAPowerFactor',
    // 最小瞬时B相功率因数
    minBPowerFactor : 'minBPowerFactor',
    // 最大瞬时B相功率因数
    maxBPowerFactor : 'maxBPowerFactor',
    // 最小瞬时C相功率因数
    minCPowerFactor : 'minCPowerFactor',
    // 最大瞬时C相功率因数
    maxCPowerFactor : 'maxCPowerFactor',
    workingHours: 'Working Hours (s)',
    lightingRateUnit: 'lighting Rate (%)',
    energySavingRateUnit: 'EnergySaving Rate (%)',
  }
};

